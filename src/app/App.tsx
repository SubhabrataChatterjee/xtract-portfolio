import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ChevronDown, ChevronRight, Play,
  Mail, Youtube, Instagram, Twitter, MessageCircle,
  Eye, Calendar, ArrowLeft, Star, Zap, Trophy, Target,
  Gamepad2,
  Video,
} from "lucide-react";
import ThreeDBackground from "./components/ThreeDBackground";
import ThreeDPanel from "./components/ThreeDPanel";
import ThreeDParallax from "./components/ThreeDParallax";
import BackgroundMusic from "./components/BackgroundMusic";
import "@fontsource/space-grotesk";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  date: string;
  duration: string;
  description: string;
}

interface Playlist {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  description: string;
  videoCount: number;
  videos: Video[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLAYLISTS: Playlist[] = [
  {
    id: "sekiro",
    name: "Sekiro",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=340&fit=crop&auto=format",
    category: "Action / Soulslike",
    description: "Diving deep into the brutal world of Sekiro: Shadows Die Twice. Every boss fight, every death, every hard-won victory — raw and unfiltered.",
    videoCount: 12,
    videos: [
      { id: "s1", title: "Sekiro — The Most Annoying Boss Fight Yet", thumbnail: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&h=280&fit=crop&auto=format", views: "12.4K", date: "2 weeks ago", duration: "18:32", description: "Facing the toughest boss in Sekiro head-on..." },
      { id: "s2", title: "Sekiro — Finally Beating Genichiro!", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=280&fit=crop&auto=format", views: "8.7K", date: "3 weeks ago", duration: "24:15", description: "The rematch we all needed..." },
      { id: "s3", title: "Sekiro — Guardian Ape First Try?!", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=280&fit=crop&auto=format", views: "6.2K", date: "1 month ago", duration: "31:44", description: "The Guardian Ape encounter, no deaths..." },
      { id: "s4", title: "Sekiro — Exploring Ashina Castle", thumbnail: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&h=280&fit=crop&auto=format", views: "5.1K", date: "1 month ago", duration: "22:08", description: "Full exploration of Ashina Castle..." },
    ],
  },
  {
    id: "wuthering-waves",
    name: "Wuthering Waves",
    thumbnail: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&h=340&fit=crop&auto=format",
    category: "Open World / RPG",
    description: "Exploring the vast open world of Wuthering Waves — from Rinascita's stunning landscapes to intense boss encounters and character showcases.",
    videoCount: 18,
    videos: [
      { id: "w1", title: "Wuthering Waves — Exploring Rinascita", thumbnail: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=500&h=280&fit=crop&auto=format", views: "9.8K", date: "1 week ago", duration: "28:41", description: "A full tour of the Rinascita region..." },
      { id: "w2", title: "Wuthering Waves — Best Characters Tier List", thumbnail: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=500&h=280&fit=crop&auto=format", views: "15.2K", date: "2 weeks ago", duration: "19:55", description: "Every character ranked from best to worst..." },
      { id: "w3", title: "Wuthering Waves — Epic Boss Fight Highlights", thumbnail: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=500&h=280&fit=crop&auto=format", views: "7.3K", date: "3 weeks ago", duration: "14:22", description: "Best boss fights of the week..." },
      { id: "w4", title: "Wuthering Waves — Free to Play Guide", thumbnail: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&h=280&fit=crop&auto=format", views: "11.6K", date: "1 month ago", duration: "32:10", description: "Everything you need to know as F2P..." },
    ],
  },
  {
    id: "gaming-discussions",
    name: "Gaming Discussions",
    thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=340&fit=crop&auto=format",
    category: "Gaming Opinions / Discussions",
    description: "Deep dives into gaming culture, industry trends, game design philosophy, and honest opinions on everything gaming-related.",
    videoCount: 9,
    videos: [
      { id: "g1", title: "Why Every Gamer Should Play Multiple Games", thumbnail: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&h=280&fit=crop&auto=format", views: "21.5K", date: "3 days ago", duration: "16:48", description: "The case for gaming variety and why it makes you better..." },
      { id: "g2", title: "Are Modern Games Too Easy?", thumbnail: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=500&h=280&fit=crop&auto=format", views: "18.9K", date: "1 week ago", duration: "22:33", description: "A hot take on difficulty in modern gaming..." },
      { id: "g3", title: "The Best Gaming Era — Then vs Now", thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&h=280&fit=crop&auto=format", views: "13.7K", date: "2 weeks ago", duration: "25:17", description: "Nostalgia vs modern gaming — which era wins?" },
    ],
  },
];



const FEATURED_VIDEO = {
  title: "UNLEASH THE AVATAR : THIS INDIAN GAME LOOKS AWESOME, BUT...🤔",
  thumbnail: "https://i.ytimg.com/vi/wDjtyUnWK_g/hqdefault.jpg",
  views: "236",
  date: "2026-06-29",
  duration: "17:12",
  description: ""
};

const FEATURES = [
  { icon: "🔥", title: "PC & Mobile Gameplay", desc: "Raw and unfiltered across all devices" },
  { icon: "🕹️", title: "New & Classic Games", desc: "From retro gems to modern releases" },
  { icon: "🎯", title: "All Genres", desc: "Different genres, different experiences" },
  { icon: "📹", title: "Raw Content", desc: "Gameplay, highlights & walkthroughs" },
  { icon: "🚀", title: "Made for Gamers", desc: "Content created by a true gamer" },
];

// ─── Clay Styles ──────────────────────────────────────────────────────────────

const cs = {
  card: {
    background: "linear-gradient(145deg, #141a2e, #111728)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.06)",
  } as React.CSSProperties,
  cardHover: {
    boxShadow: "0 28px 80px rgba(0,0,0,0.65), 0 8px 24px rgba(124,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
  } as React.CSSProperties,
  btnPrimary: {
    background: "linear-gradient(145deg, #7c3aed, #6d28d9)",
    boxShadow: "0 8px 24px rgba(124,58,237,0.45), 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.12)",
  } as React.CSSProperties,
  btnSecondary: {
    background: "linear-gradient(145deg, #141a2e, #1a2240)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(6,182,212,0.3)",
  } as React.CSSProperties,
};

// ─── Clay Card ────────────────────────────────────────────────────────────────

function ClayCard({
  children,
  className = "",
  style = {},
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      style={{
        ...cs.card,
        ...(hovered ? cs.cardHover : {}),
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Clay Button ──────────────────────────────────────────────────────────────

function ClayButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const baseStyle = variant === "primary" ? cs.btnPrimary : cs.btnSecondary;
  const cls = `clay-button inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wider transition-all duration-150 ${
    variant === "primary" ? "text-white" : "text-cyan-400"
  } ${className}`;
  const pressStyle: React.CSSProperties = {
    ...baseStyle,
    transform: pressed ? "translateY(2px) scale(0.97)" : "translateY(0) scale(1)",
  };

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        style={pressStyle}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={cls}
      style={pressStyle}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: Video }) {
  const openYouTube = () => {
    window.open(
      `https://www.youtube.com/watch?v=${video.id}`,
      "_blank"
    );
  };

  return (
    <ThreeDPanel intensity={18} draggable>
    <ClayCard
      className="group cursor-pointer"
      onClick={openYouTube}
    >
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ background: "#141a2e" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              background: "rgba(124,58,237,0.92)",
              boxShadow:
                "0 0 28px rgba(124,58,237,0.7), 0 4px 12px rgba(0,0,0,0.5)",
              animation: "playPulse 2.5s ease-in-out infinite",
            }}
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-2 py-1 rounded-md tracking-wide">
          {video.duration}
        </div>
      </div>

      <div className="p-4">
        <h3
          className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2 overflow-hidden"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.95rem",
          }}
        >
          {video.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {video.views}
          </span>

          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {video.date}
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-1.5 italic">
          View On YouTube
        </p>
      </div>
    </ClayCard>
    </ThreeDPanel>
  );
}

// ─── Playlist Card ────────────────────────────────────────────────────────────

function PlaylistCard({ playlist, onClick }: { playlist: Playlist; onClick: () => void }) {
  return (
    <ClayCard className="group cursor-pointer flex flex-col" onClick={onClick}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={playlist.thumbnail}
          alt={playlist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ background: "#141a2e" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div
          className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.88)", boxShadow: "0 2px 8px rgba(124,58,237,0.5)" }}
        >
          {playlist.videoCount} videos
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase">
            {playlist.category}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="font-black text-white mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.05rem", letterSpacing: "0.03em" }}
        >
          {playlist.name}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{playlist.description}</p>
        <ClayButton variant="primary" className="w-full">
          <Play className="w-4 h-4 fill-white" />
          View Playlist
        </ClayButton>
      </div>
    </ClayCard>
  );
}

// ─── Gaming Visual ────────────────────────────────────────────────────────────

function GamingVisual({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const handleBadgeClick = (action: string) => {
    switch (action) {
      case "stats":
        document.getElementById("channel-stats")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;

      case "featured":
        document.getElementById("featured-video")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;

      case "playlists-preview":
        document.getElementById("playlists-preview")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;

      case "contact":
        onNavigate("contact");
        break;

      case "playlist-page":
        onNavigate("playlists");
        break;

      default:
        break;
    }
  };

  const badges = [
    {
      icon: <Star className="w-5 h-5 text-yellow-400" />,
      bg: "rgba(124,58,237,0.18)",
      pos: "top-4 right-8",
      delay: "0s",
      dur: "3.2s",
      action: "featured",
    },
    {
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      bg: "rgba(6,182,212,0.18)",
      pos: "bottom-10 left-2",
      delay: "1.1s",
      dur: "4.1s",
      action: "contact",
    },
    {
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
      bg: "rgba(59,130,246,0.18)",
      pos: "top-16 left-0",
      delay: "0.6s",
      dur: "5s",
      action: "stats",
    },
    {
      icon: <Gamepad2 className="w-5 h-5 text-green-400" />,
      bg: "rgba(34,197,94,0.18)",
      pos: "top-2 left-16",
      delay: "1.5s",
      dur: "4.6s",
      action: "playlists-preview",
    },

    // Keep your remaining badges here
  ];

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        minHeight: 420,
      }}
    >
       <div className="hero-orbit">
        <div className="hero-orbit-inner">
          <div className="hero-orbit-card">

      {/* Ambient glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(6,182,212,0.14) 50%, transparent 72%)",
            filter: "blur(38px)",
          }}
        />
      </div>

      {/* Profile image */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: "260px",
          height: "260px",
          aspectRatio: "1 / 1",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow:
            "0 0 35px rgba(124,58,237,0.35), 0 8px 30px rgba(0,0,0,0.45)",
          pointerEvents: "none",
        }}
      >
        <img
          src="/xtract.jpg"
          alt="XTRACT"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      </div>
      </div>
      </div>

      {/* Floating clickable badges */}
      <div className="hero-orbit">
        <div className="hero-orbit-inner">
          <div className="hero-orbit-card">
<div
        className="absolute inset-0"
        style={{
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
{badges.map((b, i) => (
  <button
    key={i}
    type="button"
    onClick={() => handleBadgeClick(b.action)}
    aria-label={`Open ${b.action}`}
    className={`absolute ${b.pos} w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer`}
    style={{
      background: b.bg,
      ...cs.card,

      boxShadow:
        "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",

      animation: `floatBadge ${b.dur} ease-in-out infinite`,
      animationDelay: b.delay,

      pointerEvents: "auto",
    }}
  >
    {b.icon}
  </button>
))}
</div>
</div>
</div>
</div>
      
      </div>
    
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  playlists,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string, id?: string) => void;
  playlists: Playlist[];
}) {
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const activeStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.09))",
    boxShadow: "inset 0 0 0 1px rgba(124,58,237,0.28)",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />
      <div
        ref={ref}
        className="mobile-sidebar fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: 300,
          background: "linear-gradient(180deg, #0f1525 0%, #080c18 100%)",
          boxShadow: "8px 0 48px rgba(0,0,0,0.8), inset -1px 0 rgba(255,255,255,0.04)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <span
            className="text-white font-black text-xl tracking-widest"
            style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 20px rgba(124,58,237,0.5)" }}
          >
            XTRACT
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-5 space-y-1 overflow-y-auto">
          <NavBtn
            label="Home"
            icon="🏠"
            active={currentPage === "home"}
            activeStyle={activeStyle}
            onClick={() => { onNavigate("home"); onClose(); }}
          />

          {/* Playlists accordion */}
          <div>
            <NavBtn
              label="Playlists"
              icon="🎮"
              active={currentPage.startsWith("playlist")}
              activeStyle={activeStyle}
              onClick={() => setPlaylistOpen(v => !v)}
              right={playlistOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            />
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: playlistOpen ? 320 : 0, opacity: playlistOpen ? 1 : 0 }}
            >
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5 pb-1">
                {playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onNavigate("playlist-detail", p.id); onClose(); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm"
                  >
                    <span className="block font-semibold text-slate-200">{p.name}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{p.category}</span>
                  </button>
                ))}
                <button
                  onClick={() => { onNavigate("playlists"); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors text-xs font-bold tracking-wider mt-1"
                >
                  View All Playlists →
                </button>
              </div>
            </div>
          </div>

          <NavBtn
            label="Contact"
            icon="📧"
            active={currentPage === "contact"}
            activeStyle={activeStyle}
            onClick={() => { onNavigate("contact"); onClose(); }}
          />

          <div className="pt-4 mt-4 border-t border-white/5">
            <a
              href="mailto:sinjuforbusiness@gmail.com"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">sinjuforbusiness@gmail.com</span>
            </a>
          </div>
        </nav>

        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-xs text-slate-700 text-center tracking-widest">© 2026 XTRACT</p>
        </div>
      </div>
    </>
  );
}

function NavBtn({
  label, icon, active, activeStyle, onClick, right,
}: {
  label: string; icon: string; active: boolean;
  activeStyle: React.CSSProperties; onClick: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm tracking-wide transition-all duration-200 ${
        active ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
      style={active ? activeStyle : {}}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {right}
    </button>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, emoji }: { title: string; emoji?: string }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <h2
        className="section-heading-title text-2xl sm:text-3xl font-black text-white whitespace-nowrap"
        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.03em" }}
      >
        {title}
      </h2>
      {emoji && <span className="text-2xl">{emoji}</span>}
      <div className="h-px flex-1 ml-2" style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.5), transparent)" }} />
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({
  onNavigate,
  playlists,
  featuredVideo,
  popularVideos,
  channel,
  totalLikes,
  activeStat,
  displayStat,
}: {
  onNavigate: (page: string, id?: string) => void;
  playlists: Playlist[];
  featuredVideo: Video;
  popularVideos: Video[];
  channel: any;
  totalLikes: number;
  activeStat: number;
  displayStat: number;
}) {
  return (
    <div>
      {/* =========================================
          HERO
      ========================================= */}

      <ThreeDParallax
        intensity={12}
        depth={0}
      >
        <section
          className="min-h-screen flex items-center py-24 px-4 sm:px-8 lg:px-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(8,12,24,0.55) 0%, rgba(13,17,40,0.48) 60%, rgba(8,12,24,0.55) 100%)",
          }}
        >
          {/* Animated Samurai Background */}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/samurai.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ zIndex: 2 }}
            />

            {/* Dark gaming overlay */}

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(8,12,24,0.92) 0%, rgba(8,12,24,0.78) 45%, rgba(8,12,24,0.55) 100%)",
              }}
            />

            {/* Purple/cyan atmosphere */}

            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 70% 50%, rgba(124,58,237,0.16), transparent 45%), radial-gradient(circle at 85% 30%, rgba(6,182,212,0.10), transparent 35%)",
              }}
            />
          </div>

          {/* Radial glow */}

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hero glow"
            style={{
              width: 800,
              height: 600,
              background:
                "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">

            {/* =========================================
                LEFT HERO
            ========================================= */}

            <div className="hero-orbit">
              <div className="hero-orbit-inner">
                <div className="hero-orbit-card">

                  <div className="mb-5">
                    <span
                      className="inline-block text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase px-4 py-1.5 rounded-full"
                      style={{
                        background: "rgba(6,182,212,0.1)",
                        border: "1px solid rgba(6,182,212,0.22)",
                      }}
                    >
                      YouTube Gaming Creator
                    </span>
                  </div>

                </div>

                <h1
                  className="hero-title font-black text-white leading-none mb-3 card-reveal card-float"
style={{
  
  fontFamily: "Orbitron, sans-serif",
  fontSize: "5.5rem",
  
  textShadow: `
    0 0 5px #c084fc,
    0 0 15px #a855f7,
    0 0 30px #a855f7,
    0 0 55px #9333ea,
    0 0 90px #7e22ce,
    0 0 140px rgba(126, 34, 206, 0.9),
    0 10px 40px rgba(0, 0, 0, 0.65),
    0 20px 80px rgba(0, 0, 0, 0.65),
    0 30px 120px rgba(0, 0, 0, 0.45)
  `,
}}               
 >
                  XTRACT
                </h1>

<h2
                  className="hero-subtitle font-black text-white leading-none mb-3 card-reveal card-float"
style={{
  
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: "1.0rem",
  
  textShadow: `
    0 0 5px #c084fc,
    0 0 15px #a855f7,
    0 0 30px #a855f7,
    0 0 55px #9333ea,
    0 0 90px #7e22ce,
    0 0 140px rgba(126, 34, 206, 0.9)
  `,
}}               
 >
                  PC & Mobile Gaming Across All Genres 
              </h2>
                <p
                  className="hero-bio text-lg sm:text-xl text-slate-300 mb-8 font-semibold card-reveal card-float"
                  style={{
  background: "linear-gradient(145deg, #141a2e, #111728)",
  border: "1px solid rgba(255, 255, 255, 0.07)",
  borderRadius: "1.5rem",

  boxShadow:
    "0 18px 45px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)",

  backdropFilter: "blur(8px)",

  textAlign: "justify",
  fontSize: "0.85rem",

  /* MAKE THE BOX BIGGER */
  width: "100%",
  minHeight: "120%",

  /* Keeps the box centered */
  

  /* More vertical space without changing text */
  padding: "1.2rem 1.5rem",

  boxSizing: "border-box",

  /* Prevent text from expanding into extra lines */
  
}}
                  
                >
                  Hello! I am Sinju — your destination for PC & Mobile Gaming
                  across all genres. From action-packed adventures and intense
                  FPS battles to story-driven games, indie gems, and casual
                  fun — I play it all.
                </p>

                {/* Feature cards */}

                <div className="hero-features grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {FEATURES.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-2xl card-reveal card-float"
                      style={{
                        animationDelay: `${0.45 + i * 0.12}s`,
                        background:
                          "linear-gradient(145deg, #141a2e, #111728)",
                        boxShadow:
                          "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                        border:
                          "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span className="text-2xl leading-none mt-0.5">
                        {f.icon}
                      </span>

                      <div>
                        <div
                          className="font-bold text-white text-sm"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {f.title}
                        </div>

                        <div className="text-slate-500 text-xs mt-0.5">
                          {f.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero buttons */}

              <div
                className="hero-actions flex flex-wrap gap-4 card-reveal card-float"
                style={{
                  animationDelay: "0.95s",
                }}
              >
                <ClayButton
                  variant="primary"
                  onClick={() => {
                    window.open(
                      "https://www.youtube.com/@xTracttGG?sub_confirmation=1",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  <Youtube className="w-4 h-4" />
                  Subscribe on YouTube
                </ClayButton>

                <ClayButton
                  variant="secondary"
                  onClick={() => onNavigate("playlists")}
                >
                  Explore Playlists
                </ClayButton>
              </div>
            </div>

            {/* =========================================
                RIGHT: GAMING VISUAL
            ========================================= */}

            <div className="hidden lg:flex items-center justify-center px-8 hero-visual-enter">
              <GamingVisual onNavigate={onNavigate} />
            </div>
          </div>
        </section>
      </ThreeDParallax>

      {/* =========================================
          FEATURED VIDEO
      ========================================= */}

      <section
        id="featured-video"
        className="py-20 px-4 sm:px-8 lg:px-16 section-reveal section-float"
        
      >
        <div className="max-w-7xl mx-auto">

          <SectionHeading title="Featured Video" />

          <ClayCard>
            <div className="grid lg:grid-cols-2">

              <div
                className="relative"
                style={{
                  aspectRatio: "16/9",
                  minHeight: 220,
                }}
              >
                <img
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{
                    background: "#141a2e",
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 60%, rgba(17,23,40,0.7) 100%)",
                  }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                    style={{
                      background: "rgba(124,58,237,0.9)",
                      boxShadow:
                        "0 0 50px rgba(124,58,237,0.75), 0 4px 20px rgba(0,0,0,0.55)",
                      animation:
                        "playPulse 2.5s ease-in-out infinite",
                    }}
                  >
                    <Play className="w-9 h-9 text-white fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-sm font-mono px-3 py-1 rounded-lg tracking-wide">
                  {featuredVideo.duration}
                </div>
              </div>

              <div className="featured-content p-8 flex flex-col justify-center">

                <div className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-3">
                  Featured
                </div>

                <h3
                  className="text-2xl font-black text-white mb-4 leading-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {featuredVideo.title}
                </h3>

                

                <div className="flex gap-5 text-sm text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {featuredVideo.views}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {featuredVideo.date}
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic mb-6">
                  View on YouTube
                </p>

                <ClayButton
                  variant="primary"
                  onClick={() => {
                    window.location.href =
                      `https://www.youtube.com/watch?v=${featuredVideo.id}`;
                  }}
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch on YouTube ▶
                </ClayButton>

              </div>
            </div>
          </ClayCard>
        </div>
      </section>

      {/* =========================================
          CHANNEL STATS
      ========================================= */}

      <section
        id="channel-stats"
        className="py-20 px-4 sm:px-8 lg:px-16"
      >
        <div className="max-w-7xl mx-auto">

          <SectionHeading
            title="Channel Stats"
            emoji="📊"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">

            {/* =====================================
                SUBSCRIBERS
            ===================================== */}

            <div
              className={`mobile-stat-card p-8 rounded-3xl text-center stat-card ${
                activeStat === 0 ? "stat-card-active" : ""
              }`}
              style={{
                background:
                  "linear-gradient(145deg, #141a2e, #111728)",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
                border:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="text-cyan-400 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                Subscribers
              </div>

              <div
                className={`text-4xl font-black text-white stat-value ${
                  activeStat === 0 ? "stat-active" : ""
                }`}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {activeStat === 0
                  ? displayStat.toLocaleString()
                  : Number(channel?.subscribers || 0).toLocaleString()}
              </div>

              {activeStat === 0 && (
                <div className="mt-3 text-[10px] tracking-[0.25em] text-cyan-400 uppercase opacity-70">
                  ● LIVE DATA
                </div>
              )}
            </div>

            {/* =====================================
                TOTAL VIEWS
            ===================================== */}

            <div
              className={`mobile-stat-card p-8 rounded-3xl text-center stat-card ${
                activeStat === 1 ? "stat-card-active" : ""
              }`}
              style={{
                background:
                  "linear-gradient(145deg, #141a2e, #111728)",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
                border:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="text-purple-400 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                Total Views
              </div>

              <div
                className={`text-4xl font-black text-white stat-value ${
                  activeStat === 1 ? "stat-active" : ""
                }`}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {activeStat === 1
                  ? displayStat.toLocaleString()
                  : Number(channel?.views || 0).toLocaleString()}
              </div>

              {activeStat === 1 && (
                <div className="mt-3 text-[10px] tracking-[0.25em] text-purple-400 uppercase opacity-70">
                  ● LIVE DATA
                </div>
              )}
            </div>

            {/* =====================================
                TOTAL LIKES
            ===================================== */}

            <div
              className={`mobile-stat-card p-8 rounded-3xl text-center stat-card ${
                activeStat === 2 ? "stat-card-active" : ""
              }`}
              style={{
                background:
                  "linear-gradient(145deg, #141a2e, #111728)",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
                border:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="text-pink-400 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                Total Likes
              </div>

              <div
                className={`text-4xl font-black text-white stat-value ${
                  activeStat === 2 ? "stat-active" : ""
                }`}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {activeStat === 2
                  ? displayStat.toLocaleString()
                  : Number(totalLikes || 0).toLocaleString()}
              </div>

              {activeStat === 2 && (
                <div className="mt-3 text-[10px] tracking-[0.25em] text-pink-400 uppercase opacity-70">
                  ● LIVE DATA
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================
          MOST POPULAR VIDEOS
      ========================================= */}

      <section
        className="py-20 px-4 sm:px-8 lg:px-16 section-float"
        style={{
          
        }}
      >
        <div className="max-w-7xl mx-auto">

          <SectionHeading
            title="Most Popular Videos"
            emoji="🎮"
          />

          <p className="text-slate-600 text-xs italic -mt-6 mb-10">
            View On YouTube
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {popularVideos.map((v, i) => (
              <div
                key={v.id}
                className="card-reveal card-float"
                style={{
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <VideoCard video={v} />
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================
          PLAYLISTS PREVIEW
      ========================================= */}

      <section
        id="playlists-preview"
        className="py-20 px-4 sm:px-8 lg:px-16 section-reveal section-float"
        
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">

            <h2
              className="font-black text-white mb-3"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                letterSpacing: "0.04em",
              }}
            >
              Explore My Playlists 🎮
            </h2>

            <p className="text-slate-400 text-lg">
              Different games. Different genres. Different experiences.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {playlists.map((p, i) => (
              <div
                key={p.id}
                className="card-reveal card-float"
                style={{
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <PlaylistCard
                  playlist={p}
                  onClick={() =>
                    onNavigate("playlist-detail", p.id)
                  }
                />
              </div>
            ))}

          </div>
        </div>
      </section>

    </div>
  );
}

// ─── Playlists Page ───────────────────────────────────────────────────────────

function PlaylistsPage({
  playlists,
  onSelect,
}: {
  playlists: Playlist[];
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="playlist-detail-page min-h-screen py-24 px-4 sm:px-8 lg:px-16"
      
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <h1
            className="font-black text-white mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              textShadow: "0 0 50px rgba(124,58,237,0.35)",
            }}
          >
            Explore My Playlists 🎮
          </h1>

          <p className="text-slate-400 text-lg">
            Different games. Different genres. Different experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((p) => (
            <PlaylistCard
              key={p.id}
              playlist={p}
              onClick={() => onSelect(p.id)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

function GameLibraryPage({
  playlists,
  onSelect,
}: {
  playlists: Playlist[];
  onSelect: (id: string) => void;
}) {

  const achievements = [
  {
    id: "first-video",
    icon: "🎬",
    title: "FIRST BLOOD",
    description: "Uploaded your first gaming video.",
    requirement: "1 video uploaded",
    unlocked: true,
  },
  {
    id: "game-collector",
    icon: "🎮",
    title: "GAME COLLECTOR",
    description: "Build a library of multiple games.",
    requirement: "3 games completed",
    unlocked: true,
  },
  {
    id: "rising-star",
    icon: "⭐",
    title: "RISING STAR",
    description: "Reach your first major view milestone.",
    requirement: "1,000 total views",
    unlocked: true,
  },
  {
    id: "content-machine",
    icon: "⚡",
    title: "CONTENT MACHINE",
    description: "Build a serious video catalog.",
    requirement: "50 videos uploaded",
    unlocked: true,
  },
  {
    id: "viral",
    icon: "🔥",
    title: "BREAKOUT",
    description: "One video breaks through the noise.",
    requirement: "1,000 views on one video",
    unlocked: false,
  },
  {
    id: "legend",
    icon: "👑",
    title: "LEGEND",
    description: "Reach the next level of XTRACT.",
    requirement: "10,000 total views",
    unlocked: false,
  },
];

  const unlockedAchievements = achievements.filter(
  (achievement) => achievement.unlocked
);

const xp = unlockedAchievements.length * 250;

const currentLevel = Math.floor(xp / 500) + 1;

const nextLevelXP = currentLevel * 500;

const progress =
  ((xp % 500) / 500) * 100;

  const [selectedGame, setSelectedGame] = useState<Playlist | null>(null);
  const handleGameTilt = (
  e: React.MouseEvent<HTMLDivElement>
) => {
  const card = e.currentTarget;

  const rect = card.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateY = ((x - centerX) / centerX) * 7;
  const rotateX = ((centerY - y) / centerY) * 7;

  card.style.transform = `
    perspective(900px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    translateY(-8px)
  `;
};

const resetGameTilt = (
  e: React.MouseEvent<HTMLDivElement>
) => {
  e.currentTarget.style.transform =
    "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
};

  return (
  <div
  className="game-library-page relative w-full min-h-screen overflow-x-hidden px-4 sm:px-8 lg:px-16"
  
>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.2)",
            }}
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />

            <span className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">
              XTRACT GAME LIBRARY
            </span>
          </div>

          <h1
            className="text-white font-black mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              textShadow:
                "0 0 45px rgba(124,58,237,0.35)",
            }}
          >
            GAME LIBRARY
          </h1>

          <p className="text-slate-400 text-lg">
            Select your experience.
          </p>

          <div className="mt-4 text-xs text-slate-600 tracking-[0.2em] uppercase">
            {playlists.length} GAMES AVAILABLE
          </div>
        </div>


        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {playlists.map((playlist, index) => (
            <div
              key={playlist.id}
              className="group relative cursor-pointer"
              style={{
                animation:
                  "cardReveal 0.7s cubic-bezier(0.22,1,0.36,1) both",
                animationDelay: `${index * 0.1}s`,
              }}
              onClick={() => setSelectedGame(playlist)}
            >

              {/* Glow */}
              <div
                className="absolute -inset-1 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.45), rgba(6,182,212,0.3))",
                  filter: "blur(14px)",
                }}
              />

              {/* Card */}
              <div
  className="relative overflow-hidden rounded-[26px] game-library-card"
  onMouseMove={handleGameTilt}
  onMouseLeave={resetGameTilt}
                style={{
                  background:
                    "linear-gradient(145deg, #141a2e, #0d1222)",
                  border:
                    "1px solid rgba(255,255,255,0.07)",
                  boxShadow:
                    "0 12px 35px rgba(0,0,0,0.45)",
                  transition:
                    "transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease",
                }}
              >

                {/* Thumbnail */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: "16 / 9",
                  }}
                >
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 35%, rgba(8,12,24,0.95) 100%)",
                    }}
                  />

                  {/* Game number */}
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em]"
                    style={{
                      background:
                        "rgba(8,12,24,0.75)",
                      backdropFilter: "blur(10px)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                    }}
                  >
                    GAME {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "rgba(124,58,237,0.9)",
                        boxShadow:
                          "0 0 35px rgba(124,58,237,0.7)",
                      }}
                    >
                      <Play
                        className="w-7 h-7 text-white fill-white ml-1"
                      />
                    </div>
                  </div>
                </div>


                {/* Information */}
                <div className="p-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h2
                        className="text-xl font-black text-white group-hover:text-purple-300 transition-colors"
                        style={{
                          fontFamily:
                            "'Space Grotesk', sans-serif",
                        }}
                      >
                        {playlist.name}
                      </h2>

                      <p className="text-xs text-cyan-400 uppercase tracking-[0.18em] mt-1">
                        {playlist.category || "Gaming"}
                      </p>
                    </div>

                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "rgba(124,58,237,0.1)",
                        border:
                          "1px solid rgba(124,58,237,0.18)",
                      }}
                    >
                      <Gamepad2 className="w-5 h-5 text-purple-400" />
                    </div>

                  </div>


                  <p className="text-slate-500 text-sm leading-relaxed mt-4 line-clamp-2">
                    {playlist.description ||
                      "Explore the videos and adventures from this game."}
                  </p>


                  {/* Bottom HUD */}
                  <div
                    className="flex items-center justify-between mt-6 pt-4"
                    style={{
                      borderTop:
                        "1px solid rgba(255,255,255,0.06)",
                    }}
                  >

                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Play className="w-3.5 h-3.5" />

                      <span>
                        {playlist.videoCount ||
                          playlist.videos?.length ||
                          0}{" "}
                        Videos
                      </span>
                    </div>

                    <span className="text-xs font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      SELECT GAME →
                    </span>

                  </div>

                </div>
              </div>
            </div>
          ))}

        </div>

        {selectedGame && (
  <div
    className="game-modal fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
    style={{
      background: "rgba(3,5,12,0.88)",
      backdropFilter: "blur(18px)",
      animation: "gameFocusIn 0.45s ease-out both",
    }}
  >

    {/* Background artwork */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url(${selectedGame.thumbnail})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.12,
        filter: "blur(20px)",
        transform: "scale(1.1)",
      }}
    />

    {/* Main panel */}
    <div
      className="game-modal-panel relative w-full max-w-5xl overflow-hidden rounded-[32px]"
      style={{
        background:
          "linear-gradient(145deg, rgba(20,26,46,0.97), rgba(8,12,24,0.98))",
        border:
          "1px solid rgba(255,255,255,0.1)",
        boxShadow:
          "0 30px 100px rgba(0,0,0,0.7), 0 0 60px rgba(124,58,237,0.15)",
        animation:
          "gameFocusPanel 0.55s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >

      {/* Close */}
      <button
        type="button"
        onClick={() => setSelectedGame(null)}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-all hover:scale-105"
        style={{
          background: "rgba(8,12,24,0.75)",
          border:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        ✕
      </button>


      <div className="grid md:grid-cols-2">

        {/* Artwork */}
        <div className="relative min-h-[300px] md:min-h-[500px]">

          <img
            src={selectedGame.thumbnail}
            alt={selectedGame.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 30%, rgba(8,12,24,0.95) 100%), linear-gradient(0deg, rgba(8,12,24,0.65), transparent 60%)",
            }}
          />

          {/* HUD label */}
          <div
            className="absolute top-6 left-6 px-3 py-2 rounded-lg text-[10px] font-black tracking-[0.25em] text-cyan-400"
            style={{
              background: "rgba(8,12,24,0.7)",
              border:
                "1px solid rgba(6,182,212,0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            SELECTED GAME
          </div>

        </div>


        {/* Info */}
        <div className="relative flex flex-col justify-center p-8 sm:p-12">

          <div className="text-xs font-bold tracking-[0.3em] text-purple-400 uppercase mb-4">
            XTRACT // GAME DATABASE
          </div>

          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              textShadow:
                "0 0 30px rgba(124,58,237,0.3)",
            }}
          >
            {selectedGame.name}
          </h2>

          <div className="text-cyan-400 text-sm font-bold tracking-[0.18em] uppercase mb-6">
            {selectedGame.category || "Gaming"}
          </div>

          <p className="text-slate-400 leading-relaxed mb-8">
            {selectedGame.description ||
              "Explore the videos, episodes and adventures from this game."}
          </p>


          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">

            <div
              className="p-5 rounded-2xl"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                Videos
              </div>

              <div className="text-2xl font-black text-white">
                {selectedGame.videoCount ||
                  selectedGame.videos?.length ||
                  0}
              </div>
            </div>


            <div
              className="p-5 rounded-2xl"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                Status
              </div>

              <div className="text-2xl font-black text-cyan-400">
                ACTIVE
              </div>
            </div>

          </div>


          {/* Button */}
          <button
            type="button"
            onClick={() => {
              const id = selectedGame.id;
              setSelectedGame(null);
              onSelect(id);
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed, #06b6d4)",
              boxShadow:
                "0 10px 35px rgba(124,58,237,0.35)",
            }}
          >
            <Play className="w-5 h-5 fill-white" />

            VIEW PLAYLIST

          </button>

        </div>

      </div>
      {/* =========================================
    ACHIEVEMENTS
========================================= */}
</div>
<div>
<section
  className="mt-16 sm:mt-20"
  id="achievements"
>
  
  {/* Section heading */}

  <div className="mb-8 sm:mb-10">
  <div className="text-[11px] sm:text-xs font-bold tracking-[0.3em] text-purple-400 uppercase mb-2">
    XTRACT // PROGRESSION
  </div>

  <h2
    className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
    style={{
      fontFamily: "'Space Grotesk', sans-serif",
      letterSpacing: "-0.035em",
    }}
  >
    ACHIEVEMENTS
  </h2>

  <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
    Milestones unlocked throughout the XTRACT gaming journey.
  </p>
</div>


  {/* LEVEL CARD */}

  <div
    className="relative overflow-hidden rounded-[28px] p-7 sm:p-9 mb-8"
    style={{
      background:
        "linear-gradient(145deg, rgba(20,26,46,0.95), rgba(10,14,30,0.98))",
      border:
        "1px solid rgba(124,58,237,0.18)",
      boxShadow:
        "0 18px 50px rgba(0,0,0,0.4), 0 0 40px rgba(124,58,237,0.08)",
    }}
  >

    {/* Glow */}

    <div
      className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)",
        filter: "blur(20px)",
      }}
    />


    <div className="relative flex flex-col md:flex-row md:items-center gap-7">

      {/* Trophy */}

      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shrink-0"
        style={{
          background:
            "linear-gradient(145deg, rgba(124,58,237,0.22), rgba(6,182,212,0.12))",
          border:
            "1px solid rgba(124,58,237,0.25)",
          boxShadow:
            "0 12px 35px rgba(124,58,237,0.2)",
        }}
      >
        🏆
      </div>


      {/* Level information */}

      <div className="flex-1">

        <div className="flex flex-wrap items-center gap-3 mb-2">

          <span
            className="text-xs font-bold tracking-[0.25em] text-cyan-400"
          >
            CREATOR LEVEL
          </span>

          <span
            className="px-3 py-1 rounded-full text-xs font-black text-white"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed, #06b6d4)",
            }}
          >
            LVL {currentLevel}
          </span>

        </div>


        <div className="text-2xl sm:text-3xl font-black text-white mb-1">
          XTRACT GAMING JOURNEY
        </div>

        <div className="text-sm text-slate-500">
          {xp.toLocaleString()} XP earned
        </div>


        {/* XP bar */}

        <div className="mt-5">

          <div className="flex justify-between text-[11px] font-bold tracking-wider text-slate-500 mb-2">
            <span>LEVEL {currentLevel}</span>
            <span>{nextLevelXP.toLocaleString()} XP</span>
          </div>

          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
            }}
          >

            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #7c3aed, #06b6d4)",
                boxShadow:
                  "0 0 15px rgba(124,58,237,0.6)",
                transition: "width 1s ease",
              }}
            />

          </div>

        </div>

      </div>

    </div>

  </div>

<div
  className="overflow-y-auto pr-3"
  style={{
    height: "min(520px, calc(100vh - 360px))",
    minHeight: "320px",
    scrollbarWidth: "thin",
    scrollbarColor:
      "rgba(124,58,237,0.6) rgba(255,255,255,0.04)",
  }}
>

  {/* ACHIEVEMENT GRID */}

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
    
    {achievements.map((achievement) => (
      
      <div
        key={achievement.id}
        className="achievement-card relative overflow-hidden rounded-[24px] p-5 sm:p-6"
        style={{
          background: achievement.unlocked
            ? "linear-gradient(145deg, #141a2e, #0d1222)"
            : "linear-gradient(145deg, #0d111e, #090c16)",

          border: achievement.unlocked
            ? "1px solid rgba(124,58,237,0.2)"
            : "1px solid rgba(255,255,255,0.04)",

          boxShadow: achievement.unlocked
            ? "0 12px 30px rgba(0,0,0,0.35)"
            : "none",

          opacity: achievement.unlocked ? 1 : 0.55,
        }}
      >

        {/* Glow */}

        {achievement.unlocked && (
          <div
            className="absolute -top-16 -right-16 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.16), transparent 70%)",
              filter: "blur(15px)",
            }}
          />
        )}


        {/* Icon */}

        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
          style={{
            background: achievement.unlocked
              ? "rgba(124,58,237,0.12)"
              : "rgba(255,255,255,0.03)",

            border: achievement.unlocked
              ? "1px solid rgba(124,58,237,0.2)"
              : "1px solid rgba(255,255,255,0.04)",

            filter: achievement.unlocked
              ? "none"
              : "grayscale(1)",
          }}
        >
          {achievement.unlocked
            ? achievement.icon
            : "🔒"}
        </div>


        {/* Title */}

        <div
          className={`text-lg font-black tracking-wide ${
            achievement.unlocked
              ? "text-white"
              : "text-slate-500"
          }`}
        >
          {achievement.title}
        </div>


        {/* Description */}

        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {achievement.description}
        </p>


        {/* Requirement */}

        <div className="mt-5 text-[10px] font-bold tracking-[0.18em] uppercase">

          {achievement.unlocked ? (
            <span className="text-cyan-400">
              ✓ UNLOCKED
            </span>
          ) : (
            <span className="text-slate-600">
              🔒 {achievement.requirement}
            </span>
          )}

        </div>

      </div>

    ))}
</div>
  </div>

</section>
    </div>
  </div>
  
)}

        {/* Empty state */}
        {playlists.length === 0 && (
          <div className="text-center py-24">

            <Gamepad2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />

            <h2 className="text-white text-xl font-bold">
              No games found
            </h2>

            <p className="text-slate-500 mt-2">
              Your game library is waiting for its first adventure.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

// ─── Playlist Detail Page ─────────────────────────────────────────────────────

function PlaylistDetailPage({ playlist, onBack }: { playlist: Playlist; onBack: () => void }) {
  return (
    <div className="min-h-screen py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-semibold group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Playlists
        </button>

        {/* Banner */}
        <ClayCard className="mb-12">
          <div className="relative overflow-hidden" style={{ aspectRatio: "3/1", minHeight: 180, maxHeight: 320 }}>
            <img
              src={playlist.thumbnail}
              alt={playlist.name}
              className="w-full h-full object-cover"
              style={{ background: "#141a2e" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, rgba(8,12,24,0.96) 0%, rgba(8,12,24,0.65) 55%, rgba(8,12,24,0.2) 100%)" }}
            />
            <div className="absolute inset-0 flex items-center px-8 sm:px-12">
              <div>
                <span className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase mb-3 block">
                  {playlist.category}
                </span>
                <h1
                  className="font-black text-white mb-3 leading-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
                >
                  {playlist.name}
                </h1>
                <p className="text-slate-300 mb-4 max-w-lg text-sm leading-relaxed hidden sm:block">
                  {playlist.description}
                </p>
                <span
                  className="inline-block text-white text-sm font-bold px-4 py-1.5 rounded-full"
                  style={{ background: "rgba(124,58,237,0.8)", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}
                >
                  {playlist.videoCount} videos
                </span>
              </div>
            </div>
          </div>
        </ClayCard>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlist.videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

function ContactPage() {
  const socials = [
      {
    label: "YouTube",
    icon: <Youtube className="w-5 h-5" />,
    color: "text-red-400",
    border: "rgba(239,68,68,0.35)",
    url: "https://www.youtube.com/@xTracttGG",
  },

   {
    label: "Instagram",
    icon: <Instagram className="w-5 h-5" />,
    color: "text-pink-400",
    border: "rgba(236,72,153,0.35)",
    url: "https://www.instagram.com/xtract_sinju/",
  },
    { icon: <Twitter className="w-5 h-5" />, label: "X / Twitter", color: "text-sky-400", border: "rgba(14,165,233,0.25)" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Discord", color: "text-indigo-400", border: "rgba(99,102,241,0.25)" },
  ];

  return (
    <div
      className="contact-page min-h-screen py-24 px-4 sm:px-8 lg:px-16 flex items-center"
      
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1
            className="font-black text-white mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              textShadow: "0 0 50px rgba(124,58,237,0.35)",
            }}
          >
            {"Let's Connect 🎮"}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Have a business inquiry, collaboration idea, or gaming-related opportunity? I would love to hear from you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Email card */}
          <ClayCard className="mobile-contact-card p-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(145deg, rgba(124,58,237,0.18), rgba(6,182,212,0.09))",
                border: "1px solid rgba(124,58,237,0.28)",
              }}
            >
              <Mail className="w-7 h-7 text-purple-400" />
            </div>
            <h3
              className="font-black text-white text-xl mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Business Inquiries
            </h3>
            <p className="text-slate-400 text-sm mb-5 leading-relaxed">
              For collaborations, sponsorships, and business opportunities.
            </p>
            <a
              href="mailto:sinjuforbusiness@gmail.com"
              className="text-cyan-400 font-semibold text-sm hover:text-cyan-300 transition-colors block mb-6 break-all"
            >
              sinjuforbusiness@gmail.com
            </a>
            <ClayButton
              variant="primary"
              onClick={() => {
                window.location.href =
                  "mailto:sinjuforbusiness@gmail.com" +
                  "?subject=Business%20Inquiry%20-%20xTract%20Portfolio" +
                  "&body=Hello%20xTract%2C%0A%0AI%20would%20like%20to%20discuss...";
              }}
            >
              <Mail className="w-4 h-4" />
              Send Email
            </ClayButton>
          </ClayCard>

          {/* Social card */}
          <ClayCard className="mobile-contact-card p-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl"
              style={{
                background: "linear-gradient(145deg, rgba(6,182,212,0.18), rgba(59,130,246,0.09))",
                border: "1px solid rgba(6,182,212,0.28)",
              }}
            >
              🌐
            </div>
            <h3
              className="font-black text-white text-xl mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Follow & Connect
            </h3>
            <p className="text-slate-400 text-sm mb-5 leading-relaxed">
              Find me across the internet for gaming updates and fresh content.
            </p>
            <div className="space-y-2.5">
              {socials.map((s) => (
                <a
                   key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${s.border}`,
                  }}
                >
                <span className={s.color}>{s.icon}</span>
                <span className="text-white font-semibold text-sm flex-1">
                  {s.label}
                </span>           
                <span className="text-slate-400 text-xs">
                   Visit →
                </span>
                </a>
             ))}
            </div>            
          </ClayCard>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const navLinks: [string, string][] = [["Home", "home"], ["Playlists", "playlists"], ["Contact", "contact"]];
  const socials = [
    { icon: <Youtube className="w-5 h-5" />, color: "text-red-400" },
    { icon: <Instagram className="w-5 h-5" />, color: "text-pink-400" },
    { icon: <Twitter className="w-5 h-5" />, color: "text-sky-400" },
    { icon: <MessageCircle className="w-5 h-5" />, color: "text-indigo-400" },
  ];

  return (
    <footer
      className="py-14 px-4 sm:px-8"
      style={{ background: "#04060f", borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="footer-grid grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <h3
              className="font-black text-white text-2xl mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", textShadow: "0 0 24px rgba(124,58,237,0.4)" }}
            >
              XTRACT
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">PC & Mobile Gaming Across All Genres 🎮</p>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.25em] text-slate-600 uppercase mb-4">Navigation</h4>
            <div className="space-y-2">
              {navLinks.map(([label, page]) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className="block text-slate-500 hover:text-slate-200 transition-colors text-sm font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
  <h4 className="text-xs font-bold tracking-[0.25em] text-slate-600 uppercase mb-4">
    Connect
  </h4>

  <div className="flex gap-3 mb-3">
    {socials.map((s, i) => {
      const url =
        i === 0
          ? "https://www.youtube.com/@xTracttGG"
          : i === 1
          ? "https://www.instagram.com/xtract_sinju/"
          : null;

      return url ? (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} cursor-pointer transition-all duration-300 hover:scale-110`}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {s.icon}
        </a>
      ) : (
        <div
          key={i}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} opacity-40`}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {s.icon}
        </div>
      );
    })}
  </div>

  <p className="text-slate-700 text-xs">
    Follow me on social media
  </p>
</div>
        </div>
        <div className="border-t border-white/[0.04] pt-8 text-center">
          <p className="text-slate-700 text-sm">© 2026 XTRACT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [CHANNEL, setCHANNEL] = useState<any>(null);
  const [PLAYLISTS, setPLAYLISTS] = useState<Playlist[]>([]);
  const [POPULAR_VIDEOS, setPOPULAR_VIDEOS] = useState<Video[]>([]);

  const [FEATURED_VIDEO, setFEATURED_VIDEO] = useState<Video>({
    id: "",
    title: "",
    thumbnail: "",
    views: "",
    date: "",
    duration: "",
    description: "",
  });

  const [totalLikes, setTotalLikes] = useState<number>(0);

  // =========================================
  // CHANNEL STATS ANIMATION
  // =========================================

  const [activeStat, setActiveStat] = useState(0);
  const [displayStat, setDisplayStat] = useState(0);

  // =========================================
  // FETCH YOUTUBE DATA
  // =========================================

  useEffect(() => {
    async function loadYouTubeData() {
      try {
        const response = await fetch(
          "https://xtract-youtube-backend.onrender.com/api/youtube/data"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch YouTube data");
        }

        const data = await response.json();
        console.log("FRONTEND POPULAR VIDEOS:", data.popularVideos);
        
        setCHANNEL(data.channel || null);
        setPLAYLISTS(data.playlists || []);
        setPOPULAR_VIDEOS(data.popularVideos || []);
        setFEATURED_VIDEO(data.featuredVideo || null);
        setTotalLikes(Number(data.totalLikes || 0));
      } catch (error) {
        console.error("YouTube data error:", error);
      }
    }

    loadYouTubeData();
  }, []);

  // =========================================
  // COUNTING ANIMATION
  // =========================================

  useEffect(() => {
    const stats = [
      Number(CHANNEL?.subscribers || 0),
      Number(CHANNEL?.views || 0),
      Number(totalLikes || 0),
    ];

    const target = stats[activeStat];

    // Don't animate if data hasn't loaded yet
    if (!target) {
      setDisplayStat(0);
      return;
    }

    let current = 0;

    const duration = 1200;
    const steps = 40;
    const increment = target / steps;

    const counter = window.setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        window.clearInterval(counter);
      }

      setDisplayStat(Math.floor(current));
    }, duration / steps);

    return () => {
      window.clearInterval(counter);
    };
  }, [activeStat, CHANNEL, totalLikes]);

  // =========================================
  // ROTATE BETWEEN STATS
  // =========================================

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setActiveStat((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
      window.clearInterval(rotationTimer);
    };
  }, []);

  // =========================================
  // NAVIGATION
  // =========================================

  function navigate(page: string, id?: string) {
    setCurrentPage(page);

    if (id) {
      setSelectedPlaylistId(id);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const selectedPlaylist =
    PLAYLISTS.find((p) => p.id === selectedPlaylistId) ?? null;

  const isPlaylistActive =
    currentPage === "playlists" ||
    currentPage === "playlist-detail";

  const isGameLibraryActive =
  currentPage === "game-library";

 return (
  <>
    <BackgroundMusic />

    <video
      src="/bg.mp4"
      autoPlay
      muted
      loop
      playsInline
      className="fixed inset-0 w-full h-full object-cover"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        zIndex: -10,
        pointerEvents: "none",
      }}
    />

    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "rgba(4, 7, 18, 0.55)",
        zIndex: -9,
      }}
    />

    <div
      className="relative min-h-screen"
      style={{
        zIndex: 1,
        fontFamily: "'Inter', sans-serif",
      }}
    >

      {/* EVERYTHING YOU ALREADY HAVE */}
        {/* =========================================
            ANIMATIONS
        ========================================= */}

        <style>{`
          @keyframes playPulse {
            0%, 100% {
              box-shadow:
                0 0 24px rgba(124,58,237,0.65),
                0 4px 12px rgba(0,0,0,0.5);
            }

            50% {
              box-shadow:
                0 0 48px rgba(124,58,237,1),
                0 4px 18px rgba(0,0,0,0.6);
            }
          }

          @keyframes floatBadge {
            0%, 100% {
              transform: translateY(0px);
            }

            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes gameFocusIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes gameFocusPanel {
  from {
    opacity: 0;
    transform: perspective(1200px)
      scale(0.88)
      rotateX(6deg);
  }

  to {
    opacity: 1;
    transform: perspective(1200px)
      scale(1)
      rotateX(0deg);
  }
}

          /* =========================================
             HOMEPAGE ANIMATIONS
          ========================================= */

          @keyframes heroEntrance {
            0% {
              opacity: 0;
              transform: translateY(35px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* HERO: continuous 3D Y-axis orbit */

          @keyframes heroOrbit {
            0% {
              transform: rotateY(0deg);
            }

            23.8095% {
              transform: rotateY(360deg);
            }

            100% {
              transform: rotateY(360deg);
            }
          }

          /* HERO RIGHT-SIDE VISUAL */

          @keyframes heroVisualEntrance {
            0% {
              opacity: 0;
              transform: translateX(45px) scale(0.96);
            }

            100% {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          /* Continuous gentle floating */

          @keyframes continuousFloat {
            0% {
              transform: translate3d(0, 0, 0);
            }

            50% {
              transform: translate3d(0, -10px, 0);
            }

            100% {
              transform: translate3d(0, 0, 0);
            }
          }

          /* Background glow */

          @keyframes glowFloat {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(1);
            }

            50% {
              transform: translate(-50%, -50%) scale(1.12);
            }
          }

          /* Moving grid */

          @keyframes gridMove {
            from {
              background-position: 0 0;
            }

            to {
              background-position: 60px 60px;
            }
          }

          /* Feature/card entrance */

          @keyframes cardReveal {
            from {
              opacity: 0;
              transform: translateY(25px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /*Stat number entrance*/

          .stat-card {
  transition:
    transform 0.45s ease,
    box-shadow 0.45s ease,
    border-color 0.45s ease;
}

.stat-card-active {
  transform: translateY(-6px) scale(1.015);
  border-color: rgba(124, 58, 237, 0.35) !important;

  box-shadow:
    0 12px 35px rgba(0,0,0,0.45),
    0 0 30px rgba(124,58,237,0.16),
    inset 0 1px 0 rgba(255,255,255,0.08) !important;
}

          /* =========================================
             HERO CLASSES
          ========================================= */

          .hero-orbit {
            perspective: 1400px;
            transform-style: preserve-3d;
          }

          .hero-orbit-inner {
            transform-style: preserve-3d;
            animation: heroOrbit 10.5s linear infinite;
          }

          .hero-orbit-card {
            transform: translateZ(220px);
            transform-style: preserve-3d;
          }

          /*
             The gaming visual first enters from the right,
             then continuously floats.
          */

          .hero-visual-enter {
            animation:
              heroVisualEntrance 1s cubic-bezier(0.22, 1, 0.36, 1)
              0.2s both;
          }

          /* =========================================
             LOWER HOMEPAGE SECTIONS
          ========================================= */

          .card-reveal {
            animation:
              cardReveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) both,
              continuousFloat 5.5s ease-in-out 0.65s infinite;
          }

          .card-float {
            animation:
              continuousFloat 5s ease-in-out 0.65s infinite;
          }

          /* Featured section itself */

          .section-reveal {
            animation:
              cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .section-float {
            animation:
              continuousFloat 6s ease-in-out 0.8s infinite;
          }

          .floating-visual {
            will-change: transform;
            transform: translate3d(0, 0, 0);
          }

          /* Hero background */

          .hero-grid {
            animation: gridMove 18s linear infinite;
          }

          .hero-glow {
            animation: glowFloat 7s ease-in-out infinite;
          }

          /* =========================================
             CHANNEL STATS
          ========================================= */

          .stat-value {
            transition:
              transform 0.45s ease,
              opacity 0.45s ease,
              filter 0.45s ease;
          }

          .stat-value.stat-active {
            animation: statNumberEnter 0.6s ease-out;
          }

          @keyframes statNumberEnter {
            0% {
              opacity: 0;
              transform: translateY(18px) rotateX(-35deg);
              filter: blur(6px);
            }

            60% {
              opacity: 1;
              transform: translateY(-3px) rotateX(5deg);
              filter: blur(0);
            }

            100% {
              opacity: 1;
              transform: translateY(0) rotateX(0deg);
              filter: blur(0);
            }
          }

          .game-library-card {
  transform-style: preserve-3d;
  will-change: transform;
  transition:
    transform 0.12s ease-out,
    box-shadow 0.35s ease;
}

.game-library-card:hover {
  box-shadow:
    0 25px 55px rgba(0,0,0,0.55),
    0 0 35px rgba(124,58,237,0.22);
}


          /* =========================================
             MOBILE RESPONSIVE OPTIMIZATION
             Desktop styling remains unchanged.
          ========================================= */

          /* Prevent long labels / controls from creating horizontal overflow. */
          .clay-button {
            min-width: 0;
            max-width: 100%;
            white-space: normal;
            text-align: center;
            line-height: 1.25;
            flex-shrink: 1;
          }

          @media (max-width: 639px) {
            html,
            body,
            #root {
              width: 100%;
              max-width: 100%;
              overflow-x: hidden !important;
            }

            body {
              -webkit-text-size-adjust: 100%;
            }

            /* Top navigation */
            nav.fixed.top-0 {
              min-height: 64px;
              padding: 0.65rem 0.75rem !important;
              gap: 0.55rem;
            }

            nav.fixed.top-0 > button:nth-child(2) {
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 0.95rem;
            }

            /* Sidebar */
            .mobile-sidebar {
              width: min(300px, 88vw) !important;
              max-width: 88vw;
            }

            /* All major sections use compact mobile spacing. */
            section,
            .playlist-detail-page,
            .contact-page {
              max-width: 100%;
            }

            /* Hero */
            .hero-title {
              font-size: clamp(3.2rem, 18vw, 5.5rem) !important;
              line-height: 0.95 !important;
              letter-spacing: -0.04em;
              overflow-wrap: anywhere;
              word-break: break-word;
            }

            .hero-subtitle {
              font-size: 0.82rem !important;
              line-height: 1.35 !important;
            }

            .hero-bio {
              font-size: 0.82rem !important;
              line-height: 1.55 !important;
              text-align: left !important;
              min-height: 0 !important;
              height: auto !important;
              padding: 1rem !important;
              margin-bottom: 1.25rem !important;
            }

            .hero-features {
              gap: 0.65rem !important;
              margin-bottom: 1.5rem !important;
            }

            .hero-features > div {
              padding: 0.8rem !important;
              min-width: 0;
            }

            .hero-features > div > span {
              font-size: 1.35rem;
              flex-shrink: 0;
            }

            .hero-features > div > div {
              min-width: 0;
            }

            .hero-features .text-sm {
              font-size: 0.76rem;
              line-height: 1.25;
            }

            .hero-features .text-xs {
              font-size: 0.68rem;
              line-height: 1.35;
            }

            .hero-actions {
              width: 100%;
              display: flex;
              flex-direction: column;
              gap: 0.7rem !important;
            }

            .hero-actions .clay-button {
              width: 100%;
              min-height: 46px;
              padding: 0.75rem 0.9rem !important;
            }

            /* Section headings: allow the title to wrap instead of pushing the line off-screen. */
            .section-heading-title {
              white-space: normal !important;
              font-size: 1.35rem !important;
              line-height: 1.1 !important;
            }

            /* Featured video */
            .featured-content {
              padding: 1.15rem !important;
            }

            .featured-content h3 {
              font-size: 1.15rem !important;
              line-height: 1.3 !important;
            }

            .featured-content .flex.gap-5 {
              flex-wrap: wrap;
              gap: 0.75rem !important;
            }

            .featured-content .clay-button {
              width: 100%;
            }

            /* Stats */
            .mobile-stat-card {
              padding: 1.25rem !important;
              border-radius: 1.25rem !important;
            }

            .mobile-stat-card .text-4xl {
              font-size: 2rem !important;
            }

            .mobile-stat-card .tracking-\[0\.2em\] {
              letter-spacing: 0.12em !important;
              font-size: 0.7rem !important;
            }

            /* Cards */
            .rounded-2xl,
            .rounded-3xl {
              max-width: 100%;
            }

            /* Playlist / video card content */
            .p-5 {
              padding: 1rem !important;
            }

            .p-6 {
              padding: 1rem !important;
            }

            .video-card,
            .playlist-card {
              min-width: 0;
            }

            /* Game library */
            .game-library-page {
              padding-top: 1.5rem;
              padding-bottom: 2rem;
            }

            .game-library-page > .max-w-7xl {
              width: 100%;
            }

            .game-library-page .text-center {
              margin-bottom: 2.25rem;
            }

            .game-library-page .text-center h1 {
              font-size: clamp(2rem, 13vw, 3rem) !important;
              line-height: 1 !important;
            }

            .game-library-page .text-center p {
              font-size: 0.9rem;
            }

            .game-library-page .grid {
              gap: 1rem !important;
            }

            .game-library-card {
              border-radius: 1.25rem !important;
            }

            .game-library-card .p-6 {
              padding: 1rem !important;
            }

            .game-library-card h2 {
              font-size: 1.05rem !important;
              line-height: 1.2;
              overflow-wrap: anywhere;
            }

            .game-library-card .text-sm {
              font-size: 0.78rem;
            }

            /* On touch screens there is no useful mouse tilt; keep cards stable and readable. */
            .game-library-card {
              transform: none !important;
            }

            /* Game detail modal */
            .game-modal {
              padding: 0.65rem !important;
              align-items: center !important;
            }

            .game-modal-panel {
              width: 100% !important;
              max-width: 100% !important;
              max-height: 94vh;
              overflow-y: auto !important;
              border-radius: 1.25rem !important;
            }

            .game-modal-panel > .grid {
              grid-template-columns: 1fr !important;
            }

            .game-modal-panel .min-h-\[300px\] {
              min-height: 190px !important;
              height: 190px;
            }

            .game-modal-panel .p-8,
            .game-modal-panel .sm\:p-12 {
              padding: 1.1rem !important;
            }

            .game-modal-panel h2 {
              font-size: 1.75rem !important;
              line-height: 1.1 !important;
              overflow-wrap: anywhere;
              padding-right: 2.2rem;
            }

            .game-modal-panel .grid-cols-2 {
              gap: 0.6rem !important;
            }

            .game-modal-panel .grid-cols-2 > div {
              padding: 0.85rem !important;
            }

            .game-modal-panel .w-10.h-10 {
              width: 2.25rem !important;
              height: 2.25rem !important;
            }

            .game-modal-panel > button {
              top: 0.65rem !important;
              right: 0.65rem !important;
              width: 2.35rem !important;
              height: 2.35rem !important;
            }

            /* Playlist detail banner */
            .playlist-detail-page {
              padding-top: 1.5rem !important;
            }

            .playlist-detail-page .mb-12 {
              margin-bottom: 1.75rem !important;
            }

            .playlist-detail-page .relative.overflow-hidden[style*="3/1"] {
              min-height: 190px !important;
              aspect-ratio: 16 / 9 !important;
            }

            .playlist-detail-page .absolute.inset-0.flex.items-center {
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }

            .playlist-detail-page .absolute.inset-0.flex.items-center h1 {
              font-size: 1.7rem !important;
              max-width: 75%;
              overflow-wrap: anywhere;
            }

            .playlist-detail-page .grid {
              gap: 1rem !important;
            }

            /* Contact */
            .contact-page {
              padding-top: 2rem !important;
              padding-bottom: 2rem !important;
            }

            .mobile-contact-card {
              padding: 1.1rem !important;
            }

            .mobile-contact-card .clay-button {
              width: 100%;
            }

            .mobile-contact-card a {
              max-width: 100%;
            }

            /* Footer */
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 1.75rem !important;
              margin-bottom: 2rem !important;
            }

            footer {
              padding-top: 2.5rem !important;
              padding-bottom: 2rem !important;
            }

            /* Keep decorative 3D elements from causing accidental horizontal overflow. */
            .hero-orbit {
              max-width: 100%;
            }

            /* Make generic buttons comfortable tap targets without forcing them wider. */
            button,
            a {
              max-width: 100%;
            }

            button {
              -webkit-tap-highlight-color: transparent;
            }
          }

          /* =========================================
             ACCESSIBILITY
          ========================================= */

          @media (prefers-reduced-motion: reduce) {
            .hero-orbit,
            .hero-orbit-inner,
            .hero-visual-enter,
            .hero-orbit-card,
            .card-reveal,
            .card-float,
            .section-reveal,
            .section-float,
            .floating-visual,
            .hero-grid,
            .hero-glow,
            .stat-value.stat-active {
              animation: none !important;
            }
          }

          html,
body,
#root {
  width: 100%;
  min-height: 100%;
  height: auto;
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

body {
  margin: 0;
}

          ::-webkit-scrollbar {
            width: 5px;
          }

          ::-webkit-scrollbar-track {
            background: #080c18;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(124,58,237,0.35);
            border-radius: 9999px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(124,58,237,0.55);
          }
        `}</style>

        {/* =========================================
            SIDEBAR
        ========================================= */}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={navigate}
          playlists={PLAYLISTS}
        />

        {/* =========================================
            TOPBAR
        ========================================= */}

        <nav
          className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 sm:px-8 py-4"
          style={{
            background: "rgba(8,12,24,0.82)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {/* Hamburger */}

          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 shrink-0"
            style={{
              background:
                "linear-gradient(145deg, #1a2240, #141a2e)",
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
              border:
                "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Logo */}

          <button
            onClick={() => navigate("home")}
            className="font-black text-white text-lg tracking-widest flex-1 text-left sm:text-center"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              textShadow:
                "0 0 20px rgba(124,58,237,0.4)",
            }}
          >
            XTRACT
          </button>

          {/* Desktop nav */}

          <div className="hidden sm:flex items-center gap-1">
            {([
  ["Home", "home"],
  ["Playlists", "playlists"],
  ["Game Library", "game-library"],
  ["Contact", "contact"],
] as [string, string][]).map(([label, page]) => {
              const active =
                currentPage === page ||
                (page === "playlists" && isPlaylistActive) ||
                (page === "game-library" && isGameLibraryActive);

              return (
                <button
                  key={page}
                  onClick={() => navigate(page)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(145deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08))",
                          border:
                            "1px solid rgba(124,58,237,0.28)",
                        }
                      : {}
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Contact */}

          <ClayButton
            variant="primary"
            href="mailto:sinjuforbusiness@gmail.com"
            className="shrink-0 text-xs px-4 py-2.5 hidden sm:inline-flex"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact
          </ClayButton>
        </nav>

        {/* =========================================
            PAGES
        ========================================= */}

        <div className="pt-[72px]">
          {currentPage === "home" && (
            <HomePage
  onNavigate={navigate}
  playlists={PLAYLISTS}
  featuredVideo={FEATURED_VIDEO}
  popularVideos={POPULAR_VIDEOS}
  channel={CHANNEL}
  totalLikes={totalLikes}
  activeStat={activeStat}
  displayStat={displayStat}
/>
          )}

          {currentPage === "playlists" && (
            <PlaylistsPage
              playlists={PLAYLISTS}
              onSelect={(id) =>
                navigate("playlist-detail", id)
              }
            />
          )}

          {currentPage === "game-library" && (
    <GameLibraryPage
      playlists={PLAYLISTS}
      onSelect={id => navigate("playlist-detail", id)}
    />
  )}

          {currentPage === "playlist-detail" &&
            selectedPlaylist && (
              <PlaylistDetailPage
                playlist={selectedPlaylist}
                onBack={() => navigate("playlists")}
              />
            )}

          {currentPage === "contact" && <ContactPage />}
        </div>

        {/* =========================================
            FOOTER
        ========================================= */}

        <Footer onNavigate={navigate} />
      </div>
    </>
  );
}