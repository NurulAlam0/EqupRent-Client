import type { Metadata } from "next";
import { EquipmentDetails } from "@/components/equipment/equipment-details";

export const metadata: Metadata = {
  title: "Equipment Details | Rentora",
  description:
    "Full equipment details, owner information and rental terms on Rentora.",
};

/**
 * Private route — EquipmentDetails waits for the session verdict and
 * bounces signed-out visitors to /login?next=... (never on reload while
 * signed in, because `undefined` renders the skeleton instead).
 */
export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EquipmentDetails id={id} />;
}
