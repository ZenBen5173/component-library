"use client";

/**
 * @name Music Player
 * @description Floating player with artwork, a decorative equalizer, seekable progress and a collapsed pill mode.
 * @tags player, audio, widget, floating, cool
 * @height 480
 * @deps framer-motion
 * @source src/components/ui/music-player.tsx
 */
import { MusicPlayer } from "@/components/ui/music-player";

const TRACKS = [
  {
    title: "Nightdrive",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    artwork: "https://picsum.photos/seed/track-1/400/400",
  },
  {
    title: "Low Tide",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    artwork: "https://picsum.photos/seed/track-2/400/400",
  },
  {
    title: "Afterglow",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    artwork: "https://picsum.photos/seed/track-3/400/400",
  },
];

export default function MusicPlayerDemo() {
  return (
    <div className="grid min-h-[480px] place-items-center bg-neutral-950 p-8">
      <MusicPlayer tracks={TRACKS} accentColor="#a78bfa" />
    </div>
  );
}
