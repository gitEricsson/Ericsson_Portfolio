"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Preloader from "./Preloader";
import Cursor from "./Cursor";
import Nav from "./Nav";
import Hud from "./Hud";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1 });
    scrollState.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, [reduced]);

  return (
    <>
      <Preloader />
      <Cursor />
      <Nav />
      <Hud />
      <main>{children}</main>
    </>
  );
}
