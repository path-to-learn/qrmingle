const RESET_DELAYS = [0, 50, 150, 350, 700];

export function resetHorizontalScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.scrollTo(0, window.scrollY);

  const elements = new Set<Element>();
  [
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.getElementById("root"),
  ].forEach((element) => {
    if (element) elements.add(element);
  });

  document
    .querySelectorAll("main, .main-content, .bottom-tab-bar, [data-horizontal-lock]")
    .forEach((element) => elements.add(element));

  elements.forEach((element) => {
    if ("scrollLeft" in element) {
      (element as HTMLElement).scrollLeft = 0;
    }
  });
}

export function scheduleHorizontalReset(delays = RESET_DELAYS) {
  resetHorizontalScroll();
  delays.forEach((delay) => {
    window.setTimeout(resetHorizontalScroll, delay);
  });
}
