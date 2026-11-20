import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { FeaturedEquipment } from "@/components/home/featured";
import { Categories } from "@/components/home/categories";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { PopularEquipment } from "@/components/home/popular";
import { HowItWorks } from "@/components/home/how-it-works";
import { Reviews } from "@/components/home/reviews";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col">
      <Header />
      <Hero />
      <FeaturedEquipment />
      <Categories />
      <WhyChooseUs />
      <PopularEquipment />
      <HowItWorks />
      <Reviews />
      <Footer />
    </div>
  );
}
