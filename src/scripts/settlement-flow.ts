/**
 * <aryze-settlement-flow> custom element (markup in SettlementFlow.astro).
 *
 * Flow of one illustration ("play"):
 *   0 ms     stage 0 "<FROM> burned": source coin is burned, input is replaced by a draining figure
 *   1800 ms  stage 1 "Recorded": amounts count across over 3 s (ease-in-out cubic)
 *   3300 ms  stage 2 "<TO> minted": destination coin is minted
 *   5400 ms  complete: result shown, source at 0.00, "Edit amount" offered
 * Reduced motion jumps straight to the completed state.
 *
 * It auto-plays once when ≥60 % visible, and again shortly after the amount
 * or currency changes. Works across ClientRouter swaps because all wiring
 * happens in connectedCallback and is torn down in disconnectedCallback.
 */

type ParseResult = { cents: number; error?: undefined } | { error: string; cents?: undefined };

const MAX_CENTS = 99_999_999;

/** Parse "100.50", "100,50", "1,000.50", "1.000,50" or "1 000,50" into cents. */
export function parseAmount(raw: string): ParseResult {
  const text = raw.trim().replace(/[  ]/g, ' ');
  if (!text) return { error: 'Enter an amount to convert.' };

  let normalised: string;
  if (/^\d+(?:[.,]\d{1,2})?$/.test(text)) normalised = text.replace(',', '.');
  else if (/^[1-9]\d{0,2}(?:,\d{3})+(?:\.\d{1,2})?$/.test(text)) normalised = text.replaceAll(',', '');
  else if (/^[1-9]\d{0,2}(?:\.\d{3})+,\d{1,2}$/.test(text)) normalised = text.replaceAll('.', '').replace(',', '.');
  else if (/^[1-9]\d{0,2}(?: \d{3})+(?:[.,]\d{1,2})?$/.test(text))
    normalised = text.replaceAll(' ', '').replace(',', '.');
  else return { error: 'Use 100.50, 100,50 or grouped 1,000.50 / 1.000,50.' };

  const [whole, fraction = ''] = normalised.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents > MAX_CENTS) return { error: 'Maximum amount: 999,999.99.' };
  if (cents <= 0) return { error: 'Enter an amount greater than zero.' };
  return { cents };
}

const symbolFor = (currency: string) => (currency === 'EUR' ? '€' : '£');
const formatCents = (cents: number) =>
  new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);

class SettlementFlow extends HTMLElement {
  static nextId = 0;
  cleanup?: () => void;

  connectedCallback() {
    const forge = this.querySelector<HTMLButtonElement>('.forge');
    if (!forge) return;
    this.cleanup?.();

    const abort = new AbortController();
    const opts = { signal: abort.signal };
    const q = <T extends Element>(sel: string) => this.querySelector<T>(sel)!;

    this.querySelectorAll<HTMLButtonElement | HTMLSelectElement | HTMLInputElement>('button,select,input').forEach(
      (el) => (el.disabled = false),
    );

    const from = q<HTMLSelectElement>('.from');
    const to = q<HTMLSelectElement>('.to');
    const input = q<HTMLInputElement>('.amount');
    const result = q<HTMLOutputElement>('.result');
    const drain = q<HTMLOutputElement>('.drain');
    const amountLine = drain.closest('.amount-line')!;
    const editButton = q<HTMLButtonElement>('.edit-amount');
    const editLine = q<HTMLElement>('.edit-line');
    const errorEl = q<HTMLElement>('.amount-error');
    errorEl.id = `settlement-amount-error-${++SettlementFlow.nextId}`;
    input.setAttribute('aria-describedby', errorEl.id);
    const phase = q<HTMLElement>('.phase');
    const status = q<HTMLElement>('.status');

    const rate = Number(this.dataset.rate) || 1.18;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const directionalRate = () => (from.value === 'GBP' ? rate : 1 / rate);

    let autoplayDone = false;
    let timers: number[] = [];
    let frame = 0;
    let replayTimer: number | undefined;
    let visibleTimer: number | undefined;
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    /** Validate the input, show/hide the error, return cents or undefined. */
    const readAmount = () => {
      const parsed = parseAmount(input.value);
      errorEl.textContent = parsed.error || '';
      errorEl.hidden = !parsed.error;
      input.setAttribute('aria-invalid', String(!!parsed.error));
      return parsed.cents;
    };

    const clearResult = () => {
      result.textContent = '—';
      result.classList.remove('counting', 'stale');
      result.classList.add('empty');
      this.classList.add('ready');
    };

    /** Stage labels follow the direction: source burned, recorded, destination minted. */
    const labelStages = () => {
      q('[data-stage="0"]').textContent = `${from.value} burned`;
      q('[data-stage="1"]').textContent = 'Recorded';
      q('[data-stage="2"]').textContent = `${to.value} minted`;
      forge.title = `Play: ${from.value} burned, recorded, ${to.value} minted`;
    };

    /** Stop any running illustration and restore the idle controls. */
    const reset = () => {
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(frame);
      clearTimeout(replayTimer);
      forge.classList.remove('running', 'complete');
      forge.removeAttribute('aria-busy');
      forge.setAttribute('aria-label', `Play the conversion from ${from.value} to ${to.value}`);
      labelStages();
      delete phase.dataset.active;
      amountLine.classList.remove('draining', 'drained');
      input.hidden = false;
      drain.hidden = true;
      editLine.hidden = true;
    };

    /** The visitor has interacted: stop waiting for the in-view autoplay. */
    const cancelAutoplay = () => {
      autoplayDone = true;
      visibility.disconnect();
      clearTimeout(visibleTimer);
    };

    const play = () => {
      cancelAutoplay();
      reset();
      clearResult();
      status.textContent = '';
      const sourceCents = readAmount();
      if (sourceCents === undefined) return;

      const targetCents = Math.round(sourceCents * directionalRate());
      this.classList.toggle('large-amount', Math.max(sourceCents, targetCents) >= 10_000_000);
      const summary = `${symbolFor(from.value)}${formatCents(sourceCents)} becomes ${symbolFor(to.value)}${formatCents(targetCents)} at the example rate`;
      const inputHadFocus = document.activeElement === input;

      input.hidden = true;
      drain.hidden = false;
      drain.textContent = formatCents(sourceCents);
      amountLine.classList.add('draining');
      editLine.hidden = false;
      if (inputHadFocus) editButton.focus({ preventScroll: true });

      const complete = () => {
        drain.textContent = formatCents(0);
        amountLine.classList.add('drained');
        result.textContent = formatCents(targetCents);
        result.classList.remove('empty', 'counting');
        this.classList.remove('ready');
        forge.classList.remove('running');
        forge.classList.add('complete');
        forge.removeAttribute('aria-busy');
        delete phase.dataset.active;
        forge.setAttribute('aria-label', `Replay the conversion from ${from.value} to ${to.value}`);
        forge.title = 'Replay conversion';
        status.textContent = `Preview complete: ${summary}. Remaining ${symbolFor(from.value)}0.00. No transaction was made. Edit amount to start again, or replay.`;
      };

      if (reducedMotion.matches) {
        complete();
        return;
      }

      forge.classList.add('running');
      forge.setAttribute('aria-busy', 'true');
      phase.dataset.active = '0';
      this.classList.remove('ready');
      status.textContent = `Illustration: ${from.value} burned, the conversion recorded, ${to.value} minted. ${summary}. No transaction.`;

      later(() => {
        phase.dataset.active = '1';
        result.classList.remove('empty');
        result.classList.add('counting');
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 3000);
          const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          drain.textContent = formatCents(Math.round(sourceCents * (1 - eased)));
          result.textContent = formatCents(Math.round(targetCents * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
          else amountLine.classList.add('drained');
        };
        frame = requestAnimationFrame(tick);
      }, 1800);
      later(() => {
        phase.dataset.active = '2';
      }, 3300);
      later(complete, 5400);
    };

    const editAmount = () => {
      cancelAutoplay();
      reset();
      clearResult();
      status.textContent = 'Edit the amount to start a new illustration.';
      input.focus();
      input.select();
    };

    /** Update flags, symbols and rate text after a currency change, then replay. */
    const onCurrencyChange = () => {
      cancelAutoplay();
      reset();
      const fromGbp = from.value === 'GBP';
      q('.from-flag').textContent = fromGbp ? '🇬🇧' : '🇪🇺';
      q('.to-flag').textContent = fromGbp ? '🇪🇺' : '🇬🇧';
      q('.source-symbol').textContent = symbolFor(from.value);
      q('.destination-symbol').textContent = symbolFor(to.value);
      q('.from-sym').textContent = symbolFor(from.value);
      q('.to-sym').textContent = symbolFor(to.value);
      q('.rate-text').textContent = `${symbolFor(from.value)}1 = ${symbolFor(to.value)}${directionalRate().toFixed(2)}`;
      labelStages();
      status.textContent = '';
      clearResult();
      if (readAmount() !== undefined) replayTimer = window.setTimeout(play, 600);
    };

    forge.addEventListener('click', () => {
      if (!forge.classList.contains('running')) play();
    }, opts);
    editButton.addEventListener('click', editAmount, opts);
    input.addEventListener(
      'input',
      () => {
        cancelAutoplay();
        reset();
        clearResult();
        status.textContent = '';
        if (readAmount() !== undefined) replayTimer = window.setTimeout(play, 900);
      },
      opts,
    );
    input.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          play();
        }
      },
      opts,
    );
    input.addEventListener(
      'blur',
      () => {
        const cents = readAmount();
        if (cents !== undefined) input.value = formatCents(cents);
      },
      opts,
    );
    from.addEventListener(
      'change',
      () => {
        to.value = from.value === 'EUR' ? 'GBP' : 'EUR';
        onCurrencyChange();
      },
      opts,
    );
    to.addEventListener(
      'change',
      () => {
        from.value = to.value === 'EUR' ? 'GBP' : 'EUR';
        onCurrencyChange();
      },
      opts,
    );

    // Autoplay once, 400 ms after the widget is at least 60 % in view.
    const visibility = new IntersectionObserver(
      (entries) => {
        if (autoplayDone) return;
        clearTimeout(visibleTimer);
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.6)) {
          visibleTimer = window.setTimeout(play, 400);
        }
      },
      { threshold: 0.6 },
    );

    reset();
    clearResult();
    visibility.observe(this);

    this.cleanup = () => {
      abort.abort();
      visibility.disconnect();
      clearTimeout(visibleTimer);
      reset();
    };
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

if (!customElements.get('aryze-settlement-flow')) customElements.define('aryze-settlement-flow', SettlementFlow);
