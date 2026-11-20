import { Suspense } from "react";
import {
  EquipmentDetailsLoadingFallback,
  EquipmentDetailsSkeleton,
} from "@/components/equipment/equipment-details";

/**
 * Route-level loading state for the Equipment Details page.
 *
 * The full skeleton includes the navbar, and Header reads `usePathname()`
 * — a value Next can only resolve at runtime. Rendering it inside Suspense
 * lets the static, hook-free fallback be prerendered while the navbar
 * version streams in, so the route never blocks (or errors) on prerender.
 */
export default function EquipmentDetailsLoading() {
  return (
    <Suspense fallback={<EquipmentDetailsLoadingFallback />}>
      <EquipmentDetailsSkeleton />
    </Suspense>
  );
}
