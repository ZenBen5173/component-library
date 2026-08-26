"use client";

/**
 * @name Video Player
 * @description Media-chrome player with a mix-blend control bar that sits over the footage rather than below it.
 * @tags video, player, media, controls, versatile
 * @height 560
 * @deps media-chrome, framer-motion
 * @note The sample stream is remote (media.w3.org), so the preview needs network access. Swap in a local file under /public for offline work.
 * @source src/components/ui/skiper-ui/skiper67.tsx
 */
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
} from "@/components/ui/skiper-ui/skiper67";

export default function VideoPlayerDemo() {
  return (
    <div className="grid min-h-[560px] w-full place-items-center bg-background p-6">
      <div className="relative aspect-video w-full max-w-3xl">
        <VideoPlayer style={{ width: "100%", height: "100%" }}>
          <VideoPlayerContent
            src="https://media.w3.org/2010/05/sintel/trailer.mp4"
            poster="https://media.w3.org/2010/05/sintel/poster.png"
            slot="media"
            playsInline
            className="size-full object-cover"
          />
          <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-3 px-5 py-4 mix-blend-exclusion">
            <VideoPlayerPlayButton className="h-4 bg-transparent" />
            <VideoPlayerTimeRange className="bg-transparent" />
            <VideoPlayerTimeDisplay className="bg-transparent" showDuration />
            <VideoPlayerMuteButton className="size-4 bg-transparent" />
          </VideoPlayerControlBar>
        </VideoPlayer>
      </div>
    </div>
  );
}
