"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function InteractiveMascot() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || touchDevice) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    const trail = Array.from({ length: 4 }, () => ({ ...target }));
    let frameId = 0;
    let clickTimeout = 0;
    let leaveTimeout = 0;
    let lastMove = performance.now();

    const setCursorState = (state: "normal" | "hover" | "moving" | "click" | "loading") => {
      cursor.dataset.state = state;
    };

    const handlePointerMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      lastMove = performance.now();
      cursor.classList.add("is-ready");
      document.documentElement.classList.add("neon-cursor-enabled");

      const hovered = document.elementFromPoint(event.clientX, event.clientY);
      const interactive = hovered?.closest("a, button, [role='button'], input, textarea, select");
      if (interactive) {
        setCursorState("hover");
        ring.classList.add("is-hovering");
      } else {
        setCursorState(performance.now() - lastMove < 80 ? "moving" : "normal");
        ring.classList.remove("is-hovering");
      }

      if (leaveTimeout) window.clearTimeout(leaveTimeout);
    };

    const handlePointerDown = () => {
      setCursorState("click");
      ring.classList.add("is-clicking");
      if (clickTimeout) window.clearTimeout(clickTimeout);
      clickTimeout = window.setTimeout(() => {
        ring.classList.remove("is-clicking");
        setCursorState("normal");
      }, 320);
    };

    const handlePointerLeave = () => {
      leaveTimeout = window.setTimeout(() => cursor.classList.remove("is-ready"), 80);
      document.documentElement.classList.remove("neon-cursor-enabled");
    };

    const handlePointerEnter = () => {
      if (leaveTimeout) window.clearTimeout(leaveTimeout);
      cursor.classList.add("is-ready");
      document.documentElement.classList.add("neon-cursor-enabled");
    };

    const handleLoadingStart = () => setCursorState("loading");
    const handleLoadingEnd = () => setCursorState("normal");

    const animate = () => {
      current.x += (target.x - current.x) * 0.38;
      current.y += (target.y - current.y) * 0.38;

      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      trail.forEach((point, index) => {
        const source = index === 0 ? current : trail[index - 1];
        point.x += (source.x - point.x) * (0.22 - index * 0.035);
        point.y += (source.y - point.y) * (0.22 - index * 0.035);
        trailRefs.current[index]?.style.setProperty(
          "transform",
          `translate3d(${point.x - current.x}px, ${point.y - current.y}px, 0)`,
        );
      });

      if (performance.now() - lastMove > 120 && cursor.dataset.state === "moving") {
        setCursorState("normal");
      }

      frameId = window.requestAnimationFrame(animate);
    };

    cursor.dataset.state = "normal";
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.documentElement.addEventListener("mouseenter", handlePointerEnter);
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("beforeunload", handleLoadingStart);
    window.addEventListener("load", handleLoadingEnd);

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      if (clickTimeout) window.clearTimeout(clickTimeout);
      if (leaveTimeout) window.clearTimeout(leaveTimeout);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.documentElement.removeEventListener("mouseenter", handlePointerEnter);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("beforeunload", handleLoadingStart);
      window.removeEventListener("load", handleLoadingEnd);
      document.documentElement.classList.remove("neon-cursor-enabled");
    };
  }, []);

  return (
    <div ref={cursorRef} className="neon-cursor" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          ref={(node) => { trailRefs.current[index] = node; }}
          className={`neon-cursor-trail neon-cursor-trail-${index + 1}`}
        />
      ))}
      <div ref={ringRef} className="neon-cursor-ring" />
      <Image
        className="neon-cursor-sprite"
        src="/neon-cursor-pointer.png"
        alt=""
        width={395}
        height={490}
        draggable={false}
      />
    </div>
  );
}
