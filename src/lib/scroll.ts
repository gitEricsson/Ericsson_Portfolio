import type Lenis from "lenis";

/** Singleton handle so any component can drive smooth scroll. */
export const scrollState: { lenis: Lenis | null } = { lenis: null };

export function scrollToSection(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  if (scrollState.lenis) {
    scrollState.lenis.scrollTo(target, { duration: 1.4 });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}
