import {
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
  type PointerEvent,
} from "react";

interface ThreeDPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  draggable?: boolean;
}

export default function ThreeDPanel({
  children,
  className = "",
  style = {},
  intensity = 18,
  draggable = false,
}: ThreeDPanelProps) {
  const panelRef =
    useRef<HTMLDivElement | null>(null);

  const draggingRef =
    useRef(false);

  const pointerIdRef =
    useRef<number | null>(null);

  const startPointer =
    useRef({
      x: 0,
      y: 0,
    });

  const target =
    useRef({
      x: 0,
      y: 0,
    });

  const current =
    useRef({
      x: 0,
      y: 0,
    });

  const animationFrame =
    useRef<number | null>(null);

  /*
   * Apply the 3D transform directly to
   * the DOM element.
   */
  const applyTransform = (
    x: number,
    y: number,
    rotateX: number,
    rotateY: number,
    z: number
  ) => {
    const panel = panelRef.current;

    if (!panel) return;

    panel.style.transform = `
      perspective(1200px)
      translate3d(${x}px, ${y}px, ${z}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  };

  /*
   * ==========================================
   * NORMAL HOVER TILT
   * ==========================================
   */
  const handleHoverTilt = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    const panel = panelRef.current;

    if (!panel) return;

    const rect =
      panel.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
        rect.width -
      0.5;

    const y =
      (event.clientY - rect.top) /
        rect.height -
      0.5;

    const rotateY =
      x * intensity;

    const rotateX =
      -y * intensity;

    applyTransform(
      0,
      0,
      rotateX,
      rotateY,
      25
    );
  };

  /*
   * ==========================================
   * DRAG ANIMATION
   * ==========================================
   */
  const animateDrag = () => {
    if (!draggingRef.current) {
      animationFrame.current = null;
      return;
    }

    const smoothing = 0.18;

    current.current.x +=
      (target.current.x -
        current.current.x) *
      smoothing;

    current.current.y +=
      (target.current.y -
        current.current.y) *
      smoothing;

    /*
     * Strong 3D tilt while dragging.
     */
    const rotateY = Math.max(
      -20,
      Math.min(
        20,
        current.current.x * 0.035
      )
    );

    const rotateX = Math.max(
      -20,
      Math.min(
        20,
        -current.current.y * 0.035
      )
    );

    applyTransform(
      current.current.x,
      current.current.y,
      rotateX,
      rotateY,
      120
    );

    animationFrame.current =
      requestAnimationFrame(
        animateDrag
      );
  };

  /*
   * ==========================================
   * POINTER DOWN
   * ==========================================
   */
  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!draggable) return;

    const panel = panelRef.current;

    if (!panel) return;

    pointerIdRef.current =
      event.pointerId;

    startPointer.current = {
      x: event.clientX,
      y: event.clientY,
    };

    target.current = {
      x: 0,
      y: 0,
    };

    current.current = {
      x: 0,
      y: 0,
    };

    /*
     * Capture pointer without preventing
     * normal clicks.
     */
    panel.setPointerCapture(
      event.pointerId
    );
  };

  /*
   * ==========================================
   * POINTER MOVE
   * ==========================================
   */
  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    const panel = panelRef.current;

    if (!panel) return;

    /*
     * ------------------------------------------
     * DRAG MODE
     * ------------------------------------------
     */
    if (
      draggable &&
      pointerIdRef.current ===
        event.pointerId
    ) {
      const deltaX =
        event.clientX -
        startPointer.current.x;

      const deltaY =
        event.clientY -
        startPointer.current.y;

      const distance = Math.sqrt(
        deltaX * deltaX +
          deltaY * deltaY
      );

      /*
       * Don't activate drag until the
       * pointer actually moves.
       */
      if (
        !draggingRef.current &&
        distance > 6
      ) {
        draggingRef.current = true;

        panel.style.transition =
          "none";

        /*
         * Lift card.
         */
        applyTransform(
          0,
          0,
          0,
          0,
          120
        );

        if (
          animationFrame.current ===
          null
        ) {
          animationFrame.current =
            requestAnimationFrame(
              animateDrag
            );
        }
      }

      /*
       * If dragging, update target.
       */
      if (draggingRef.current) {
        target.current = {
          x: deltaX,
          y: deltaY,
        };

        return;
      }
    }

    /*
     * ------------------------------------------
     * NORMAL HOVER
     * ------------------------------------------
     */
    if (!draggingRef.current) {
      handleHoverTilt(event);
    }
  };

  /*
   * ==========================================
   * POINTER UP
   * ==========================================
   */
  const handlePointerUp = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!draggable) return;

    const panel = panelRef.current;

    if (!panel) return;

    if (
      pointerIdRef.current !==
      event.pointerId
    ) {
      return;
    }

    try {
      panel.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Already released.
    }

    pointerIdRef.current = null;

    /*
     * If card was dragged, return it.
     */
    if (draggingRef.current) {
      draggingRef.current = false;

      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current
        );

        animationFrame.current = null;
      }

      panel.style.transition =
        "transform 550ms cubic-bezier(0.22, 1, 0.36, 1)";

      applyTransform(
        0,
        0,
        0,
        0,
        0
      );
    } else {
      /*
       * It was simply a click.
       *
       * Don't interfere with it.
       */
      panel.style.transition =
        "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)";
    }
  };

  /*
   * ==========================================
   * POINTER CANCEL
   * ==========================================
   */
  const handlePointerCancel = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!draggable) return;

    const panel = panelRef.current;

    if (!panel) return;

    try {
      panel.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Already released.
    }

    pointerIdRef.current = null;
    draggingRef.current = false;

    if (
      animationFrame.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrame.current
      );

      animationFrame.current = null;
    }

    panel.style.transition =
      "transform 550ms cubic-bezier(0.22, 1, 0.36, 1)";

    applyTransform(
      0,
      0,
      0,
      0,
      0
    );
  };

  /*
   * ==========================================
   * POINTER LEAVE
   * ==========================================
   */
  const handlePointerLeave = () => {
    /*
     * While dragging, pointer capture keeps
     * everything alive.
     */
    if (draggingRef.current) return;

    const panel = panelRef.current;

    if (!panel) return;

    panel.style.transition =
      "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)";

    applyTransform(
      0,
      0,
      0,
      0,
      0
    );
  };

  /*
   * Cleanup.
   */
  useEffect(() => {
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

  return (
    <div
      ref={panelRef}
      className={className}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        handlePointerUp
      }
      onPointerCancel={
        handlePointerCancel
      }
      onPointerLeave={
        handlePointerLeave
      }
      style={{
        ...style,

        transform:
          "perspective(1200px) translate3d(0px, 0px, 0px)",

        transformStyle:
          "preserve-3d",

        willChange: "transform",

        cursor: draggable
          ? "grab"
          : "default",

        userSelect: draggable
          ? "none"
          : undefined,

        touchAction: draggable
          ? "none"
          : undefined,
      }}
    >
      {children}
    </div>
  );
}