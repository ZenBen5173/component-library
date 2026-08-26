"use client";

/**
 * @name FAQ Accordion
 * @description Disclosure list with a smooth height transition — the standard bottom-of-page FAQ block.
 * @tags website, faq, accordion, disclosure, versatile
 * @height 620
 * @deps framer-motion
 * @source src/components/ui/faq-accordion.tsx
 */
import { FaqAccordion } from "@/components/ui/faq-accordion";

const ITEMS = [
  {
    question: "Can I use these components commercially?",
    answer:
      "Yes. Copy the file into your project and treat it as your own code — there is no runtime dependency on this library.",
  },
  {
    question: "Do I need Tailwind?",
    answer:
      "Every component here is styled with Tailwind utility classes, so you need Tailwind v4 configured. The tokens come from the shadcn base theme.",
  },
  {
    question: "How do I customise one?",
    answer:
      "Edit it directly. Because the source lives in your repo rather than in node_modules, there is nothing to override or fight.",
  },
  {
    question: "What about dark mode?",
    answer:
      "Components use `dark:` variants throughout and follow whatever sets the `dark` class on <html> — next-themes here.",
  },
];

export default function FaqAccordionDemo() {
  return (
    <div className="min-h-[620px] bg-white px-6 py-16 dark:bg-black">
      <FaqAccordion items={ITEMS} title="Frequently asked" />
    </div>
  );
}
