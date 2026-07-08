"use client";

import { Canvas } from "@react-three/fiber";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  camera?: ComponentProps<typeof Canvas>["camera"];
  frameloop?: ComponentProps<typeof Canvas>["frameloop"];
};

/**
 * Lazy R3F canvas: mounts only near the viewport, unmounts when far away,
 * caps DPR. Every chapter scene goes through this.
 */
export default function SectionCanvas({
  children,
  className,
  camera,
  frameloop,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "300px 0px 300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      {visible && (
        <Canvas
          camera={camera}
          frameloop={frameloop}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
