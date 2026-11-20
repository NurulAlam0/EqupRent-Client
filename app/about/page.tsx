import type { Metadata } from "next";
import { AboutContent } from "@/components/about/about-content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "About Rentora | Equipment Rental Made Simple",
  description:
    "Learn how Rentora connects people with dependable equipment rentals for work, creativity, and everyday projects.",
};

/**
 * About page — server shell only, so `metadata` keeps working. The section
 * markup (hero, mission, stats, renter/owner sides, values, FAQ) lives in the
 * client component because it uses the same framer-motion reveals as home.
 */
export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AboutContent />
      </main>
      <Footer />
    </div>
  );
}
