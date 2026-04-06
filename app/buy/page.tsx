import VehicleListingPage from "@/components/VehicleListingPage";
import { getVehiclesByCategory } from "@/lib/vehicles";

export const revalidate = 60;

export default async function BuyPage() {
  const vehicles = await getVehiclesByCategory("sale");

  return <VehicleListingPage vehicles={vehicles} mode="sale" />;
}