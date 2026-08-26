"use client";

/**
 * @name Carousel
 * @description Stacked card carousel — cards recede behind the active one, with autoplay, arrows and indicators.
 * @tags carousel, slider, testimonials, cards, app
 * @height 620
 * @deps motion
 * @note A depth stack rather than a flat filmstrip, so the neighbours stay visible. Autoplay is on here; turn it off if the content needs reading.
 * @source src/components/smoothui/reviews-carousel/index.tsx
 */
import ReviewsCarousel from "@/components/smoothui/reviews-carousel";

const REVIEWS = [
  { id: 1, title: "Cut our deploy time in half", author: "Ada Okafor · Northbound", body: "We went from a fifteen minute pipeline to under four. The preview URLs alone changed how the team reviews work." },
  { id: 2, title: "The rollback saved us", author: "Ravi Menon · Ledgerline", body: "Bad migration went out on a Friday. Promoting the previous deploy took one click and about nine seconds." },
  { id: 3, title: "Finally, sane environments", author: "Lena Fischer · Halcyon", body: "Every pull request gets its own URL with its own database branch. Design reviews stopped needing a call." },
  { id: 4, title: "Support actually answers", author: "Tomas Silva · Meridian", body: "Asked a question about edge caching at 2am and had a real answer, with a code sample, before standup." },
];

export default function CarouselDemo() {
  return (
    <div className="grid min-h-[620px] place-items-center bg-background p-10">
      <div className="w-full max-w-lg">
        <ReviewsCarousel reviews={REVIEWS} autoPlay showIndicators showNavigation />
      </div>
    </div>
  );
}
