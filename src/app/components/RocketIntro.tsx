import { useEffect, useRef } from "react";

interface RocketIntroProps {
  onComplete: () => void;
}

const SMOKE_DURATION = 2000;
const FADE_DURATION = 1000;
const TOTAL_DURATION =
  SMOKE_DURATION + FADE_DURATION;

export default function RocketIntro({
  onComplete,
}: RocketIntroProps) {
  const overlayRef =
    useRef<HTMLDivElement | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Smoke plays at 1.75x speed.
    video.playbackRate = 1.75;

    // Start fade after 2 seconds.
    const fadeTimer = window.setTimeout(() => {
      overlayRef.current?.classList.add(
        "smoke-intro-fade"
      );
    }, SMOKE_DURATION);

    // Reveal website after 1 second fade.
    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, TOTAL_DURATION);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src="/smoke.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
