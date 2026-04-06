import VehicleListingPage from "@/components/VehicleListingPage";
import { getVehiclesByCategory } from "@/lib/vehicles";

export const revalidate = 60;

export default async function RentPage() {
  const vehicles = await getVehiclesByCategory("rent");

  return <VehicleListingPage vehicles={vehicles} mode="rent" />;
}