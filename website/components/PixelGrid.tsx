"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const CURSOR_RADIUS = 150;
const FOOTER_FADE_HEIGHT = 56;

type Pixel = {
  x: number;
  y: number;
  value: number;
  target: number;
};

export function PixelGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const canInteract = !window.matchMedia(
      "(prefers-reduced-motion: reduce), (hover: none)",
    ).matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let staticDrawFrame = 0;
    let pendingPointerUpdate = false;
    let pointer = { x: -9999, y: -9999 };
    let pixels: Pixel[] = [];
    let footer: HTMLElement | null = null;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      pixels = [];
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          pixels.push({ x, y, value: 0, target: 0 });
        }
      }
    };

    const footerResizeObserver = new ResizeObserver(resize);

    const connectFooterObserver = () => {
      const nextFooter = document.getElementById("site-footer");
      if (nextFooter === footer) return;

      footerResizeObserver.disconnect();
      footer = nextFooter;
      if (footer) footerResizeObserver.observe(footer);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const footerTop = footer?.getBoundingClientRect().top ?? height;
      const fadeStart = footerTop - FOOTER_FADE_HEIGHT;
      const pointerIsAboveFooter = pointer.y < footerTop;

      for (const pixel of pixels) {
        if (pixel.y >= footerTop) {
          pixel.target = 0;
          pixel.value += (pixel.target - pixel.value) * 0.12;
          continue;
        }

        if (canInteract && pointerIsAboveFooter) {
          const distance = Math.hypot(pixel.x - pointer.x, pixel.y - pointer.y);
          pixel.target =
            distance < CURSOR_RADIUS ? 1 - distance / CURSOR_RADIUS : 0;
        } else {
          pixel.target = 0;
        }

        if (canInteract) {
          pixel.value += (pixel.target - pixel.value) * 0.12;
        }

        const size = 2 + pixel.value * 3;
        const footerFade = Math.min(
          1,
          Math.max(0, (footerTop - pixel.y) / FOOTER_FADE_HEIGHT),
        );
        const opacity = (0.07 + pixel.value * 0.78) *
          (pixel.y > fadeStart ? footerFade : 1);
        context.fillStyle = `rgba(26, 192, 173, ${opacity})`;
        context.fillRect(pixel.x - size / 2, pixel.y - size / 2, size, size);
      }

      if (canInteract) frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: MouseEvent) => {
      if (pendingPointerUpdate) return;
      pendingPointerUpdate = true;
      requestAnimationFrame(() => {
        pointer = { x: event.clientX, y: event.clientY };
        pendingPointerUpdate = false;
      });
    };

    const onPointerLeave = () => {
      pointer = { x: -9999, y: -9999 };
    };

    const refreshStaticGrid = () => {
      if (canInteract || staticDrawFrame) return;
      staticDrawFrame = requestAnimationFrame(() => {
        staticDrawFrame = 0;
        draw();
      });
    };

    const pageResizeObserver = new ResizeObserver(resize);
    pageResizeObserver.observe(document.body);
    const footerMutationObserver = new MutationObserver(connectFooterObserver);
    footerMutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", refreshStaticGrid, { passive: true });

    if (canInteract) {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      window.addEventListener("blur", onPointerLeave);
    }

    connectFooterObserver();
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(staticDrawFrame);
      pageResizeObserver.disconnect();
      footerResizeObserver.disconnect();
      footerMutationObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", refreshStaticGrid);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
