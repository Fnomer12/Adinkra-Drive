import { createClient } from "@/lib/supabase/server";

export type Vehicle = {
  id: string;
  title: string;
  category: "rent" | "sale";
  price: number;
  image_url: string | null;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  description: string;
  status: "available" | "in_use" | "purchased";
};

export async function getVehiclesByCategory(category: "rent" | "sale") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Failed to load ${category} vehicles:`, error);
    return [];
  }

  return ((data as Vehicle[]) || []);
}