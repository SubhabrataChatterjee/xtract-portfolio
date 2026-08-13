import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.2;

    const startMusic = () => {
      audio
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch(() => {
          // Browser blocked autoplay
        });
    };

    startMusic();

    return () => {
      audio.pause();
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/gaming-bg.mp3"
        loop
        preload="auto"
      />

      <button
        onClick={toggleMusic}
        aria-label={playing ? "Mute music" : "Play music"}
        className="fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(124,58,237,0.18)",
          border: "1px solid rgba(124,58,237,0.35)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
        }}
      >
        {playing ? "🔊" : "🔇"}
      </button>
    </>
  );
}