"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar, { type AdminTab } from "@/components/AdminNavbar";

type VehicleStatus = "available" | "in_use" | "purchased";
type VehicleCategory = "rent" | "sale";
type EmployeeRole =
  | "Driver"
  | "Operations Manager"
  | "Sales Manager"
  | "Fleet Supervisor"
  | "Customer Relations"
  | "Admin Staff";
type AttendanceStatus = "present" | "absent" | "late" | "off";
type ThemeOption = "light" | "dark";
type LanguageOption = "English" | "French" | "Spanish";

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
  created_at?: string;
};

type EmployeeFormState = {
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: "active" | "off";
};

type AttendanceRecord = {
  id: string;
  employee_id: string;
  status: AttendanceStatus;
  attendance_date: string;
  created_at?: string;
};

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  consent: boolean;
  is_active: boolean;
  created_at: string;
};

type AppSetting = {
  id: string;
  theme: ThemeOption;
  language: LanguageOption;
  updated_at?: string;
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

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function generateMapEmbedUrl(lat?: number, lng?: number) {
  const finalLat = lat ?? 5.6037;
  const finalLng = lng ?? -0.187;
  return `https://maps.google.com/maps?q=${finalLat},${finalLng}&z=13&output=embed`;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("vehicles");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    []
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<AppSetting>({
    id: "default",
    theme: "light",
    language: "English",
  });

  const [vehicleLoadFailed, setVehicleLoadFailed] = useState(false);
  const [employeesLoadFailed, setEmployeesLoadFailed] = useState(false);
  const [attendanceLoadFailed, setAttendanceLoadFailed] = useState(false);
  const [membersLoadFailed, setMembersLoadFailed] = useState(false);
  const [settingsLoadFailed, setSettingsLoadFailed] = useState(false);

  const [vehicleForm, setVehicleForm] =
    useState<VehicleFormState>(emptyVehicleForm);
  const [employeeForm, setEmployeeForm] =
    useState<EmployeeFormState>(emptyEmployeeForm);

  const [vehicleEditingId, setVehicleEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingImagePath, setExistingImagePath] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [vehicleFilter, setVehicleFilter] =
    useState<"all" | VehicleCategory>("all");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadAllData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadAllData() {
    await Promise.all([
      loadVehicles(),
      loadEmployees(),
      loadAttendance(),
      loadMembers(),
      loadSettings(),
    ]);
  }

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

  const joinedTodayMembers = useMemo(() => {
    const today = todayDateString();
    return members.filter((member) => member.created_at?.slice(0, 10) === today);
  }, [members]);

  const membersThisWeek = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return members.filter((member) => {
      const createdAt = new Date(member.created_at);
      return createdAt >= sevenDaysAgo && createdAt <= now;
    });
  }, [members]);

  const todayMemberCount = joinedTodayMembers.length;
  const weeklyMemberCount = membersThisWeek.length;

  const attendanceByEmployee = useMemo(() => {
    const latest: Record<string, AttendanceRecord> = {};

    for (const record of attendanceRecords) {
      if (!latest[record.employee_id]) {
        latest[record.employee_id] = record;
      }
    }

    return latest;
  }, [attendanceRecords]);

  const attendanceSummary = useMemo(() => {
    const values = Object.values(attendanceByEmployee).map((item) => item.status);

    return {
      present: values.filter((v) => v === "present").length,
      late: values.filter((v) => v === "late").length,
      absent: values.filter((v) => v === "absent").length,
      off: values.filter((v) => v === "off").length,
    };
  }, [attendanceByEmployee]);

  async function loadVehicles() {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVehicles((data as Vehicle[]) || []);
      setVehicleLoadFailed(false);
    } catch (error) {
      console.error("Load vehicles error:", error);
      setVehicleLoadFailed(true);
      setVehicles([]);
    }
  }

  async function loadEmployees() {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEmployees((data as Employee[]) || []);
      setEmployeesLoadFailed(false);
    } catch (error) {
      console.error("Load employees error:", error);
      setEmployeesLoadFailed(true);
      setEmployees([]);
    }
  }

  async function loadAttendance() {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("attendance_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAttendanceRecords((data as AttendanceRecord[]) || []);
      setAttendanceLoadFailed(false);
    } catch (error) {
      console.error("Load attendance error:", error);
      setAttendanceLoadFailed(true);
      setAttendanceRecords([]);
    }
  }

  async function loadMembers() {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMembers((data as Member[]) || []);
      setMembersLoadFailed(false);
    } catch (error) {
      console.error("Load members error:", error);
      setMembersLoadFailed(true);
      setMembers([]);
    }
  }

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as AppSetting);
      }

      setSettingsLoadFailed(false);
    } catch (error) {
      console.error("Load settings error:", error);
      setSettingsLoadFailed(true);
    }
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
    setEmployeeForm((prev) => ({
      ...prev,
      [name]: value as EmployeeFormState[keyof EmployeeFormState],
    }));
  }

  function handleSettingChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        name === "theme"
          ? (value as ThemeOption)
          : (value as LanguageOption),
    }));
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

  if (error) {
    console.error("Vehicles update error:", error);
    throw error;
  }

  setMessage("Vehicle updated successfully.");
} else {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Vehicles insert error:", error);
    throw error;
  }

  try {
    await fetch("/api/notify-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle: {
          title: data.title,
          brand: data.brand,
          model: data.model,
          year: data.year,
          category: data.category,
          price: data.price,
          description: data.description,
          image_url: data.image_url,
        },
      }),
    });
  } catch (notifyError) {
    console.error("Notification error:", notifyError);
  }

  setMessage("Vehicle added successfully and members notified.");
}

      await loadVehicles();
      resetVehicleForm();
    } catch (error: any) {
  console.error("Vehicle submit full error:", error);
  console.error("Message:", error?.message);
  console.error("Details:", error?.details);
  console.error("Hint:", error?.hint);
  console.error("Code:", error?.code);

  setMessage(error?.message || "Something went wrong while saving the vehicle.");
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
      console.error("Vehicle delete error:", error);
      setMessage("Failed to delete vehicle.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmployeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!validateEmployeeForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: employeeForm.name.trim(),
        role: employeeForm.role,
        phone: employeeForm.phone.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        status: employeeForm.status,
      };

      const { error } = await supabase.from("employees").insert(payload);
      if (error) throw error;

      setEmployeeForm(emptyEmployeeForm);
      await loadEmployees();
      setMessage("Employee added successfully.");
    } catch (error) {
      console.error("Employee submit error:", error);
      setMessage("Failed to add employee.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmployeeDelete(employeeId: string) {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId);

      if (error) throw error;

      await loadEmployees();
      await loadAttendance();
      setMessage("Employee removed successfully.");
    } catch (error) {
      console.error("Employee delete error:", error);
      setMessage("Failed to remove employee.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAttendanceChange(
    employeeId: string,
    status: AttendanceStatus
  ) {
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        employee_id: employeeId,
        status,
        attendance_date: todayDateString(),
      };

      const { error } = await supabase.from("attendance").insert(payload);
      if (error) throw error;

      await loadAttendance();
      setMessage("Attendance updated.");
    } catch (error) {
      console.error("Attendance update error:", error);
      setMessage("Failed to update attendance.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSettingsSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        id: settings.id || "default",
        theme: settings.theme,
        language: settings.language,
      };

      const { error } = await supabase.from("settings").upsert(payload);
      if (error) throw error;

      await loadSettings();
      setMessage("Settings updated successfully.");
    } catch (error) {
      console.error("Settings save error:", error);
      setMessage("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setMessage("Logged out.");
  }

  const titleMap: Record<AdminTab, string> = {
    vehicles: "Vehicle Management",
    gps: "GPS Map",
    employees: "Employee Management",
    attendance: "Staff Attendance",
    members: "Registered Members",
    settings: "Settings",
  };

  const descriptionMap: Record<AdminTab, string> = {
    vehicles: "Add, edit, update, and manage your full vehicle inventory.",
    gps: "Track your active rental operations with a map view.",
    employees: "Add employees and manage staff records from the database.",
    attendance: "View and update attendance records stored in the database.",
    members: "View members who joined today and all registered members.",
    settings: "Manage theme and language only.",
  };

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

  function renderHeader() {
    return (
      <div className="mb-8 rounded-3xl bg-white px-6 py-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
              {titleMap[activeTab]}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {descriptionMap[activeTab]}
            </p>
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 shadow-sm hover:bg-gray-100"
            >
              <Bell size={20} />
              {weeklyMemberCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[22px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                  {weeklyMemberCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 z-30 mt-3 w-[360px] rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Member Notifications
                  </h3>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Joined Today</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {todayMemberCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Joined This Week</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {weeklyMemberCount}
                    </p>
                  </div>
                </div>

                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {membersThisWeek.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                      No new member registrations this week.
                    </div>
                  ) : (
                    membersThisWeek.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
                      >
                        <p className="font-semibold text-gray-900">
                          {member.full_name}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">
                          {member.phone || "No phone number"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(member.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderVehiclesTab() {
    return (
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
                    onChange={(e) => setRemoveCurrentImage(e.target.checked)}
                  />
                  Remove current image
                </label>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {vehicleEditingId ? "Upload New Image (optional)" : "Upload Image"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : vehicleEditingId ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Vehicle Inventory</h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVehicleFilter("all")}
                className={`rounded-full px-4 py-2 text-sm ${
                  vehicleFilter === "all" ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setVehicleFilter("rent")}
                className={`rounded-full px-4 py-2 text-sm ${
                  vehicleFilter === "rent" ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={() => setVehicleFilter("sale")}
                className={`rounded-full px-4 py-2 text-sm ${
                  vehicleFilter === "sale" ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                Sale
              </button>
            </div>
          </div>

          {vehicleLoadFailed ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              Could not load vehicles from Supabase.
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
                        <h3 className="text-xl font-bold">{vehicle.title}</h3>
                        <p className="text-sm text-gray-500">
                          {vehicle.brand} • {vehicle.model} • {vehicle.year}
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

                    <p className="mb-4 text-sm text-gray-600">{vehicle.description}</p>

                    <div className="mb-5 grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="rounded-2xl bg-white p-3">
                        <span className="block text-xs text-gray-400">Category</span>
                        <span className="font-medium capitalize">{vehicle.category}</span>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <span className="block text-xs text-gray-400">Price</span>
                        <span className="font-medium">
                          {vehicle.category === "rent"
                            ? `$${vehicle.price}/day`
                            : `$${Number(vehicle.price).toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleVehicleEdit(vehicle)}
                        className="flex-1 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleVehicleDelete(vehicle)}
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
    );
  }

  function renderGpsTab() {
    return (
      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">GPS Overview</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Rental Vehicles</p>
              <p className="mt-1 text-3xl font-bold">{rentedVehicles.length}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Currently In Use</p>
              <p className="mt-1 text-3xl font-bold">{inUseVehicles.length}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Map</h2>
          <div className="overflow-hidden rounded-3xl border border-gray-200">
            <iframe
              title="GPS Map"
              src={generateMapEmbedUrl()}
              className="h-[520px] w-full"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    );
  }

  function renderEmployeesTab() {
    return (
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
              <option value="Driver">Driver</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="Fleet Supervisor">Fleet Supervisor</option>
              <option value="Customer Relations">Customer Relations</option>
              <option value="Admin Staff">Admin Staff</option>
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
              disabled={loading}
              className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              Add Employee
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Employee List</h2>

          {employeesLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Failed to load employees.
            </div>
          ) : employees.length === 0 ? (
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
                      type="button"
                      onClick={() => void handleEmployeeDelete(employee.id)}
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
    );
  }

  function renderAttendanceTab() {
    return (
      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Attendance Summary</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Present</p>
              <p className="mt-1 text-3xl font-bold">{attendanceSummary.present}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Late</p>
              <p className="mt-1 text-3xl font-bold">{attendanceSummary.late}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Absent</p>
              <p className="mt-1 text-3xl font-bold">{attendanceSummary.absent}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Off</p>
              <p className="mt-1 text-3xl font-bold">{attendanceSummary.off}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Mark Attendance</h2>

          {attendanceLoadFailed || employeesLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Failed to load attendance data.
            </div>
          ) : employees.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              No employees available for attendance.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {employees.map((employee) => {
                const employeeAttendance =
                  attendanceByEmployee[employee.id]?.status || "present";

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
                          void handleAttendanceChange(
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
    );
  }

  function renderMembersTab() {
    return (
      <div className="space-y-6">
        
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">All Members</h2>

          {membersLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Failed to load members from Supabase.
            </div>
          ) : members.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              No registered members found.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Consent</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 bg-white">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {member.full_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{member.email}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {member.phone || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            member.consent
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {member.consent ? "Granted" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            member.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  function renderSettingsTab() {
    return (
      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Dashboard Settings</h2>

          <form onSubmit={handleSettingsSave} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleSettingChange}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleSettingChange}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              Save Settings
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Current Settings</h2>

          {settingsLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Failed to load settings.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Theme</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {settings.theme}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Language</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {settings.language}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "vehicles":
        return renderVehiclesTab();
      case "gps":
        return renderGpsTab();
      case "employees":
        return renderEmployeesTab();
      case "attendance":
        return renderAttendanceTab();
      case "members":
        return renderMembersTab();
      case "settings":
        return renderSettingsTab();
      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="min-h-screen">
        <AdminNavbar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          desktopSidebarOpen={desktopSidebarOpen}
          onDesktopSidebarToggle={() => setDesktopSidebarOpen((prev) => !prev)}
          onLogout={handleLogout}
        />

                <section
          className={`min-h-screen px-4 py-8 md:px-8 ${
            desktopSidebarOpen ? "lg:ml-[340px]" : "lg:ml-[110px]"
          }`}
        >
          <div className="mx-auto max-w-7xl">
            {renderHeader()}

            {message && (
              <div className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
                {message}
              </div>
            )}

            {renderActiveTab()}
          </div>
        </section>
      </div>
    </main>
  );
}