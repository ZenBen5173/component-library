"use client";

/**
 * @name Books Showcase
 * @description 3D bookshelf — books tilt, open and reveal a detail panel. Works for any collectible catalogue, not just books.
 * @tags cool, showcase, 3d, carousel, books
 * @height 820
 * @deps framer-motion, gsap
 * @source src/components/ui/books-showcase.tsx
 */
import { BooksShowcase, type BookCfg } from "@/components/ui/books-showcase";

const BOOKS: BookCfg[] = [
  {
    id: "book1",
    title: "Machine Learning",
    author: "Vengeance AI",
    year: "2024",
    stars: 5,
    desc: "A guide to understanding machine learning algorithms and where they actually belong in a product.",
    spineBg: "#1e1e1e",
    spineInk: "#ffffff",
    spineFont: "700 42px Georgia",
    backBg: "#1e1e1e",
    backInk: "255,255,255",
    edge: "#e0d6c8",
    images: {
      front: "https://picsum.photos/seed/book-ml-front/600/900",
      spine: "https://picsum.photos/seed/book-ml-spine/120/900",
      back: "https://picsum.photos/seed/book-ml-back/600/900",
    },
  },
  {
    id: "book2",
    title: "Neural Networks",
    author: "Vengeance AI",
    year: "2024",
    stars: 5,
    desc: "Architecture, training and deployment — the parts that survive contact with real workloads.",
    spineBg: "#f0f0f0",
    spineInk: "#000000",
    spineFont: "700 42px sans-serif",
    backBg: "#f0f0f0",
    backInk: "0,0,0",
    edge: "#ffffff",
    images: {
      front: "https://picsum.photos/seed/book-nn-front/600/900",
      spine: "https://picsum.photos/seed/book-nn-spine/120/900",
      back: "https://picsum.photos/seed/book-nn-back/600/900",
    },
  },
  {
    id: "book3",
    title: "Systems Design",
    author: "Vengeance AI",
    year: "2025",
    stars: 4,
    desc: "Trade-offs first: consistency, latency and cost, and what each one buys you.",
    spineBg: "#2b3a55",
    spineInk: "#ffffff",
    spineFont: "700 42px Georgia",
    backBg: "#2b3a55",
    backInk: "255,255,255",
    edge: "#dcd6c8",
    images: {
      front: "https://picsum.photos/seed/book-sd-front/600/900",
      spine: "https://picsum.photos/seed/book-sd-spine/120/900",
      back: "https://picsum.photos/seed/book-sd-back/600/900",
    },
  },
];

export default function BooksShowcaseDemo() {
  return (
    <div className="min-h-[820px]">
      <BooksShowcase books={BOOKS} heroTitle="Library" navTitle="Shelf" />
    </div>
  );
}
