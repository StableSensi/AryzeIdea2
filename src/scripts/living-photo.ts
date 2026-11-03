/**
 * Behaviour for every [data-living-photo] overlay (see LivingPhoto.astro).
 *
 * A photo plays only while it is in view, the tab is visible, motion is
 * allowed, the visitor has not paused it and the video has not failed.
 * The video fades in (data-shown) only after its first frame is presented.
 * data-running mirrors actual playback so the light pulses pause with it.
 */
const FEEDBACK_MS = 500;
/** Fallback wait for the first presented frame when requestVideoFrameCallback exists. */
const FIRST_FRAME_FALLBACK_MS = 250;
/** The office clip is recorded slowly and plays back at 4×. */
const PLAYBACK_RATES: Record<string, number> = { '/videos/office-living-60fps.mp4': 4 };

const teardowns = new Map<HTMLElement, () => void>();

function setup(root: HTMLElement) {
  const video = root.querySelector('video');
  const toggle = root.querySelector<HTMLButtonElement>('.lp-toggle');
  const feedback = root.querySelector<HTMLElement>('.lp-feedback');
  if (!video || !toggle || !feedback) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const opts = { signal: abort.signal };

  let inView = false;
  let pausedByUser = false;
  let failed = false;
  let playPending = false;
  let destroyed = false;
  let shown = false;
  let revealToken = 0;
  let revealTimer = 0;
  let feedbackAnimation: Animation | undefined;

  const shouldPlay = () =>
    !destroyed && inView && !document.hidden && !reducedMotion.matches && !pausedByUser && !failed;

  const updateLabel = () =>
    toggle.setAttribute('aria-label', pausedByUser ? 'Resume photo animation' : 'Pause photo animation');

  const setRunning = (running: boolean) => root.toggleAttribute('data-running', running);

  function cancelReveal() {
    revealToken++;
    clearTimeout(revealTimer);
  }

  /** Cross-fade the video in once a decoded frame is actually on screen. */
  function revealWhenPresented() {
    if (shown) return;
    cancelReveal();
    const token = revealToken;
    const reveal = () => {
      if (token !== revealToken) return;
      cancelReveal();
      if (destroyed || failed || reducedMotion.matches) return;
      shown = true;
      root.setAttribute('data-shown', '');
      updateLabel();
      toggle!.hidden = false;
    };
    const hasFrameCallback = 'requestVideoFrameCallback' in video!;
    if (hasFrameCallback) video!.requestVideoFrameCallback(reveal);
    revealTimer = window.setTimeout(reveal, hasFrameCallback ? FIRST_FRAME_FALLBACK_MS : 0);
  }

  /** Back to the plain still photograph. */
  function hide() {
    cancelReveal();
    shown = false;
    setRunning(false);
    root.removeAttribute('data-shown');
    video!.hidden = true;
    toggle!.hidden = true;
    feedbackAnimation?.cancel();
  }

  function flashFeedback(icon: 'pause' | 'play') {
    if (typeof feedback!.animate !== 'function') return;
    feedback!.dataset.icon = icon;
    feedbackAnimation?.cancel();
    feedbackAnimation = feedback!.animate(
      [
        { opacity: 0, transform: 'scale(.84)' },
        { opacity: 0.95, transform: 'scale(1)', offset: 0.3 },
        { opacity: 0, transform: 'scale(1.06)' },
      ],
      { duration: FEEDBACK_MS, easing: 'ease-out' },
    );
  }

  /** Bring playback in line with shouldPlay(). */
  function sync() {
    if (!shouldPlay()) {
      video!.pause();
      setRunning(false);
      if (failed || reducedMotion.matches || destroyed) hide();
      // Reduced motion: drop the source so nothing more is downloaded.
      if (reducedMotion.matches && video!.hasAttribute('src')) {
        video!.removeAttribute('src');
        video!.load();
      }
      return;
    }
    if (playPending || !video!.paused) return;

    const src = root.dataset.videoSrc!;
    if (!video!.hasAttribute('src')) video!.src = src;
    video!.muted = true;
    const rate = PLAYBACK_RATES[src] ?? 1;
    video!.defaultPlaybackRate = rate;
    video!.playbackRate = rate;
    video!.hidden = false;
    playPending = true;
    video!
      .play()
      .catch((error: DOMException) => {
        if (!destroyed && error.name !== 'AbortError') {
          failed = true;
          hide();
        }
      })
      .finally(() => {
        playPending = false;
        if (shouldPlay() && video!.paused && !failed) sync();
      });
  }

  video.addEventListener(
    'playing',
    () => {
      if (!shouldPlay()) {
        sync();
        return;
      }
      setRunning(true);
      revealWhenPresented();
    },
    opts,
  );
  video.addEventListener('pause', () => setRunning(false), opts);
  video.addEventListener('waiting', () => setRunning(false), opts);
  video.addEventListener(
    'error',
    () => {
      failed = true;
      sync();
    },
    opts,
  );
  toggle.addEventListener(
    'click',
    () => {
      pausedByUser = !pausedByUser;
      updateLabel();
      flashFeedback(pausedByUser ? 'pause' : 'play');
      sync();
    },
    opts,
  );
  reducedMotion.addEventListener('change', sync, opts);
  document.addEventListener('visibilitychange', sync, opts);

  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          sync();
        })
      : null;

  teardowns.set(root, () => {
    destroyed = true;
    observer?.disconnect();
    abort.abort();
    hide();
    video.pause();
    video.removeAttribute('src');
    video.load();
  });

  if (observer) observer.observe(root);
  else {
    inView = true;
    sync();
  }
}

export function initLivingPhotos() {
  document.querySelectorAll<HTMLElement>('[data-living-photo]').forEach((root) => {
    if (!teardowns.has(root)) setup(root);
  });
}

export function destroyLivingPhotos() {
  teardowns.forEach((teardown) => teardown());
  teardowns.clear();
}
