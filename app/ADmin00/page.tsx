"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, X, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import AdminAIAssistant from "@/components/AdminAIAssistant";
import AdminNavbar, { type AdminTab } from "@/components/AdminNavbar";


type VehicleStatus = "available" | "in_use" | "purchased";
type VehicleCategory = "rent" | "sale";
type EmployeeRole =
  | "Chauffeur"
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
  full_name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: "active" | "off";
  image_url: string | null;
  image_path?: string | null;
  is_chauffeur: boolean;
  is_available: boolean;
  created_at?: string;
};


type EmployeeFormState = {
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: "active" | "off";
  is_chauffeur: boolean;
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

type PurchaseHistoryItem = {
  id: string;
  booking_type: "rent" | "buy";
  full_name: string;
  email: string;
  phone: string;
  start_date: string | null;
  end_date: string | null;
  pickup_location: string | null;
  total_amount: number;
  status: string;
  created_at?: string;
  vehicle_id?: string;
  chauffeur_required?: boolean | null;
  chauffeur_name?: string | null;
  chauffeur_phone?: string | null;
  pickup_time?: string | null;
  payment_method?: "cash" | "card" | "momo" | null;
  payment_status?: "pending" | "paid" | "failed" | null;
  vehicles?:
    | {
        title: string;
        brand: string;
        model: string;
        year: number;
        image_url: string | null;
      }
    | {
        title: string;
        brand: string;
        model: string;
        year: number;
        image_url: string | null;
      }[]
    | null;
};


const BUCKET = "vehicle-images";
const EMPLOYEE_BUCKET = "employee-images";
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
  is_chauffeur: false,
};


const translations = {
  English: {
    vehicles: "Vehicles & Inventory",
    gps: "GPS Tracking",
    employees: "Employees",
    attendance: "Attendance",
    members: "Members",
    purchase_history: "Purchase History",
    settings: "Settings",
    logout: "Logout",

    dashboard: "Admin Dashboard",
    manage: "Manage your dashboard, inventory, staff, attendance, and settings.",

    theme: "Theme",
    language: "Language",
    save: "Save Settings",
    currentSettings: "Current Settings",

    addVehicle: "Add Vehicle",
    editVehicle: "Edit Vehicle",
    cancel: "Cancel",
    vehicleTitle: "Vehicle Title",
    rent: "Rent",
    sale: "Sale",
    available: "Available",
    inUse: "In Use",
    purchased: "Purchased",
    brand: "Brand",
    model: "Model",
    year: "Year",
    price: "Price",
    seats: "Seats",
    transmission: "Transmission",
    fuelType: "Fuel Type",
    vehicleDescription: "Vehicle Description",
    currentImage: "Current Image",
    removeCurrentImage: "Remove current image",
    uploadImage: "Upload Image",
    uploadNewImage: "Upload New Image (optional)",
    saving: "Saving...",
    updateVehicle: "Update Vehicle",
    vehicleInventory: "Vehicle Inventory",
    all: "All",
    edit: "Edit",
    delete: "Delete",
    category: "Category",

    gpsOverview: "GPS Overview",
    rentalVehicles: "Rental Vehicles",
    currentlyInUse: "Currently In Use",
    map: "Map",

    addEmployee: "Add Employee",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    active: "Active",
    offDuty: "Off Duty",
    employeeList: "Employee List",
    removeEmployee: "Remove Employee",

    attendanceSummary: "Attendance Summary",
    present: "Present",
    late: "Late",
    absent: "Absent",
    off: "Off",
    markAttendance: "Mark Attendance",

    allMembers: "All Members",
    name: "Name",
    email: "Email",
    phone: "Phone",
    consent: "Consent",
    status: "Status",
    registered: "Registered",
    granted: "Granted",
    no: "No",
    inactive: "Inactive",

    memberNotifications: "Member Notifications",
    joinedToday: "Joined Today",
    joinedThisWeek: "Joined This Week",
    noNewMembers: "No new member registrations this week.",
    noPhoneNumber: "No phone number",

    failedLoadVehicles: "Could not load vehicles from Supabase.",
    failedLoadEmployees: "Failed to load employees.",
    failedLoadAttendance: "Failed to load attendance data.",
    failedLoadMembers: "Failed to load members from Supabase.",
    failedLoadSettings: "Failed to load settings.",
    noVehicles: "No vehicles found.",
    noEmployees: "No employees added yet.",
    noEmployeesAttendance: "No employees available for attendance.",
    noMembers: "No registered members found.",

    completeVehicleFields: "Please complete all required vehicle fields.",
    uploadVehicleImage: "Please upload a vehicle image.",
    completeEmployeeFields: "Please complete all required employee fields.",
    vehicleUpdated: "Vehicle updated successfully.",
    vehicleAdded: "Vehicle added successfully and members notified.",
    vehicleSaveError: "Something went wrong while saving the vehicle.",
    employeeAdded: "Employee added successfully.",
    employeeAddFailed: "Failed to add employee.",
    employeeRemoved: "Employee removed successfully.",
    employeeRemoveFailed: "Failed to remove employee.",
    attendanceUpdated: "Attendance updated.",
    attendanceFailed: "Failed to update attendance.",
    settingsUpdated: "Settings updated successfully.",
    settingsFailed: "Failed to update settings.",
    vehicleDeleted: "Vehicle deleted successfully.",
    vehicleDeleteFailed: "Failed to delete vehicle.",
    deleteVehicleConfirm: "Delete this vehicle permanently?",
  },

  French: {
    vehicles: "Véhicules",
    gps: "Suivi GPS",
    employees: "Employés",
    attendance: "Présence",
    members: "Membres",
    purchase_history: "Historique des achats",
    settings: "Paramètres",
    logout: "Se déconnecter",

    dashboard: "Tableau de bord",
    manage: "Gérez votre tableau de bord, inventaire, personnel, présence et paramètres.",

    theme: "Thème",
    language: "Langue",
    save: "Enregistrer",
    currentSettings: "Paramètres actuels",

    addVehicle: "Ajouter un véhicule",
    editVehicle: "Modifier le véhicule",
    cancel: "Annuler",
    vehicleTitle: "Titre du véhicule",
    rent: "Location",
    sale: "Vente",
    available: "Disponible",
    inUse: "En cours d'utilisation",
    purchased: "Acheté",
    brand: "Marque",
    model: "Modèle",
    year: "Année",
    price: "Prix",
    seats: "Places",
    transmission: "Transmission",
    fuelType: "Type de carburant",
    vehicleDescription: "Description du véhicule",
    currentImage: "Image actuelle",
    removeCurrentImage: "Supprimer l'image actuelle",
    uploadImage: "Téléverser une image",
    uploadNewImage: "Téléverser une nouvelle image (optionnel)",
    saving: "Enregistrement...",
    updateVehicle: "Mettre à jour le véhicule",
    vehicleInventory: "Inventaire des véhicules",
    all: "Tous",
    edit: "Modifier",
    delete: "Supprimer",
    category: "Catégorie",

    gpsOverview: "Vue GPS",
    rentalVehicles: "Véhicules en location",
    currentlyInUse: "Actuellement utilisés",
    map: "Carte",

    addEmployee: "Ajouter un employé",
    fullName: "Nom complet",
    phoneNumber: "Numéro de téléphone",
    emailAddress: "Adresse e-mail",
    active: "Actif",
    offDuty: "Hors service",
    employeeList: "Liste des employés",
    removeEmployee: "Supprimer l'employé",

    attendanceSummary: "Résumé de présence",
    present: "Présent",
    late: "En retard",
    absent: "Absent",
    off: "Repos",
    markAttendance: "Marquer la présence",

    allMembers: "Tous les membres",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    consent: "Consentement",
    status: "Statut",
    registered: "Inscrit",
    granted: "Accordé",
    no: "Non",
    inactive: "Inactif",

    memberNotifications: "Notifications des membres",
    joinedToday: "Inscrits aujourd'hui",
    joinedThisWeek: "Inscrits cette semaine",
    noNewMembers: "Aucune nouvelle inscription cette semaine.",
    noPhoneNumber: "Aucun numéro de téléphone",

    failedLoadVehicles: "Impossible de charger les véhicules depuis Supabase.",
    failedLoadEmployees: "Échec du chargement des employés.",
    failedLoadAttendance: "Échec du chargement des présences.",
    failedLoadMembers: "Échec du chargement des membres depuis Supabase.",
    failedLoadSettings: "Échec du chargement des paramètres.",
    noVehicles: "Aucun véhicule trouvé.",
    noEmployees: "Aucun employé ajouté pour le moment.",
    noEmployeesAttendance: "Aucun employé disponible pour la présence.",
    noMembers: "Aucun membre enregistré trouvé.",

    completeVehicleFields: "Veuillez remplir tous les champs obligatoires du véhicule.",
    uploadVehicleImage: "Veuillez téléverser une image du véhicule.",
    completeEmployeeFields: "Veuillez remplir tous les champs obligatoires de l'employé.",
    vehicleUpdated: "Véhicule mis à jour avec succès.",
    vehicleAdded: "Véhicule ajouté avec succès et membres notifiés.",
    vehicleSaveError: "Une erreur est survenue lors de l'enregistrement du véhicule.",
    employeeAdded: "Employé ajouté avec succès.",
    employeeAddFailed: "Impossible d'ajouter l'employé.",
    employeeRemoved: "Employé supprimé avec succès.",
    employeeRemoveFailed: "Impossible de supprimer l'employé.",
    attendanceUpdated: "Présence mise à jour.",
    attendanceFailed: "Impossible de mettre à jour la présence.",
    settingsUpdated: "Paramètres mis à jour avec succès.",
    settingsFailed: "Impossible de mettre à jour les paramètres.",
    vehicleDeleted: "Véhicule supprimé avec succès.",
    vehicleDeleteFailed: "Impossible de supprimer le véhicule.",
    deleteVehicleConfirm: "Supprimer ce véhicule définitivement ?",
  },

  Spanish: {
    vehicles: "Vehículos",
    gps: "GPS",
    employees: "Empleados",
    attendance: "Asistencia",
    members: "Miembros",
    purchase_history: "Historial de compras",
    settings: "Configuración",
    logout: "Cerrar sesión",

    dashboard: "Panel de administración",
    manage: "Administra tu panel, inventario, personal, asistencia y configuración.",

    theme: "Tema",
    language: "Idioma",
    save: "Guardar",
    currentSettings: "Configuración actual",

    addVehicle: "Agregar vehículo",
    editVehicle: "Editar vehículo",
    cancel: "Cancelar",
    vehicleTitle: "Título del vehículo",
    rent: "Alquiler",
    sale: "Venta",
    available: "Disponible",
    inUse: "En uso",
    purchased: "Comprado",
    brand: "Marca",
    model: "Modelo",
    year: "Año",
    price: "Precio",
    seats: "Asientos",
    transmission: "Transmisión",
    fuelType: "Tipo de combustible",
    vehicleDescription: "Descripción del vehículo",
    currentImage: "Imagen actual",
    removeCurrentImage: "Eliminar imagen actual",
    uploadImage: "Subir imagen",
    uploadNewImage: "Subir nueva imagen (opcional)",
    saving: "Guardando...",
    updateVehicle: "Actualizar vehículo",
    vehicleInventory: "Inventario de vehículos",
    all: "Todos",
    edit: "Editar",
    delete: "Eliminar",
    category: "Categoría",

    gpsOverview: "Resumen GPS",
    rentalVehicles: "Vehículos en alquiler",
    currentlyInUse: "Actualmente en uso",
    map: "Mapa",

    addEmployee: "Agregar empleado",
    fullName: "Nombre completo",
    phoneNumber: "Número de teléfono",
    emailAddress: "Correo electrónico",
    active: "Activo",
    offDuty: "Fuera de servicio",
    employeeList: "Lista de empleados",
    removeEmployee: "Eliminar empleado",

    attendanceSummary: "Resumen de asistencia",
    present: "Presente",
    late: "Tarde",
    absent: "Ausente",
    off: "Libre",
    markAttendance: "Marcar asistencia",

    allMembers: "Todos los miembros",
    name: "Nombre",
    email: "Correo",
    phone: "Teléfono",
    consent: "Consentimiento",
    status: "Estado",
    registered: "Registrado",
    granted: "Concedido",
    no: "No",
    inactive: "Inactivo",

    memberNotifications: "Notificaciones de miembros",
    joinedToday: "Se unieron hoy",
    joinedThisWeek: "Se unieron esta semana",
    noNewMembers: "No hay nuevos registros esta semana.",
    noPhoneNumber: "Sin número de teléfono",

    failedLoadVehicles: "No se pudieron cargar los vehículos desde Supabase.",
    failedLoadEmployees: "No se pudieron cargar los empleados.",
    failedLoadAttendance: "No se pudieron cargar los datos de asistencia.",
    failedLoadMembers: "No se pudieron cargar los miembros desde Supabase.",
    failedLoadSettings: "No se pudieron cargar las configuraciones.",
    noVehicles: "No se encontraron vehículos.",
    noEmployees: "Aún no se han agregado empleados.",
    noEmployeesAttendance: "No hay empleados disponibles para asistencia.",
    noMembers: "No se encontraron miembros registrados.",

    completeVehicleFields: "Por favor completa todos los campos requeridos del vehículo.",
    uploadVehicleImage: "Por favor sube una imagen del vehículo.",
    completeEmployeeFields: "Por favor completa todos los campos requeridos del empleado.",
    vehicleUpdated: "Vehículo actualizado correctamente.",
    vehicleAdded: "Vehículo agregado correctamente y miembros notificados.",
    vehicleSaveError: "Ocurrió un error al guardar el vehículo.",
    employeeAdded: "Empleado agregado correctamente.",
    employeeAddFailed: "No se pudo agregar el empleado.",
    employeeRemoved: "Empleado eliminado correctamente.",
    employeeRemoveFailed: "No se pudo eliminar el empleado.",
    attendanceUpdated: "Asistencia actualizada.",
    attendanceFailed: "No se pudo actualizar la asistencia.",
    settingsUpdated: "Configuración actualizada correctamente.",
    settingsFailed: "No se pudo actualizar la configuración.",
    vehicleDeleted: "Vehículo eliminado correctamente.",
    vehicleDeleteFailed: "No se pudo eliminar el vehículo.",
    deleteVehicleConfirm: "¿Eliminar este vehículo permanentemente?",
  },
} as const;

const cardClass =
  "rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]";

const softCardClass = "rounded-2xl bg-gray-50 p-4 dark:bg-[#21262d]";

const inputClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black dark:border-[#30363d] dark:bg-[#0d1117] dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-[#58a6ff]";

const selectClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black dark:border-[#30363d] dark:bg-[#0d1117] dark:text-gray-200 dark:focus:border-[#58a6ff]";

const textareaClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black dark:border-[#30363d] dark:bg-[#0d1117] dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-[#58a6ff]";

const primaryButtonClass =
  "w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60 dark:bg-[#238636] dark:text-white";

const secondaryButtonClass =
  "rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-[#30363d] dark:text-gray-200 dark:hover:bg-[#21262d]";




function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function generateMapEmbedUrl(lat?: number, lng?: number) {
  const finalLat = lat ?? 5.6037;
  const finalLng = lng ?? -0.187;
  return `https://maps.google.com/maps?q=${finalLat},${finalLng}&z=13&output=embed`;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function analyticsBarWidth(value: number, max: number) {
  if (max === 0) return "0%";
  return `${(value / max) * 100}%`;
}

function formatReadableDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}



export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("vehicles");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<Date>(new Date());
  const [attendanceEmployeeFilter, setAttendanceEmployeeFilter] = useState<string>("all");
const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<
  "all" | AttendanceStatus
>("all");
const [attendanceMonthFilter, setAttendanceMonthFilter] = useState<string>(
  new Date().toISOString().slice(0, 7)
);


const [bookingSearch, setBookingSearch] = useState("");



  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [purchaseHistoryFilter, setPurchaseHistoryFilter] = useState<
  "all" | "rent" | "buy"
      >("all");
const [newPurchaseCount, setNewPurchaseCount] = useState(0);
const [lastViewedPurchaseAt, setLastViewedPurchaseAt] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const [settings, setSettings] = useState<AppSetting>({
    id: "default",
    theme: "light",
    language: "English",
  });

  const t = translations[settings.language];

  const [vehicleLoadFailed, setVehicleLoadFailed] = useState(false);
  const [employeesLoadFailed, setEmployeesLoadFailed] = useState(false);
  const [attendanceLoadFailed, setAttendanceLoadFailed] = useState(false);
  const [membersLoadFailed, setMembersLoadFailed] = useState(false);
  const [settingsLoadFailed, setSettingsLoadFailed] = useState(false);
  const [purchaseHistoryLoadFailed, setPurchaseHistoryLoadFailed] = useState(false);

  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(emptyVehicleForm);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>(emptyEmployeeForm);
  const [employeeImageFile, setEmployeeImageFile] = useState<File | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<"all" | EmployeeRole>("all");

  const [vehicleEditingId, setVehicleEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingImagePath, setExistingImagePath] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState<"all" | VehicleCategory>("all");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [toast, setToast] = useState<{
  text: string;
  type: "success" | "error";
} | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
  setMounted(true);

  const savedLastViewed = localStorage.getItem("lastViewedPurchaseAt");
  if (savedLastViewed) {
    setLastViewedPurchaseAt(savedLastViewed);
  }

  void loadAllData();
}, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme, mounted]);

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

  /* ✅ ADD IT EXACTLY HERE */
useEffect(() => {
  const channel = supabase
    .channel("admin-bookings-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "bookings" },
      () => {
        void loadPurchaseHistory();
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}, []);

useEffect(() => {
  if (!toast) return;

  const timer = setTimeout(() => {
    setToast(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [toast]);

async function loadAllData() {
  await Promise.all([
    loadVehicles(),
    loadEmployees(),
    loadAttendance(),
    loadMembers(),
    loadPurchaseHistory(),
    loadSettings(),
  ]);
}

function markPurchaseHistoryAsViewed(items: PurchaseHistoryItem[]) {
  const latestDate = items[0]?.created_at || new Date().toISOString();

  setLastViewedPurchaseAt(latestDate);
  localStorage.setItem("lastViewedPurchaseAt", latestDate);
  setNewPurchaseCount(0);
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

const selectedAttendanceDateKey = useMemo(
  () => formatDateKey(selectedAttendanceDate),
  [selectedAttendanceDate]
);

const attendanceByEmployeeAndDate = useMemo(() => {
  const map: Record<string, Record<string, AttendanceStatus>> = {};

  for (const record of attendanceRecords) {
    if (!map[record.employee_id]) {
      map[record.employee_id] = {};
    }

    map[record.employee_id][record.attendance_date] = record.status;
  }

  return map;
}, [attendanceRecords]);

const filteredAttendanceRecords = useMemo(() => {
  return attendanceRecords.filter((record) => {
    const matchesMonth = record.attendance_date.startsWith(attendanceMonthFilter);
    const matchesEmployee =
      attendanceEmployeeFilter === "all" ||
      record.employee_id === attendanceEmployeeFilter;
    const matchesStatus =
      attendanceStatusFilter === "all" ||
      record.status === attendanceStatusFilter;

    return matchesMonth && matchesEmployee && matchesStatus;
  });
}, [
  attendanceRecords,
  attendanceMonthFilter,
  attendanceEmployeeFilter,
  attendanceStatusFilter,
]);





const attendanceSummary = useMemo(() => {
  const summary = {
    present: 0,
    late: 0,
    absent: 0,
    off: 0,
  };

  employees.forEach((employee) => {
    const status =
      attendanceByEmployeeAndDate[employee.id]?.[selectedAttendanceDateKey];

    if (!status) return;

    if (status === "present") summary.present += 1;
    if (status === "late") summary.late += 1;
    if (status === "absent") summary.absent += 1;
    if (status === "off") summary.off += 1;
  });

  return summary;
}, [employees, attendanceByEmployeeAndDate, selectedAttendanceDateKey]);



const attendanceAnalytics = useMemo(() => {
  const summaryByEmployee: Record<
    string,
    {
      name: string;
      role: string;
      present: number;
      late: number;
      absent: number;
      off: number;
      total: number;
    }
  > = {};

  employees.forEach((employee) => {
    if (
      attendanceEmployeeFilter !== "all" &&
      employee.id !== attendanceEmployeeFilter
    ) {
      return;
    }

    summaryByEmployee[employee.id] = {
      name: employee.full_name,
      role: employee.role,
      present: 0,
      late: 0,
      absent: 0,
      off: 0,
      total: 0,
    };
  });

  filteredAttendanceRecords.forEach((record) => {
    const employee = summaryByEmployee[record.employee_id];
    if (!employee) return;

    if (record.status === "present") employee.present += 1;
    if (record.status === "late") employee.late += 1;
    if (record.status === "absent") employee.absent += 1;
    if (record.status === "off") employee.off += 1;

    employee.total += 1;
  });

  return Object.entries(summaryByEmployee)
    .map(([employeeId, stats]) => ({
      employeeId,
      ...stats,
      attendanceRate:
        stats.total > 0
          ? Math.round(((stats.present + stats.late) / stats.total) * 100)
          : 0,
    }))
    .sort((a, b) => b.attendanceRate - a.attendanceRate);
}, [
  employees,
  filteredAttendanceRecords,
  attendanceEmployeeFilter,
]);


 const monthlyAttendanceTotals = useMemo(() => {
  const monthly: Record<
    string,
    { present: number; late: number; absent: number; off: number }
  > = {};

  filteredAttendanceRecords.forEach((record) => {
    const monthKey = record.attendance_date.slice(0, 7);

    if (!monthly[monthKey]) {
      monthly[monthKey] = { present: 0, late: 0, absent: 0, off: 0 };
    }

    monthly[monthKey][record.status] += 1;
  });

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month,
      ...values,
    }));
}, [filteredAttendanceRecords]);


 const filteredPurchaseHistory = useMemo(() => {
  return purchaseHistory.filter((item) => {
    const matchesType =
      purchaseHistoryFilter === "all" ||
      item.booking_type === purchaseHistoryFilter;

    const matchesSearch =
      bookingSearch.trim() === "" ||
      item.id.toLowerCase().includes(bookingSearch.trim().toLowerCase());

    return matchesType && matchesSearch;
  });
}, [purchaseHistory, purchaseHistoryFilter, bookingSearch]);

const groupedPurchaseHistory = useMemo(() => {
  const groups: Record<string, PurchaseHistoryItem[]> = {};

  filteredPurchaseHistory.forEach((item) => {
    const key = item.created_at ? item.created_at.slice(0, 10) : "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}, [filteredPurchaseHistory]);

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
async function loadPurchaseHistory() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_type,
        full_name,
        email,
        phone,
        start_date,
        end_date,
        pickup_location,
        total_amount,
        status,
        created_at,
        vehicle_id,
        chauffeur_required,
        chauffeur_name,
        chauffeur_phone,
        pickup_time,
        payment_method,
        payment_status,
        vehicles (
          title,
          brand,
          model,
          year,
          image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = (data ?? []) as PurchaseHistoryItem[];
    setPurchaseHistory(items);
    setPurchaseHistoryLoadFailed(false);

    const savedLastViewed =
      lastViewedPurchaseAt || localStorage.getItem("lastViewedPurchaseAt") || "";

    if (!savedLastViewed) {
      setNewPurchaseCount(0);
      return;
    }

    const unseenCount = items.filter(
      (item) =>
        item.created_at &&
        new Date(item.created_at).getTime() > new Date(savedLastViewed).getTime()
    ).length;

    setNewPurchaseCount(unseenCount);
  } catch (error) {
    console.error("Load purchase history error:", error);
    setPurchaseHistoryLoadFailed(true);
    setPurchaseHistory([]);
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
      if (data) setSettings(data as AppSetting);
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
      setMessage(t.completeVehicleFields);
      return false;
    }

    if (!vehicleEditingId && !imageFile) {
      setMessage(t.uploadVehicleImage);
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
      setMessage(t.completeEmployeeFields);
      return false;
    }
    return true;
  }


function getStoragePathFromPublicUrl(url: string | null, bucket: string) {
  if (!url) return "";
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return "";
  return decodeURIComponent(url.slice(index + marker.length));
}

async function uploadVehicleImage(file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `vehicles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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

async function uploadEmployeeImage(file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `employees/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(EMPLOYEE_BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(EMPLOYEE_BUCKET).getPublicUrl(path);

  return {
    image_url: data.publicUrl,
    image_path: path,
  };
}

async function deleteVehicleStorageFile(path: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

async function deleteEmployeeStorageFile(path: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(EMPLOYEE_BUCKET).remove([path]);
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
        await deleteVehicleStorageFile(oldImagePath);
        image_url = null;
        image_path = null;
      }

      if (imageFile) {
        const uploaded = await uploadVehicleImage(imageFile);
        image_url = uploaded.image_url;
        image_path = uploaded.image_path;

        if (oldImagePath && oldImagePath !== uploaded.image_path) {
          await deleteVehicleStorageFile(oldImagePath);
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
        setMessage(t.vehicleUpdated);
      } else {
        const { data, error } = await supabase
          .from("vehicles")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

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

        setMessage(t.vehicleAdded);
      }

      await loadVehicles();
      resetVehicleForm();
    } catch (error) {
      console.error("Vehicle submit full error:", error);
      setMessage(t.vehicleSaveError);
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
    let image_url: string | null = null;
    let image_path: string | null = null;

    if (employeeImageFile) {
      const uploaded = await uploadEmployeeImage(employeeImageFile);
      image_url = uploaded.image_url;
      image_path = uploaded.image_path;
    }

    const payload = {
      full_name: employeeForm.name.trim(),
      role: employeeForm.role,
      phone: employeeForm.phone.trim(),
      email: employeeForm.email.trim().toLowerCase(),
      status: employeeForm.status,
      image_url,
      image_path,
      is_chauffeur: employeeForm.role === "Chauffeur" || employeeForm.is_chauffeur,
      is_available: true,
    };

    const { error } = await supabase.from("employees").insert(payload);
    if (error) throw error;

    setEmployeeForm(emptyEmployeeForm);
    setEmployeeImageFile(null);
    await loadEmployees();
    setMessage(t.employeeAdded);
  } catch (error) {
    console.error("Employee submit error:", error);
    setMessage(t.employeeAddFailed);
  } finally {
    setLoading(false);
  }
}

  async function handleEmployeeDelete(employee: Employee) {
  setLoading(true);
  setMessage("");

  try {
    const imagePath =
      employee.image_path || getStoragePathFromPublicUrl(employee.image_url, EMPLOYEE_BUCKET);

    if (imagePath) {
      await deleteEmployeeStorageFile(imagePath);
    }

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employee.id);

    if (error) throw error;

    await loadEmployees();
    await loadAttendance();
    setMessage(t.employeeRemoved);
  } catch (error) {
    console.error("Employee delete error:", error);
    setMessage(t.employeeRemoveFailed);
  } finally {
    setLoading(false);
  }
}




async function handleAttendanceChangeForDate(
  employeeId: string,
  status: AttendanceStatus,
  attendanceDate: string
) {
  setLoading(true);
  setMessage("");

  try {
    const { error } = await supabase.from("attendance").upsert(
      {
        employee_id: employeeId,
        attendance_date: attendanceDate,
        status,
      },
      {
        onConflict: "employee_id,attendance_date",
      }
    );

    if (error) throw error;

    await loadAttendance();
    setMessage("Attendance saved successfully.");
  } catch (error) {
    console.error("Attendance save error:", error);
    setMessage(t.attendanceFailed);
  } finally {
    setLoading(false);
  }
}

function handleExportAttendanceCsv() {
  const rows = filteredAttendanceRecords.map((record) => {
    const employee = employees.find((emp) => emp.id === record.employee_id);

    return {
      date: record.attendance_date,
      employee_name: employee?.full_name || "Unknown",
      role: employee?.role || "Unknown",
      status: record.status,
    };
  });

  const headers = ["Date", "Employee Name", "Role", "Status"];

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      [row.date, row.employee_name, row.role, row.status]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `attendance-report-${attendanceMonthFilter}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
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
    setMessage(t.settingsUpdated);
  } catch (error) {
    console.error("Settings save error:", error);
    setMessage(t.settingsFailed);
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
      vehicle.image_path || getStoragePathFromPublicUrl(vehicle.image_url, BUCKET)
    );
    setImageFile(null);
    setRemoveCurrentImage(false);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleVehicleDelete(vehicle: Vehicle) {
    const ok = window.confirm(t.deleteVehicleConfirm);
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const imagePath =
            vehicle.image_path || getStoragePathFromPublicUrl(vehicle.image_url, BUCKET);

      if (imagePath) {
        await deleteVehicleStorageFile(imagePath);
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
      setMessage(t.vehicleDeleted);
    } catch (error) {
      console.error("Vehicle delete error:", error);
      setMessage(t.vehicleDeleteFailed);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.location.href = "/api/admin/logout";
  }

  function statusLabel(status: VehicleStatus) {
    if (status === "in_use") return t.inUse;
    if (status === "purchased") return t.purchased;
    return t.available;
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

  function attendanceLabel(status: AttendanceStatus) {
    if (status === "present") return t.present;
    if (status === "late") return t.late;
    if (status === "absent") return t.absent;
    return t.off;
  }

  function renderHeader() {
    return (
      <div className="mb-8 rounded-3xl border border-gray-200 bg-white px-6 py-8 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              {t.dashboard}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
              {t[activeTab as keyof typeof t]}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t.manage}
            </p>
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 shadow-sm hover:bg-gray-100 dark:border-[#30363d] dark:bg-[#21262d] dark:text-gray-200 dark:hover:bg-[#30363d]"
            >
              <Bell size={20} />
              {weeklyMemberCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[22px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                  {weeklyMemberCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 z-30 mt-3 w-[360px] rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-[#30363d] dark:bg-[#161b22]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {t.memberNotifications}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#21262d]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className={softCardClass}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.joinedToday}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {todayMemberCount}
                    </p>
                  </div>
                  <div className={softCardClass}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.joinedThisWeek}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {weeklyMemberCount}
                    </p>
                  </div>
                </div>

                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {membersThisWeek.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-[#21262d] dark:text-gray-400">
                      {t.noNewMembers}
                    </div>
                  ) : (
                    membersThisWeek.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-[#30363d] dark:bg-[#21262d]"
                      >
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {member.full_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {member.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.phone || t.noPhoneNumber}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
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
      <div className="grid items-start gap-8 xl:grid-cols-[420px_1fr]">
        <section className={cardClass}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vehicleEditingId ? t.editVehicle : t.addVehicle}
            </h2>

            {vehicleEditingId && (
              <button
                type="button"
                onClick={resetVehicleForm}
                className={secondaryButtonClass}
              >
                {t.cancel}
              </button>
            )}
          </div>

          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <input
              name="title"
              value={vehicleForm.title}
              onChange={handleVehicleChange}
              placeholder={t.vehicleTitle}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                name="category"
                value={vehicleForm.category}
                onChange={handleVehicleChange}
                className={selectClass}
              >
                <option value="rent">{t.rent}</option>
                <option value="sale">{t.sale}</option>
              </select>

              <select
                name="status"
                value={vehicleForm.status}
                onChange={handleVehicleChange}
                className={selectClass}
              >
                <option value="available">{t.available}</option>
                <option value="in_use">{t.inUse}</option>
                <option value="purchased">{t.purchased}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="brand"
                value={vehicleForm.brand}
                onChange={handleVehicleChange}
                placeholder={t.brand}
                className={inputClass}
              />
              <input
                name="model"
                value={vehicleForm.model}
                onChange={handleVehicleChange}
                placeholder={t.model}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input
                name="year"
                type="number"
                value={vehicleForm.year}
                onChange={handleVehicleChange}
                placeholder={t.year}
                className={inputClass}
              />
              <input
                name="price"
                type="number"
                value={vehicleForm.price}
                onChange={handleVehicleChange}
                placeholder={t.price}
                className={inputClass}
              />
              <input
                name="seats"
                type="number"
                value={vehicleForm.seats}
                onChange={handleVehicleChange}
                placeholder={t.seats}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="transmission"
                value={vehicleForm.transmission}
                onChange={handleVehicleChange}
                placeholder={t.transmission}
                className={inputClass}
              />
              <input
                name="fuel_type"
                value={vehicleForm.fuel_type}
                onChange={handleVehicleChange}
                placeholder={t.fuelType}
                className={inputClass}
              />
            </div>

            <textarea
              name="description"
              value={vehicleForm.description}
              onChange={handleVehicleChange}
              placeholder={t.vehicleDescription}
              rows={4}
              className={textareaClass}
            />

            {existingImageUrl && !removeCurrentImage && (
              <div className="rounded-2xl border border-gray-200 p-3 dark:border-[#30363d]">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.currentImage}
                </p>
                <img
                  src={existingImageUrl}
                  alt="Current vehicle"
                  className="h-40 w-full rounded-2xl object-cover"
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={removeCurrentImage}
                    onChange={(e) => setRemoveCurrentImage(e.target.checked)}
                  />
                  {t.removeCurrentImage}
                </label>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {vehicleEditingId ? t.uploadNewImage : t.uploadImage}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className={inputClass}
              />
            </div>

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading
                ? t.saving
                : vehicleEditingId
                ? t.updateVehicle
                : t.addVehicle}
            </button>
          </form>
        </section>

        <section className={cardClass}>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.vehicleInventory}
            </h2>

            <div className="flex gap-2">
              {(["all", "rent", "sale"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setVehicleFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    vehicleFilter === filter
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 text-gray-800 dark:bg-[#21262d] dark:text-gray-200"
                  }`}
                >
                  {filter === "all" ? t.all : filter === "rent" ? t.rent : t.sale}
                </button>
              ))}
            </div>
          </div>

          {vehicleLoadFailed ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {t.failedLoadVehicles}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-[#30363d] dark:text-gray-400">
              {t.noVehicles}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-[#30363d] dark:bg-[#21262d]"
                >
                  <img
                    src={vehicle.image_url || "/placeholder-car.jpg"}
                    alt={vehicle.title}
                    className="h-56 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {vehicle.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                      {vehicle.description}
                    </p>

                    <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                        <span className="block text-xs text-gray-400">{t.category}</span>
                        <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
                          {vehicle.category === "rent" ? t.rent : t.sale}
                        </span>
                      </div>
                      <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                        <span className="block text-xs text-gray-400">{t.price}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
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
                        className="flex-1 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleVehicleDelete(vehicle)}
                        className="flex-1 rounded-2xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-[#0d1117] dark:text-red-400"
                      >
                        {t.delete}
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
        <section className={cardClass}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.gpsOverview}
          </h2>
          <div className="mt-6 space-y-4">
            <div className={softCardClass}>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.rentalVehicles}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {rentedVehicles.length}
              </p>
            </div>
            <div className={softCardClass}>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.currentlyInUse}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {inUseVehicles.length}
              </p>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.map}
          </h2>
          <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-[#30363d]">
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

    const filteredEmployees =
  employeeFilter === "all"
    ? employees
    : employees.filter((employee) => employee.role === employeeFilter);


    return (
      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <section className={cardClass}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.addEmployee}
          </h2>

          <form onSubmit={handleEmployeeSubmit} className="mt-6 space-y-4">
            <input
              name="name"
              value={employeeForm.name}
              onChange={handleEmployeeChange}
              placeholder={t.fullName}
              className={inputClass}
            />

            <select
                    name="role"
                    value={employeeForm.role}
                    onChange={(e) => {
                      const value = e.target.value as EmployeeRole;
                      setEmployeeForm((prev) => ({
                        ...prev,
                        role: value,
                        is_chauffeur: value === "Chauffeur",
                      }));
                    }}
                    className={selectClass}
                  >
                    <option value="Chauffeur">Chauffeur</option>
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
              placeholder={t.phoneNumber}
              className={inputClass}
            />

            <input
              name="email"
              value={employeeForm.email}
              onChange={handleEmployeeChange}
              placeholder={t.emailAddress}
              className={inputClass}
            />

            <select
              name="status"
              value={employeeForm.status}
              onChange={handleEmployeeChange}
              className={selectClass}
            >
              <option value="active">{t.active}</option>
              <option value="off">{t.offDuty}</option>
            </select>



            <div>
  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
    Employee Image
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setEmployeeImageFile(e.target.files?.[0] || null)}
    className={inputClass}
  />
</div>

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {t.addEmployee}
            </button>
          </form>
        </section>

       <section className={cardClass}>
  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
    {t.employeeList}
  </h2>

  <div className="mt-6 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => setEmployeeFilter("all")}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        employeeFilter === "all"
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "bg-gray-100 text-gray-800 dark:bg-[#21262d] dark:text-gray-200"
      }`}
    >
      All
    </button>

    {[
      "Chauffeur",
      "Driver",
      "Operations Manager",
      "Sales Manager",
      "Fleet Supervisor",
      "Customer Relations",
      "Admin Staff",
    ].map((role) => (
      <button
        key={role}
        type="button"
        onClick={() => setEmployeeFilter(role as EmployeeRole)}
        className={`rounded-full px-4 py-2 text-sm font-medium ${
          employeeFilter === role
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "bg-gray-100 text-gray-800 dark:bg-[#21262d] dark:text-gray-200"
        }`}
      >
        {role}
      </button>
    ))}
  </div>

          {employeesLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {t.failedLoadEmployees}
            </div>
          ) : employees.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-[#30363d] dark:text-gray-400">
              {t.noEmployees}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-[#30363d] dark:bg-[#21262d]"
                >
                  <div className="flex items-start justify-between gap-4">
  <div className="flex items-center gap-4">
    <img
      src={employee.image_url || "/placeholder-user.jpg"}
      alt={employee.full_name}
      className="h-16 w-16 rounded-2xl object-cover border border-gray-200 dark:border-[#30363d]"
    />

    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {employee.full_name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {employee.role}
      </p>

      {employee.is_chauffeur && (
        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {employee.is_available ? "Available Chauffeur" : "Assigned / Busy"}
        </p>
      )}
    </div>
  </div>

  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      employee.status === "active"
        ? "bg-green-100 text-green-700"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {employee.status === "active" ? t.active : t.offDuty}
  </span>
</div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>{employee.phone}</p>
                    <p>{employee.email}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => void handleEmployeeDelete(employee)}
                      className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-[#0d1117] dark:text-red-400"
                    >
                      {t.removeEmployee}
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
    <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
      <section className={cardClass}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Attendance Calendar
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Select any day, month, or year to mark attendance.
        </p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22]">
          <DayPicker
            mode="single"
            selected={selectedAttendanceDate}
            onSelect={(date) => {
              if (date) setSelectedAttendanceDate(date);
            }}
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className={softCardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Selected Date</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatReadableDate(selectedAttendanceDate)}
            </p>
          </div>

          <div className={softCardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.present}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {attendanceSummary.present}
            </p>
          </div>

          <div className={softCardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.late}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {attendanceSummary.late}
            </p>
          </div>

          <div className={softCardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.absent}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {attendanceSummary.absent}
            </p>
          </div>

          <div className={softCardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.off}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {attendanceSummary.off}
            </p>
          </div>
        </div>
      </section>

     <section className={cardClass}>
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      {t.markAttendance}
    </h2>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
      {formatReadableDate(selectedAttendanceDate)}
    </p>

    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Month
        </label>
        <input
          type="month"
          value={attendanceMonthFilter}
          onChange={(e) => setAttendanceMonthFilter(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Employee
        </label>
        <select
          value={attendanceEmployeeFilter}
          onChange={(e) => setAttendanceEmployeeFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Status
        </label>
        <select
          value={attendanceStatusFilter}
          onChange={(e) =>
            setAttendanceStatusFilter(e.target.value as "all" | AttendanceStatus)
          }
          className={selectClass}
        >
          <option value="all">All Statuses</option>
          <option value="present">{t.present}</option>
          <option value="late">{t.late}</option>
          <option value="absent">{t.absent}</option>
          <option value="off">{t.off}</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={handleExportAttendanceCsv}
          className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          Export CSV
        </button>
      </div>
    </div>
  </div>

        {attendanceLoadFailed || employeesLoadFailed ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {t.failedLoadAttendance}
          </div>
        ) : employees.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-[#30363d] dark:text-gray-400">
            {t.noEmployeesAttendance}
          </div>
        ) : (
          <div className="space-y-4">
            {employees
  .filter(
    (employee) =>
      attendanceEmployeeFilter === "all" ||
      employee.id === attendanceEmployeeFilter
  )
  .map((employee) => {
              const currentStatus =
                attendanceByEmployeeAndDate[employee.id]?.[selectedAttendanceDateKey] || "";

              return (
                <div
                  key={employee.id}
                  className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 md:flex-row md:items-center md:justify-between dark:border-[#30363d] dark:bg-[#21262d]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={employee.image_url || "/placeholder-user.jpg"}
                      alt={employee.full_name}
                      className="h-14 w-14 rounded-2xl border border-gray-200 object-cover dark:border-[#30363d]"
                    />

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {employee.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {employee.role}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-[220px]">
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        void handleAttendanceChangeForDate(
                          employee.id,
                          e.target.value as AttendanceStatus,
                          selectedAttendanceDateKey
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">Select status</option>
                      <option value="present">{t.present}</option>
                      <option value="late">{t.late}</option>
                      <option value="absent">{t.absent}</option>
                      <option value="off">{t.off}</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        <div className="mt-10 border-t pt-6">
  <h3 className="text-xl font-bold mb-4">Analytics</h3>

  {/* Best performer */}
  <div className="mb-6">
    <p className="text-sm text-gray-500">Best Attendance</p>
    <p className="font-bold text-lg">
      {attendanceAnalytics[0]?.name || "No data"} (
      {attendanceAnalytics[0]?.attendanceRate || 0}%)
    </p>
  </div>

  {/* Employee stats */}
  <div className="space-y-4">
    {attendanceAnalytics.map((emp) => (
      <div key={emp.employeeId} className="p-4 rounded-2xl bg-gray-50">
        <p className="font-bold">{emp.name}</p>
        <p className="text-sm text-gray-500">{emp.role}</p>

        <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
          <span>P: {emp.present}</span>
          <span>L: {emp.late}</span>
          <span>A: {emp.absent}</span>
          <span>O: {emp.off}</span>
        </div>
      </div>
    ))}
  </div>

  {/* Monthly */}
  <div className="mt-8">
    <h4 className="font-bold mb-3">Monthly Trends</h4>

    {monthlyAttendanceTotals.map((m) => {
      const max = Math.max(m.present, m.late, m.absent, m.off);

      return (
        <div key={m.month} className="mb-4">
          <p className="font-medium">{m.month}</p>

         <div className="space-y-2 text-sm">
  <div>
    <p className="mb-1 text-xs text-gray-500">Present: {m.present}</p>
    <div className="h-2 rounded-full bg-gray-200 dark:bg-[#30363d]">
      <div
        style={{ width: analyticsBarWidth(m.present, max) }}
        className="h-2 rounded-full bg-green-500"
      />
    </div>
  </div>

  <div>
    <p className="mb-1 text-xs text-gray-500">Late: {m.late}</p>
    <div className="h-2 rounded-full bg-gray-200 dark:bg-[#30363d]">
      <div
        style={{ width: analyticsBarWidth(m.late, max) }}
        className="h-2 rounded-full bg-yellow-500"
      />
    </div>
  </div>

  <div>
    <p className="mb-1 text-xs text-gray-500">Absent: {m.absent}</p>
    <div className="h-2 rounded-full bg-gray-200 dark:bg-[#30363d]">
      <div
        style={{ width: analyticsBarWidth(m.absent, max) }}
        className="h-2 rounded-full bg-red-500"
      />
    </div>
  </div>

  <div>
    <p className="mb-1 text-xs text-gray-500">Off: {m.off}</p>
    <div className="h-2 rounded-full bg-gray-200 dark:bg-[#30363d]">
      <div
        style={{ width: analyticsBarWidth(m.off, max) }}
        className="h-2 rounded-full bg-gray-500"
      />
    </div>
  </div>
</div>
        </div>
      );
    })}
  </div>
</div>

      </section>
    </div>
  );
}
  function renderMembersTab() {
    return (
      <div className="space-y-6">
        <section className={cardClass}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.allMembers}
          </h2>

          {membersLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {t.failedLoadMembers}
            </div>
          ) : members.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-[#30363d] dark:text-gray-400">
              {t.noMembers}
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 dark:border-[#30363d]">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#21262d]">
                  <tr className="border-b border-gray-200 text-gray-500 dark:border-[#30363d] dark:text-gray-400">
                    <th className="px-4 py-3">{t.name}</th>
                    <th className="px-4 py-3">{t.email}</th>
                    <th className="px-4 py-3">{t.phone}</th>
                    <th className="px-4 py-3">{t.consent}</th>
                    <th className="px-4 py-3">{t.status}</th>
                    <th className="px-4 py-3">{t.registered}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-gray-100 bg-white dark:border-[#30363d] dark:bg-[#161b22]"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {member.full_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
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
                          {member.consent ? t.granted : t.no}
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
                          {member.is_active ? t.active : t.inactive}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
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


  function purchaseStatusBadgeClass(status: string) {
  const value = status.toLowerCase();

  if (value === "confirmed" || value === "paid" || value === "completed") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }

  if (value === "pending") {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  }

  if (value === "cancelled" || value === "failed") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }

  return "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}



function paymentMethodBadgeClass(method?: string | null) {
  if (method === "card") {
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  }

  if (method === "momo") {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  }

  if (method === "cash") {
    return "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }

  return "bg-gray-100 text-gray-500 dark:bg-[#30363d] dark:text-gray-400";
}

function paymentStatusBadgeClass(status?: string | null) {
  if (status === "paid") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }

  if (status === "pending") {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  }

  if (status === "failed") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }

  return "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

async function handleTogglePaymentPaid(
  bookingId: string,
  currentStatus?: "pending" | "paid" | "failed" | null
) {
  setLoading(true);
  setMessage("");

  try {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";

    const response = await fetch("/api/bookings/update-payment-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        payment_status: nextStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setToast({
        text: data.error || "Failed to update payment status.",
        type: "error",
      });
      return;
    }

    await loadPurchaseHistory();

    setToast({
      text:
        nextStatus === "paid"
          ? "Payment marked as paid successfully."
          : "Payment unmarked successfully.",
      type: "success",
    });
  } catch (error) {
    console.error("Toggle payment paid error:", error);
    setToast({
      text: "Something went wrong while updating payment.",
      type: "error",
    });
  } finally {
    setLoading(false);
  }
}

function formatPurchaseGroupDate(dateString?: string) {
  if (!dateString) return "Unknown Date";

  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function renderPurchaseHistoryTab() {
  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.purchase_history}
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPurchaseHistoryFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  purchaseHistoryFilter === "all"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 text-gray-800 dark:bg-[#21262d] dark:text-gray-200"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setPurchaseHistoryFilter("rent")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  purchaseHistoryFilter === "rent"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 text-gray-800 dark:bg-[#21262d] dark:text-gray-200"
                }`}
              >
                Rentals
              </button>

              <button
                type="button"
                onClick={() => setPurchaseHistoryFilter("buy")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  purchaseHistoryFilter === "buy"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 text-gray-800 dark:bg-[#21262d] dark:text-gray-200"
                }`}
              >
                Purchases
              </button>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Search by Booking ID"
              className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-black dark:border-[#30363d] dark:bg-[#0d1117] dark:text-gray-200 dark:focus:border-[#58a6ff]"
            />
          </div>
        </div>

        {purchaseHistoryLoadFailed ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            Failed to load purchase history.
          </div>
        ) : filteredPurchaseHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-[#30363d] dark:text-gray-400">
            No records found for this filter.
          </div>
       ) : (
  <div className="space-y-8">
    {groupedPurchaseHistory.map(([dateKey, items]) => (
      <div key={dateKey} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-300 dark:bg-[#30363d]" />
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            {formatPurchaseGroupDate(items[0]?.created_at)}
          </p>
          <div className="h-px flex-1 bg-gray-300 dark:bg-[#30363d]" />
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const vehicleInfo = Array.isArray(item.vehicles)
              ? item.vehicles[0]
              : item.vehicles;

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-[#30363d] dark:bg-[#21262d]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {vehicleInfo?.image_url ? (
                      <img
                        src={vehicleInfo.image_url}
                        alt={vehicleInfo.title}
                        className="h-28 w-full rounded-2xl object-cover sm:w-40"
                      />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center rounded-2xl bg-gray-200 text-sm text-gray-500 dark:bg-[#30363d] dark:text-gray-400 sm:w-40">
                        No image
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {item.full_name}
                          </h3>


                          {item.created_at &&
                            lastViewedPurchaseAt &&
                            new Date(item.created_at).getTime() >
                              new Date(lastViewedPurchaseAt).getTime() && (
                              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">
                                NEW
                              </span>
                            )}

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${purchaseStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {item.booking_type === "rent" ? "Rental" : "Purchase"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMethodBadgeClass(
                              item.payment_method
                            )}`}
                          >
                            {item.payment_method === "card"
                              ? "Card"
                              : item.payment_method === "momo"
                              ? "MoMo"
                              : item.payment_method === "cash"
                              ? "Cash"
                              : "No Payment Method"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {item.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.phone}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 break-all">
                          Booking ID: {item.id}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                          <p className="text-xs text-gray-400">Vehicle</p>
                          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                            {vehicleInfo
                              ? `${vehicleInfo.title} (${vehicleInfo.brand} ${vehicleInfo.model} ${vehicleInfo.year})`
                              : "Unknown vehicle"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                          <p className="text-xs text-gray-400">Pickup Location</p>
                          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                            {item.pickup_location || "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                          <p className="text-xs text-gray-400">Payment Method</p>
                          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                            {item.payment_method
                              ? item.payment_method === "card"
                                ? "Visa / Card"
                                : item.payment_method === "momo"
                                ? "MoMo"
                                : "Cash"
                              : "Not selected"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                          <p className="text-xs text-gray-400">Payment Status</p>
                          <div className="mt-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusBadgeClass(
                                item.payment_status
                              )}`}
                            >
                              {item.payment_status || "unknown"}
                            </span>
                          </div>
                        </div>

                        {item.booking_type === "rent" && (
                          <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                            <p className="text-xs text-gray-400">Rental Period</p>
                            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                              {item.start_date || "-"} to {item.end_date || "-"}
                            </p>
                          </div>
                        )}

                        {item.booking_type === "rent" && (
                          <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                            <p className="text-xs text-gray-400">Chauffeur Required</p>
                            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                              {item.chauffeur_required ? "Yes" : "No"}
                            </p>
                          </div>
                        )}

                        {item.booking_type === "rent" && item.chauffeur_required && (
                          <>
                            <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                              <p className="text-xs text-gray-400">Chauffeur Name</p>
                              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                                {item.chauffeur_name || "-"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117]">
                              <p className="text-xs text-gray-400">Chauffeur Phone</p>
                              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                                {item.chauffeur_phone || "-"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-white p-3 dark:bg-[#0d1117] sm:col-span-2">
                              <p className="text-xs text-gray-400">Pickup Time</p>
                              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                                {item.pickup_time || "-"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-2xl bg-white px-4 py-4 text-right shadow-sm dark:bg-[#0d1117]">
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${Number(item.total_amount || 0).toLocaleString()}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">Payment Method</p>
                    <div className="mt-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMethodBadgeClass(
                          item.payment_method
                        )}`}
                      >
                        {item.payment_method === "card"
                          ? "Card"
                          : item.payment_method === "momo"
                          ? "MoMo"
                          : item.payment_method === "cash"
                          ? "Cash"
                          : "No Payment Method"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-gray-400">Payment Status</p>
                    <div className="mt-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusBadgeClass(
                          item.payment_status
                        )}`}
                      >
                        {item.payment_status || "unknown"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleTogglePaymentPaid(item.id, item.payment_status)
                      }
                      disabled={loading}
                      className={`mt-4 w-full rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                        item.payment_status === "paid"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {item.payment_status === "paid"
                        ? "Unmark as Paid"
                        : "Mark as Paid"}
                    </button>

                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
)}
          
      </section>
    </div>
  );

}



  function renderSettingsTab() {
    return (
      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <section className={cardClass}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.settings}
          </h2>

          <form onSubmit={handleSettingsSave} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.theme}
              </label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleSettingChange}
                className={selectClass}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.language}
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleSettingChange}
                className={selectClass}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {t.save}
            </button>
          </form>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.currentSettings}
          </h2>

          {settingsLoadFailed ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {t.failedLoadSettings}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={softCardClass}>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.theme}</p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {settings.theme}
                </p>
              </div>
              <div className={softCardClass}>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.language}</p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
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
    case "purchase_history":
      return renderPurchaseHistoryTab();
    case "settings":
      return renderSettingsTab();
    default:
      return null;
  }
}

return (
  <>
    <main className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0d1117] dark:text-gray-200">
      <div className="min-h-screen">
        <AdminNavbar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);

            if (tab === "purchase_history") {
              markPurchaseHistoryAsViewed(purchaseHistory);
            }
          }}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          desktopSidebarOpen={desktopSidebarOpen}
          onDesktopSidebarToggle={() => setDesktopSidebarOpen((prev) => !prev)}
          onLogout={handleLogout}
          purchaseHistoryCount={newPurchaseCount}
          labels={{
            vehicles: t.vehicles,
            gps: t.gps,
            employees: t.employees,
            attendance: t.attendance,
            members: t.members,
            purchaseHistory: t.purchase_history,
            settings: t.settings,
            logout: t.logout,
          }}
        />

        <section
          className={`px-4 py-8 md:px-8 ${
            desktopSidebarOpen ? "lg:ml-[340px]" : "lg:ml-[110px]"
          }`}
        >
          <div className="mx-auto max-w-7xl">
            {renderHeader()}

            {message && (
              <div className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm dark:bg-[#161b22] dark:text-gray-300">
                {message}
              </div>
            )}

            {toast && (
              <div className="fixed right-6 top-6 z-[100]">
                <div
                  className={`rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-xl ${
                    toast.type === "success" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {toast.text}
                </div>
              </div>
            )}

            {renderActiveTab()}
          </div>
        </section>
      </div>
    </main>

    <AdminAIAssistant />
  </>
);
}