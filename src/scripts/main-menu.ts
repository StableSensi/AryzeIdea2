/**
 * Main menu behaviour for the header's <details id="main-menu">.
 *
 * - Above 1000px the menu is always open (desktop nav); at or below it is the
 *   collapsible mobile menu.
 * - Only one .nav-dropdown is open at a time.
 * - Clicking outside closes the dropdowns (and the mobile menu).
 * - Moving keyboard focus out of the menu closes it; moving focus between
 *   items closes dropdowns that no longer contain focus (but not while a
 *   primary mouse button is pressed, so clicking a summary does not fight
 *   with focusout).
 * - Escape closes the open dropdown (or the mobile menu) and returns focus to
 *   its summary.
 * - All listeners are removed before a ClientRouter swap, and the function is
 *   safe to call repeatedly (it marks the menu with data-ready).
 */
const MOBILE_QUERY = '(max-width: 1000px)';

export function initMainMenu(): void {
  const menu = document.querySelector<HTMLDetailsElement>('#main-menu');
  if (!menu || menu.dataset.ready) return;
  menu.dataset.ready = 'true';

  const mobile = matchMedia(MOBILE_QUERY);
  const syncToViewport = () => {
    menu.open = !mobile.matches;
  };
  syncToViewport();
  mobile.addEventListener('change', syncToViewport);

  const dropdowns = Array.from(menu.querySelectorAll<HTMLDetailsElement>('.nav-dropdown'));
  dropdowns.forEach((dropdown) =>
    dropdown.addEventListener('toggle', () => {
      if (!dropdown.open) return;
      dropdowns.forEach((other) => {
        if (other !== dropdown) other.open = false;
      });
    }),
  );

  const isInside = (container: Element, target: EventTarget | null) =>
    target instanceof Node && container.contains(target);

  const closeAll = () => {
    dropdowns.forEach((d) => (d.open = false));
    if (mobile.matches) menu.open = false;
  };

  let primaryPointerDown = false;
  const onPointerDown = (event: PointerEvent) => {
    primaryPointerDown = event.button === 0;
  };
  const resetPointer = () => {
    primaryPointerDown = false;
  };

  const onDocumentClick = (event: MouseEvent) => {
    resetPointer();
    if (!isInside(menu, event.target)) closeAll();
  };

  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node)) return;
    if (!menu.contains(next)) {
      closeAll();
      return;
    }
    if (primaryPointerDown) return;
    dropdowns.forEach((d) => {
      if (d.open && !d.contains(next)) d.open = false;
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    resetPointer();
    if (event.key !== 'Escape') return;
    const openDropdown = dropdowns.find((d) => d.open);
    if (openDropdown) {
      openDropdown.open = false;
      openDropdown.querySelector('summary')?.focus();
    } else if (mobile.matches && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  };

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeyDown);
  menu.addEventListener('focusout', onFocusOut);
  menu.addEventListener('pointerdown', onPointerDown);
  menu.addEventListener('pointercancel', resetPointer);

  document.addEventListener(
    'astro:before-swap',
    () => {
      mobile.removeEventListener('change', syncToViewport);
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
      menu.removeEventListener('focusout', onFocusOut);
      menu.removeEventListener('pointerdown', onPointerDown);
      menu.removeEventListener('pointercancel', resetPointer);
    },
    { once: true },
  );
}
