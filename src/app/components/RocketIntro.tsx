import { useEffect, useRef } from "react";

interface RocketIntroProps {
  onComplete: () => void;
}

const SMOKE_DURATION = 2000;
const FADE_DURATION = 1000;
const PLAYBACK_RATE = 1.25;

export default function RocketIntro({
  onComplete,
}: RocketIntroProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Prevent React StrictMode / duplicate effects from
  // starting the smoke video more than once.
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;

    if (!video || !overlay) return;

    // 🚨 IMPORTANT: don't initialize the intro twice.
    if (startedRef.current) return;
    startedRef.current = true;

    let fadeTimer: number | undefined;
    let completeTimer: number | undefined;

    const completeIntro = () => {
      if (completedRef.current) return;

      completedRef.current = true;

      if (fadeTimer !== undefined) {
        window.clearTimeout(fadeTimer);
      }

      if (completeTimer !== undefined) {
        window.clearTimeout(completeTimer);
      }

      video.pause();

      // Completely unload the video after the intro.
      video.removeAttribute("src");
      video.load();

      onComplete();
    };

    const startFade = () => {
      if (completedRef.current) return;

      overlay.classList.add("smoke-intro-fade");

      completeTimer = window.setTimeout(() => {
        completeIntro();
      }, FADE_DURATION);
    };

    const startVideo = async () => {
      if (completedRef.current) return;

      try {
        video.currentTime = 0;
        video.playbackRate = PLAYBACK_RATE;

        await video.play();

        if (completedRef.current) return;

        // 2 seconds of smoke.
        fadeTimer = window.setTimeout(() => {
          startFade();
        }, SMOKE_DURATION);
      } catch (error) {
        console.warn(
          "Smoke intro video could not autoplay:",
          error
        );

        completeIntro();
      }
    };

    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.playbackRate = PLAYBACK_RATE;

    if (video.readyState >= 3) {
      startVideo();
    } else {
      video.addEventListener(
        "canplay",
        startVideo,
        { once: true }
      );
    }

    return () => {
      if (fadeTimer !== undefined) {
        window.clearTimeout(fadeTimer);
      }

      if (completeTimer !== undefined) {
        window.clearTimeout(completeTimer);
      }

      video.removeEventListener(
        "canplay",
        startVideo
      );
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] overflow-hidden bg-black"
      style={{
        opacity: 1,
        willChange: "opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        pointerEvents: "none",
      }}
    >
      <video
        ref={videoRef}
        src="/smoke.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay={false}
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
    </div>
  );
}