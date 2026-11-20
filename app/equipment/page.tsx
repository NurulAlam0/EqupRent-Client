import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { EquipmentBrowser } from "@/components/equipment/equipment-browser";

export const metadata: Metadata = {
  title: "All Equipment | Rentora",
  description:
    "Search and filter approved equipment available to rent on Rentora.",
};

export default function EquipmentPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <EquipmentBrowser />
      </main>
      <Footer />
    </div>
  );
}
