import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

interface ThreeDParallaxProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  /*
   * How much the content responds
   * to mouse movement.
   */
  intensity?: number;

  /*
   * Extra depth given to the content.
   */
  depth?: number;
}

export default function ThreeDParallax({
  children,
  className = "",
  style = {},
  intensity = 10,
  depth = 0,
}: ThreeDParallaxProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const target = useRef({
    x: 0,
    y: 0,
  });

  const current = useRef({
    x: 0,
    y: 0,
  });

  const animationFrame =
    useRef<number | null>(null);

  /*
   * Apply the transform directly to the DOM.
   *
   * This avoids React re-rendering every
   * time the mouse moves.
   */
  const updateTransform = (
    x: number,
    y: number
  ) => {
    const element =
      containerRef.current;

    if (!element) return;

    element.style.transform = `
      perspective(1600px)
      translate3d(${x}px, ${y}px, ${depth}px)
    `;
  };

  /*
   * Smooth parallax animation.
   */
  const animate = () => {
    const currentPosition =
      current.current;

    const targetPosition =
      target.current;

    /*
     * Smoothness of the movement.
     *
     * Higher = follows faster.
     * Lower = more floaty.
     */
    const smoothing = 0.055;

    currentPosition.x +=
      (targetPosition.x -
        currentPosition.x) *
      smoothing;

    currentPosition.y +=
      (targetPosition.y -
        currentPosition.y) *
      smoothing;

    updateTransform(
      currentPosition.x,
      currentPosition.y
    );

    const remainingX =
      targetPosition.x - currentPosition.x;
    const remainingY =
      targetPosition.y - currentPosition.y;

    if (
      Math.abs(remainingX) > 0.02 ||
      Math.abs(remainingY) > 0.02
    ) {
      animationFrame.current =
        requestAnimationFrame(animate);
      return;
    }

    currentPosition.x = targetPosition.x;
    currentPosition.y = targetPosition.y;
    updateTransform(
      currentPosition.x,
      currentPosition.y
    );
    animationFrame.current = null;

    if (containerRef.current) {
      containerRef.current.style.willChange = "auto";
    }
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (reducedMotion.matches || !finePointer.matches) {
      return;
    }

    const requestAnimation = () => {
      if (animationFrame.current !== null) return;
      if (containerRef.current) {
        containerRef.current.style.willChange = "transform";
      }
      animationFrame.current =
        requestAnimationFrame(animate);
    };

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      /*
       * Convert mouse position into
       * -0.5 → +0.5 range.
       */
      const normalizedX =
        event.clientX /
          window.innerWidth -
        0.5;

      const normalizedY =
        event.clientY /
          window.innerHeight -
        0.5;

      /*
       * Calculate target movement.
       */
      target.current = {
        x:
          normalizedX *
          intensity,

        y:
          normalizedY *
          intensity,
      };

      requestAnimation();
    };

    const handleMouseLeave = () => {
      target.current = { x: 0, y: 0 };
      requestAnimation();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) handleMouseLeave();
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      { passive: true }
    );
    window.addEventListener(
      "mouseout",
      handleMouseOut,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
      window.removeEventListener(
        "mouseout",
        handleMouseOut
      );
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [intensity, depth]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,

        transform:
          "perspective(1600px) translate3d(0px, 0px, 0px)",

        transformStyle:
          "preserve-3d",

        /*
         * Keeps children in their own
         * 3D coordinate space.
         */
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}