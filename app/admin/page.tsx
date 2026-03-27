"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type VehicleStatus = "available" | "in_use" | "purchased";
type VehicleCategory = "rent" | "sale";
type AdminTab = "vehicles" | "gps" | "employees" | "attendance";
type EmployeeRole =
  | "Driver"
  | "Operations Manager"
  | "Sales Manager"
  | "Fleet Supervisor"
  | "Customer Relations"
  | "Admin Staff";
type AttendanceStatus = "present" | "absent" | "late" | "off";

type Vehicle = {
  id: string;
  title: string;
  category: VehicleCategory;
  price: number;
  image_url: string | null;
  image_path: string | null;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  description: string;
  status: VehicleStatus;
  created_at?: string;
};

type VehicleFormState = {
  title: string;
  category: VehicleCategory;
  price: string;
  brand: string;
  model: string;
  year: string;
  transmission: string;
  fuel_type: string;
  seats: string;
  description: string;
  status: VehicleStatus;
};

type Employee = {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: "active" | "off";
};

type EmployeeFormState = {
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: "active" | "off";
};

const BUCKET = "vehicle-images";
const supabase = createClient();

const emptyVehicleForm: VehicleFormState = {
  title: "",
  category: "rent",
  price: "",
  brand: "",
  model: "",
  year: "",
  transmission: "",
  fuel_type: "",
  seats: "",
  description: "",
  status: "available",
};

const emptyEmployeeForm: EmployeeFormState = {
  name: "",
  role: "Driver",
  phone: "",
  email: "",
  status: "active",
};

const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Kwame Mensah",
    role: "Driver",
    phone: "+233 24 000 0001",
    email: "kwame@adinkradrive.com",
    status: "active",
  },
  {
    id: "emp-2",
    name: "Abena Owusu",
    role: "Operations Manager",
    phone: "+233 24 000 0002",
    email: "abena@adinkradrive.com",
    status: "active",
  },
  {
    id: "emp-3",
    name: "Kojo Asante",
    role: "Customer Relations",
    phone: "+233 24 000 0003",
    email: "kojo@adinkradrive.com",
    status: "active",
  },
];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("vehicles");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLoadFailed, setVehicleLoadFailed] = useState(false);

  const [vehicleForm, setVehicleForm] =
    useState<VehicleFormState>(emptyVehicleForm);
  const [vehicleEditingId, setVehicleEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingImagePath, setExistingImagePath] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [vehicleFilter, setVehicleFilter] =
    useState<"all" | VehicleCategory>("all");

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [employeeForm, setEmployeeForm] =
    useState<EmployeeFormState>(emptyEmployeeForm);

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    {
      "emp-1": "present",
      "emp-2": "late",
      "emp-3": "absent",
    }
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    if (vehicleFilter === "all") return vehicles;
    return vehicles.filter((vehicle) => vehicle.category === vehicleFilter);
  }, [vehicles, vehicleFilter]);

  const rentedVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.category === "rent"),
    [vehicles]
  );

  const inUseVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "in_use"),
    [vehicles]
  );

  async function loadVehicles() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load vehicles error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setVehicleLoadFailed(true);
      setVehicles([]);
      setMessage(`Failed to load vehicles: ${error.message}`);
      return;
    }

    setVehicleLoadFailed(false);
    setVehicles((data as Vehicle[]) || []);
  }

  function handleVehicleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEmployeeChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({ ...prev, [name]: value as never }));
  }

  function resetVehicleForm() {
    setVehicleForm(emptyVehicleForm);
    setVehicleEditingId(null);
    setExistingImageUrl("");
    setExistingImagePath("");
    setImageFile(null);
    setRemoveCurrentImage(false);
  }

  function validateVehicleForm() {
    if (
      !vehicleForm.title.trim() ||
      !vehicleForm.brand.trim() ||
      !vehicleForm.model.trim() ||
      !vehicleForm.transmission.trim() ||
      !vehicleForm.fuel_type.trim() ||
      !vehicleForm.description.trim() ||
      !vehicleForm.price ||
      !vehicleForm.year ||
      !vehicleForm.seats
    ) {
      setMessage("Please complete all required vehicle fields.");
      return false;
    }

    if (!vehicleEditingId && !imageFile) {
      setMessage("Please upload a vehicle image.");
      return false;
    }

    return true;
  }

  function validateEmployeeForm() {
    if (
      !employeeForm.name.trim() ||
      !employeeForm.phone.trim() ||
      !employeeForm.email.trim()
    ) {
      setMessage("Please complete all required employee fields.");
      return false;
    }

    return true;
  }

  function getStoragePathFromPublicUrl(url: string | null) {
    if (!url) return "";
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return "";
    return decodeURIComponent(url.slice(index + marker.length));
  }

  async function uploadImage(file: File) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `vehicles/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return {
      image_url: data.publicUrl,
      image_path: path,
    };
  }

  async function deleteStorageFile(path: string | null) {
    if (!path) return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  }

  async function handleVehicleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!validateVehicleForm()) return;

    setLoading(true);

    try {
      let image_url: string | null = existingImageUrl || null;
      let image_path: string | null = existingImagePath || null;
      const oldImagePath = existingImagePath || null;

      if (removeCurrentImage && oldImagePath) {
        await deleteStorageFile(oldImagePath);
        image_url = null;
        image_path = null;
      }

      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image_url = uploaded.image_url;
        image_path = uploaded.image_path;

        if (oldImagePath && oldImagePath !== uploaded.image_path) {
          await deleteStorageFile(oldImagePath);
        }
      }

      const payload = {
        title: vehicleForm.title.trim(),
        category: vehicleForm.category,
        price: Number(vehicleForm.price),
        image_url,
        image_path,
        brand: vehicleForm.brand.trim(),
        model: vehicleForm.model.trim(),
        year: Number(vehicleForm.year),
        transmission: vehicleForm.transmission.trim(),
        fuel_type: vehicleForm.fuel_type.trim(),
        seats: Number(vehicleForm.seats),
        description: vehicleForm.description.trim(),
        status: vehicleForm.status,
      };

      if (vehicleEditingId) {
        const { error } = await supabase
          .from("vehicles")
          .update(payload)
          .eq("id", vehicleEditingId);

        if (error) throw error;
        setMessage("Vehicle updated successfully.");
      } else {
        const { error } = await supabase.from("vehicles").insert(payload);
        if (error) throw error;
        setMessage("Vehicle added successfully.");
      }

      await loadVehicles();
      resetVehicleForm();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while saving the vehicle.");
    } finally {
      setLoading(false);
    }
  }

  function handleVehicleEdit(vehicle: Vehicle) {
    setActiveTab("vehicles");
    setMobileMenuOpen(false);
    setVehicleEditingId(vehicle.id);
    setVehicleForm({
      title: vehicle.title,
      category: vehicle.category,
      price: String(vehicle.price),
      brand: vehicle.brand,
      model: vehicle.model,
      year: String(vehicle.year),
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
      seats: String(vehicle.seats),
      description: vehicle.description,
      status: vehicle.status,
    });
    setExistingImageUrl(vehicle.image_url || "");
    setExistingImagePath(
      vehicle.image_path || getStoragePathFromPublicUrl(vehicle.image_url)
    );
    setImageFile(null);
    setRemoveCurrentImage(false);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleVehicleDelete(vehicle: Vehicle) {
    const ok = window.confirm("Delete this vehicle permanently?");
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const imagePath =
        vehicle.image_path || getStoragePathFromPublicUrl(vehicle.image_url);

      if (imagePath) {
        await deleteStorageFile(imagePath);
      }

      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicle.id);

      if (error) throw error;

      if (vehicleEditingId === vehicle.id) {
        resetVehicleForm();
      }

      await loadVehicles();
      setMessage("Vehicle deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete vehicle.");
    } finally {
      setLoading(false);
    }
  }

  function handleEmployeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!validateEmployeeForm()) return;

    const newEmployee: Employee = {
      id: generateId("emp"),
      name: employeeForm.name.trim(),
      role: employeeForm.role,
      phone: employeeForm.phone.trim(),
      email: employeeForm.email.trim(),
      status: employeeForm.status,
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setAttendance((prev) => ({ ...prev, [newEmployee.id]: "present" }));
    setEmployeeForm(emptyEmployeeForm);
    setMessage("Employee added successfully.");
  }

  function handleEmployeeDelete(employeeId: string) {
    setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId));
    setAttendance((prev) => {
      const next = { ...prev };
      delete next[employeeId];
      return next;
    });
    setMessage("Employee removed successfully.");
  }

  function handleAttendanceChange(
    employeeId: string,
    status: AttendanceStatus
  ) {
    setAttendance((prev) => ({ ...prev, [employeeId]: status }));
    setMessage("Attendance updated.");
  }

  function statusLabel(status: VehicleStatus) {
    if (status === "in_use") return "In Use";
    if (status === "purchased") return "Purchased";
    return "Available";
  }

  function statusBadgeClass(status: VehicleStatus) {
    if (status === "available") return "bg-green-100 text-green-700";
    if (status === "in_use") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  }

  function attendanceBadgeClass(status: AttendanceStatus) {
    if (status === "present") return "bg-green-100 text-green-700";
    if (status === "late") return "bg-yellow-100 text-yellow-700";
    if (status === "off") return "bg-gray-200 text-gray-700";
    return "bg-red-100 text-red-700";
  }

  const navButtonClass = (tab: AdminTab) =>
    `w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-left transition ${
      activeTab === tab
        ? "border-gray-300 bg-white text-black shadow-sm"
        : "border-transparent bg-transparent text-black hover:bg-gray-200"
    }`;

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  function handleLogout() {
    setMessage("Logged out.");
  }

  const desktopGridClass = desktopSidebarOpen
    ? "lg:grid-cols-[320px_1fr]"
    : "lg:grid-cols-[1fr]";

  return (
    <main className="min-h-screen bg-gray-100">
      <div className={`min-h-screen lg:grid ${desktopGridClass}`}>
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-4 shadow-sm lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Admin
              </p>
              <h1 className="text-lg font-bold text-gray-900">
                Adinkra Drive
              </h1>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 rounded-3xl border border-gray-200 bg-gray-100 p-4 text-black shadow-lg">
              <div className="mb-6 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-300 bg-white text-center text-xs text-gray-500">
                  Company Logo
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => selectTab("vehicles")} className={navButtonClass("vehicles")}>
                  Vehicles & Inventory
                </button>
                <button onClick={() => selectTab("gps")} className={navButtonClass("gps")}>
                  GPS Tracking
                </button>
                <button onClick={() => selectTab("employees")} className={navButtonClass("employees")}>
                  Employees
                </button>
                <button onClick={() => selectTab("attendance")} className={navButtonClass("attendance")}>
                  Attendance
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {desktopSidebarOpen && (
          <aside className="hidden min-h-screen flex-col border-r border-gray-200 bg-gray-100 text-black lg:flex">
            <div className="flex items-center justify-center border-b border-gray-200 px-6 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-300 bg-white text-center text-xs text-gray-500">
                Company Logo
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="w-full max-w-xs space-y-4">
                <button onClick={() => selectTab("vehicles")} className={navButtonClass("vehicles")}>
                  Vehicles & Inventory
                </button>
                <button onClick={() => selectTab("gps")} className={navButtonClass("gps")}>
                  GPS Tracking
                </button>
                <button onClick={() => selectTab("employees")} className={navButtonClass("employees")}>
                  Employees
                </button>
                <button onClick={() => selectTab("attendance")} className={navButtonClass("attendance")}>
                  Attendance
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
              >
                Logout
              </button>
            </div>
          </aside>
        )}

        <section className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 hidden lg:flex">
              <button
                type="button"
                onClick={() => setDesktopSidebarOpen((prev) => !prev)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-300 bg-white text-black shadow-sm"
                aria-label={
                  desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"
                }
                title={desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <span className="text-2xl leading-none">◧</span>
              </button>
            </div>

            <div className="mb-8 rounded-3xl bg-white px-6 py-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                {activeTab === "vehicles" && "Vehicle Management"}
                {activeTab === "gps" && "GPS Tracking"}
                {activeTab === "employees" && "Employee Management"}
                {activeTab === "attendance" && "Staff Attendance"}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {activeTab === "vehicles" &&
                  "Add, edit, update, and manage your full vehicle inventory."}
                {activeTab === "gps" &&
                  "Monitor rented vehicles and prepare for live tracking integration."}
                {activeTab === "employees" &&
                  "Add and manage employee records and roles."}
                {activeTab === "attendance" &&
                  "Mark and review staff attendance quickly."}
              </p>
            </div>

            {message && (
              <div className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
                {message}
              </div>
            )}

            {activeTab === "vehicles" && (
              <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {vehicleEditingId ? "Edit Vehicle" : "Add Vehicle"}
                    </h2>

                    {vehicleEditingId && (
                      <button
                        type="button"
                        onClick={resetVehicleForm}
                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleVehicleSubmit} className="space-y-4">
                    <input
                      name="title"
                      value={vehicleForm.title}
                      onChange={handleVehicleChange}
                      placeholder="Vehicle Title"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        name="category"
                        value={vehicleForm.category}
                        onChange={handleVehicleChange}
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      >
                        <option value="rent">Rent</option>
                        <option value="sale">Sale</option>
                      </select>

                      <select
                        name="status"
                        value={vehicleForm.status}
                        onChange={handleVehicleChange}
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      >
                        <option value="available">Available</option>
                        <option value="in_use">In Use</option>
                        <option value="purchased">Purchased</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="brand"
                        value={vehicleForm.brand}
                        onChange={handleVehicleChange}
                        placeholder="Brand"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                      <input
                        name="model"
                        value={vehicleForm.model}
                        onChange={handleVehicleChange}
                        placeholder="Model"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <input
                        name="year"
                        type="number"
                        value={vehicleForm.year}
                        onChange={handleVehicleChange}
                        placeholder="Year"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                      <input
                        name="price"
                        type="number"
                        value={vehicleForm.price}
                        onChange={handleVehicleChange}
                        placeholder="Price"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                      <input
                        name="seats"
                        type="number"
                        value={vehicleForm.seats}
                        onChange={handleVehicleChange}
                        placeholder="Seats"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="transmission"
                        value={vehicleForm.transmission}
                        onChange={handleVehicleChange}
                        placeholder="Transmission"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                      <input
                        name="fuel_type"
                        value={vehicleForm.fuel_type}
                        onChange={handleVehicleChange}
                        placeholder="Fuel Type"
                        className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <textarea
                      name="description"
                      value={vehicleForm.description}
                      onChange={handleVehicleChange}
                      placeholder="Vehicle Description"
                      rows={4}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />

                    {existingImageUrl && !removeCurrentImage && (
                      <div className="rounded-2xl border border-gray-200 p-3">
                        <p className="mb-2 text-sm font-medium text-gray-700">
                          Current Image
                        </p>
                        <img
                          src={existingImageUrl}
                          alt="Current vehicle"
                          className="h-40 w-full rounded-2xl object-cover"
                        />
                        <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={removeCurrentImage}
                            onChange={(e) =>
                              setRemoveCurrentImage(e.target.checked)
                            }
                          />
                          Remove current image
                        </label>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {vehicleEditingId
                          ? "Upload New Image (optional)"
                          : "Upload Image"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setImageFile(e.target.files?.[0] || null)
                        }
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading
                        ? "Saving..."
                        : vehicleEditingId
                        ? "Update Vehicle"
                        : "Add Vehicle"}
                    </button>
                  </form>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold">Vehicle Inventory</h2>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setVehicleFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm ${
                          vehicleFilter === "all"
                            ? "bg-black text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setVehicleFilter("rent")}
                        className={`rounded-full px-4 py-2 text-sm ${
                          vehicleFilter === "rent"
                            ? "bg-black text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        Rent
                      </button>
                      <button
                        onClick={() => setVehicleFilter("sale")}
                        className={`rounded-full px-4 py-2 text-sm ${
                          vehicleFilter === "sale"
                            ? "bg-black text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        Sale
                      </button>
                    </div>
                  </div>

                  {vehicleLoadFailed ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                      Could not load vehicles from Supabase. Check your table,
                      policies, and environment keys.
                    </div>
                  ) : filteredVehicles.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                      No vehicles found.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredVehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50"
                        >
                          <img
                            src={vehicle.image_url || "/placeholder-car.jpg"}
                            alt={vehicle.title}
                            className="h-56 w-full object-cover"
                          />

                          <div className="p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-xl font-bold">
                                  {vehicle.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {vehicle.brand} • {vehicle.model} •{" "}
                                  {vehicle.year}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                                  vehicle.status
                                )}`}
                              >
                                {statusLabel(vehicle.status)}
                              </span>
                            </div>

                            <p className="mb-4 text-sm text-gray-600">
                              {vehicle.description}
                            </p>

                            <div className="mb-5 grid grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="rounded-2xl bg-white p-3">
                                <span className="block text-xs text-gray-400">
                                  Category
                                </span>
                                <span className="font-medium capitalize">
                                  {vehicle.category}
                                </span>
                              </div>
                              <div className="rounded-2xl bg-white p-3">
                                <span className="block text-xs text-gray-400">
                                  Price
                                </span>
                                <span className="font-medium">
                                  {vehicle.category === "rent"
                                    ? `$${vehicle.price}/day`
                                    : `$${Number(vehicle.price).toLocaleString()}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleVehicleEdit(vehicle)}
                                className="flex-1 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  void handleVehicleDelete(vehicle)
                                }
                                className="flex-1 rounded-2xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "gps" && (
              <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold">GPS Overview</h2>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Rental Vehicles</p>
                      <p className="mt-1 text-3xl font-bold">
                        {rentedVehicles.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Currently In Use</p>
                      <p className="mt-1 text-3xl font-bold">
                        {inUseVehicles.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Tracking Active</p>
                      <p className="mt-1 text-3xl font-bold">
                        {inUseVehicles.length}
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-sm text-gray-500">
                    This section is ready for live GPS integration. Connect each
                    rented vehicle to a GPS device or API later.
                  </p>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold">
                    Tracked Rental Vehicles
                  </h2>

                  {inUseVehicles.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                      No rented cars are currently in use.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {inUseVehicles.map((vehicle, index) => (
                        <div
                          key={vehicle.id}
                          className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold">
                                {vehicle.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {vehicle.brand} • {vehicle.model} •{" "}
                                {vehicle.year}
                              </p>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Tracking Active
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-3">
                              <span className="block text-xs text-gray-400">
                                Driver Status
                              </span>
                              <span className="font-medium">On Route</span>
                            </div>
                            <div className="rounded-2xl bg-white p-3">
                              <span className="block text-xs text-gray-400">
                                Last Update
                              </span>
                              <span className="font-medium">
                                {10 + index} mins ago
                              </span>
                            </div>
                            <div className="rounded-2xl bg-white p-3">
                              <span className="block text-xs text-gray-400">
                                Latitude
                              </span>
                              <span className="font-medium">5.6037</span>
                            </div>
                            <div className="rounded-2xl bg-white p-3">
                              <span className="block text-xs text-gray-400">
                                Longitude
                              </span>
                              <span className="font-medium">-0.1870</span>
                            </div>
                          </div>

                          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                            Map preview placeholder for {vehicle.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "employees" && (
              <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold">Add Employee</h2>

                  <form onSubmit={handleEmployeeSubmit} className="mt-6 space-y-4">
                    <input
                      name="name"
                      value={employeeForm.name}
                      onChange={handleEmployeeChange}
                      placeholder="Full Name"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />

                    <select
                      name="role"
                      value={employeeForm.role}
                      onChange={handleEmployeeChange}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    >
                      <option>Driver</option>
                      <option>Operations Manager</option>
                      <option>Sales Manager</option>
                      <option>Fleet Supervisor</option>
                      <option>Customer Relations</option>
                      <option>Admin Staff</option>
                    </select>

                    <input
                      name="phone"
                      value={employeeForm.phone}
                      onChange={handleEmployeeChange}
                      placeholder="Phone Number"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />

                    <input
                      name="email"
                      value={employeeForm.email}
                      onChange={handleEmployeeChange}
                      placeholder="Email Address"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />

                    <select
                      name="status"
                      value={employeeForm.status}
                      onChange={handleEmployeeChange}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    >
                      <option value="active">Active</option>
                      <option value="off">Off Duty</option>
                    </select>

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90"
                    >
                      Add Employee
                    </button>
                  </form>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold">Employee List</h2>

                  {employees.length === 0 ? (
                    <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                      No employees added yet.
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {employees.map((employee) => (
                        <div
                          key={employee.id}
                          className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold">{employee.name}</h3>
                              <p className="text-sm text-gray-500">{employee.role}</p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                employee.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {employee.status === "active" ? "Active" : "Off Duty"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <p>{employee.phone}</p>
                            <p>{employee.email}</p>
                          </div>

                          <div className="mt-4">
                            <button
                              onClick={() => handleEmployeeDelete(employee.id)}
                              className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600"
                            >
                              Remove Employee
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold">Attendance Summary</h2>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Present</p>
                      <p className="mt-1 text-3xl font-bold">
                        {Object.values(attendance).filter((s) => s === "present").length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Late</p>
                      <p className="mt-1 text-3xl font-bold">
                        {Object.values(attendance).filter((s) => s === "late").length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Absent</p>
                      <p className="mt-1 text-3xl font-bold">
                        {Object.values(attendance).filter((s) => s === "absent").length}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold">Mark Attendance</h2>

                  {employees.length === 0 ? (
                    <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                      No employees available for attendance.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {employees.map((employee) => {
                        const employeeAttendance =
                          attendance[employee.id] || "present";

                        return (
                          <div
                            key={employee.id}
                            className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <h3 className="text-lg font-bold">{employee.name}</h3>
                              <p className="text-sm text-gray-500">{employee.role}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${attendanceBadgeClass(
                                  employeeAttendance
                                )}`}
                              >
                                {employeeAttendance.charAt(0).toUpperCase() +
                                  employeeAttendance.slice(1)}
                              </span>

                              <select
                                value={employeeAttendance}
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    employee.id,
                                    e.target.value as AttendanceStatus
                                  )
                                }
                                className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
                              >
                                <option value="present">Present</option>
                                <option value="late">Late</option>
                                <option value="absent">Absent</option>
                                <option value="off">Off</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}