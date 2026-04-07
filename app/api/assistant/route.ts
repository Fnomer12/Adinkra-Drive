import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { companyContext } from "@/lib/company-context";

type VehicleRow = {
  id: string;
  title: string;
  category: "rent" | "sale";
  price: number;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  description: string;
  status: "available" | "in_use" | "purchased";
};

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function extractBudget(question: string): number | null {
  const match = question.match(/(\$|ghs|gh¢|usd)?\s?(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (!match) return null;
  return Number(match[2].replace(/,/g, ""));
}

function formatVehicle(vehicle: VehicleRow) {
  const priceText =
    vehicle.category === "rent"
      ? `$${Number(vehicle.price).toLocaleString()}/day`
      : `$${Number(vehicle.price).toLocaleString()}`;

  return `${vehicle.title} (${vehicle.brand} ${vehicle.model} ${vehicle.year}) - ${priceText} - ${vehicle.status}`;
}

function answerFromData(question: string, vehicles: VehicleRow[]) {
  const q = normalize(question);
  const availableVehicles = vehicles.filter((v) => v.status === "available");
  const rentals = availableVehicles.filter((v) => v.category === "rent");
  const sales = availableVehicles.filter((v) => v.category === "sale");

  if (
    q.includes("location") ||
    q.includes("address") ||
    q.includes("where are you")
  ) {
    return `Adinkra Drive is located in ${companyContext.location}. You can contact us on ${companyContext.phone} or ${companyContext.email}.`;
  }

  if (
    q.includes("contact") ||
    q.includes("phone") ||
    q.includes("email")
  ) {
    return `You can contact Adinkra Drive on ${companyContext.phone} or by email at ${companyContext.email}.`;
  }

  if (q.includes("chauffeur")) {
    return `Yes, Adinkra Drive offers chauffeur services for rental bookings, depending on availability.`;
  }

  if (q.includes("payment")) {
    return `We currently support these payment methods: ${companyContext.paymentMethods.join(", ")}.`;
  }

  if (q.includes("available") && q.includes("rent")) {
    if (!rentals.length) return "There are currently no available rental vehicles.";
    return `Available rental vehicles include: ${rentals.map(formatVehicle).join("; ")}.`;
  }

  if (q.includes("available") && (q.includes("buy") || q.includes("sale"))) {
    if (!sales.length) return "There are currently no available vehicles for sale.";
    return `Available vehicles for sale include: ${sales.map(formatVehicle).join("; ")}.`;
  }

  const budget = extractBudget(question);

  if (budget !== null) {
    if (q.includes("rent")) {
      const affordableRentals = rentals
        .filter((v) => Number(v.price) <= budget)
        .sort((a, b) => a.price - b.price);

      if (affordableRentals.length) {
        return `With a budget of $${budget.toLocaleString()}, you can rent: ${affordableRentals
          .map(formatVehicle)
          .join("; ")}.`;
      }

      const cheapestRental = rentals.sort((a, b) => a.price - b.price)[0];
      if (!cheapestRental) return "There are currently no available rental vehicles.";
      return `There is no available rental within $${budget.toLocaleString()}. The cheapest available rental is ${formatVehicle(
        cheapestRental
      )}.`;
    }

    if (q.includes("buy") || q.includes("purchase") || q.includes("sale")) {
      const affordableSales = sales
        .filter((v) => Number(v.price) <= budget)
        .sort((a, b) => a.price - b.price);

      if (affordableSales.length) {
        return `With a budget of $${budget.toLocaleString()}, you can buy: ${affordableSales
          .map(formatVehicle)
          .join("; ")}.`;
      }

      const cheapestSale = sales.sort((a, b) => a.price - b.price)[0];
      if (!cheapestSale) return "There are currently no available vehicles for sale.";
      return `There is no available vehicle for sale within $${budget.toLocaleString()}. The cheapest available purchase option is ${formatVehicle(
        cheapestSale
      )}.`;
    }

    const affordableRentals = rentals
      .filter((v) => Number(v.price) <= budget)
      .sort((a, b) => a.price - b.price);

    const affordableSales = sales
      .filter((v) => Number(v.price) <= budget)
      .sort((a, b) => a.price - b.price);

    if (!affordableRentals.length && !affordableSales.length) {
      const cheapestRental = rentals.sort((a, b) => a.price - b.price)[0];
      const cheapestSale = sales.sort((a, b) => a.price - b.price)[0];

      return `With a budget of $${budget.toLocaleString()}, there are no current buy or rent options available within budget. ${
        cheapestRental ? `Cheapest rental: ${formatVehicle(cheapestRental)}.` : ""
      } ${cheapestSale ? `Cheapest purchase: ${formatVehicle(cheapestSale)}.` : ""}`.trim();
    }

    return `With a budget of $${budget.toLocaleString()}, here is what you can do: ${
      affordableRentals.length
        ? `Rent: ${affordableRentals.map(formatVehicle).join("; ")}. `
        : ""
    }${
      affordableSales.length
        ? `Buy: ${affordableSales.map(formatVehicle).join("; ")}.`
        : ""
    }`.trim();
  }

  if (q.includes("rent")) {
    if (!rentals.length) return "There are currently no available rental vehicles.";
    return `Available rental options are: ${rentals.map(formatVehicle).join("; ")}.`;
  }

  if (q.includes("buy") || q.includes("purchase") || q.includes("sale")) {
    if (!sales.length) return "There are currently no available vehicles for sale.";
    return `Available vehicles for sale are: ${sales.map(formatVehicle).join("; ")}.`;
  }

  return `I can help with rentals, purchases, budgets, vehicle availability, company contact details, and chauffeur service. For example, you can ask: "What can I rent for $300?" or "Which cars can I buy for $20,000?"`;
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "A valid question is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        id,
        title,
        category,
        price,
        brand,
        model,
        year,
        transmission,
        fuel_type,
        seats,
        description,
        status
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Assistant vehicle fetch error:", error);
      return NextResponse.json(
        { error: "Could not load company vehicle data." },
        { status: 500 }
      );
    }

    const vehicles = (data || []) as VehicleRow[];
    const answer = answerFromData(question, vehicles);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Assistant route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}