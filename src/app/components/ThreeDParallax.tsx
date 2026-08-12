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

    animationFrame.current =
      requestAnimationFrame(animate);
  };

  /*
   * Start animation loop once.
   */
  useEffect(() => {
    animationFrame.current =
      requestAnimationFrame(animate);

    return () => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current
        );
      }
    };
  }, []);

  /*
   * Mouse movement.
   */
  useEffect(() => {
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
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, [intensity]);

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

        willChange: "transform",

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