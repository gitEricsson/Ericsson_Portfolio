"use client";

import SectionCanvas from "@/components/shared/SectionCanvas";
import IdentityField, { type HeroHandles } from "./IdentityField";

/**
 * The WebGL half of the hero, split out so it can be dynamically imported
 * (ssr: false). Keeping three.js out of the first paint lets the DOM name
 * render instantly and become the fast, reliable base layer.
 */
export default function HeroCanvas({
  handles,
  demand,
  onOutcome,
}: {
  handles: HeroHandles;
  demand: boolean;
  onOutcome: (ok: boolean) => void;
}) {
  return (
    <SectionCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 10], fov: 50 }}
      frameloop={demand ? "demand" : "always"}
    >
      <IdentityField handles={handles} onOutcome={onOutcome} />
    </SectionCanvas>
  );
}
