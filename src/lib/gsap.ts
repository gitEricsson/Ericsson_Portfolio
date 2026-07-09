import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
  // Mobile address bars show/hide constantly, changing innerHeight. Without
  // this, every toolbar shift recomputes trigger positions and nudges
  // scroll-scrubbed values (like the hero dissolve) off their resting point.
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (process.env.NODE_ENV !== "production") {
    const w = window as unknown as Record<string, unknown>;
    w.__gsap = gsap;
    w.__ST = ScrollTrigger;
  }
}

/** Character set for readout scramble effects. Ikeda-adjacent. */
export const SCRAMBLE_CHARS = "01<>/\\|=+-#";

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP };
