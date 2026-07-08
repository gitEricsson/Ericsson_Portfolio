import Hero from "@/components/chapters/hero/Hero";
import Manifesto from "@/components/chapters/manifesto/Manifesto";
import Experience from "@/components/chapters/experience/Experience";
import Works from "@/components/chapters/works/Works";
import StackBand from "@/components/chapters/stack/StackBand";
import Lens from "@/components/chapters/lens/Lens";
import Signal from "@/components/chapters/signal/Signal";

export default function Home() {
  return (
    <div id="top">
      <Hero />
      {/* One stacking context above the sticky hero plate. */}
      <div className="relative z-10">
        <Manifesto />
        <Experience />
        <Works />
        <StackBand />
        <Lens />
        <Signal />
      </div>
    </div>
  );
}
