"use client";

import type { ComponentType } from "react";
import {
  CarFront,
  MapPinned,
  Users,
  ClipboardCheck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  UserRoundPlus,
  Settings,
  ReceiptText,
} from "lucide-react";

export type AdminTab =
  | "vehicles"
  | "gps"
  | "employees"
  | "attendance"
  | "members"
  | "purchase_history"
  | "settings";

type NavbarLabels = {
  vehicles: string;
  gps: string;
  employees: string;
  attendance: string;
  members: string;
  purchaseHistory: string;
  settings: string;
  logout: string;
};

type AdminNavbarProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  desktopSidebarOpen: boolean;
  onDesktopSidebarToggle: () => void;
  onLogout?: () => void;
  purchaseHistoryCount?: number;
  labels: NavbarLabels;
};

export default function AdminNavbar({
  activeTab,
  onTabChange,
  mobileMenuOpen,
  onMobileMenuToggle,
  desktopSidebarOpen,
  onDesktopSidebarToggle,
  onLogout,
  purchaseHistoryCount = 0,
  labels,
}: AdminNavbarProps) {
  const sidebarWidthClass = desktopSidebarOpen ? "lg:w-[340px]" : "lg:w-[110px]";

  const navItems: {
  key: AdminTab;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}[] = [
  { key: "vehicles", label: labels.vehicles, icon: CarFront },
  { key: "gps", label: labels.gps, icon: MapPinned },
  { key: "employees", label: labels.employees, icon: Users },
  { key: "attendance", label: labels.attendance, icon: ClipboardCheck },
  { key: "members", label: labels.members, icon: UserRoundPlus },
  { key: "purchase_history", label: labels.purchaseHistory, icon: ReceiptText },
  { key: "settings", label: labels.settings, icon: Settings },
];

 const navButtonClass = (tab: AdminTab, compact = false) =>
  [
    "relative flex w-full items-center rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300",
      compact ? "justify-center" : "justify-start gap-4",
      activeTab === tab
        ? "bg-white text-black shadow-sm dark:bg-white dark:text-black"
        : "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#21262d]",
    ].join(" ");

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-[#30363d] dark:bg-[#0d1117]/90 lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 text-black shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:text-white"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Admin
            </p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Adinkra Drive
            </h1>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-4 max-h-[75vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-8 flex items-center justify-center">
              <img
                src="/adinkra_logo.png"
                alt="Adinkra Drive Logo"
                className="h-28 w-28 rounded-full border border-gray-200 bg-white p-2 object-cover shadow-sm dark:border-[#30363d] dark:bg-[#0d1117]"
              />
            </div>

            <div className="space-y-3">
              {navItems.map((item) => {
  const Icon = item.icon;
  return (
    <button
      key={item.key}
      type="button"
      onClick={() => onTabChange(item.key)}
      className={navButtonClass(item.key)}
    >
      <Icon size={18} />
      <span>{item.label}</span>

      {item.key === "purchase_history" && purchaseHistoryCount > 0 && (
        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {purchaseHistoryCount}
        </span>
      )}
    </button>
  );
})}
            </div>

            <button
              type="button"
              onClick={() => onLogout?.()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm dark:border-red-900/40 dark:bg-[#0d1117] dark:text-red-400"
            >
              <LogOut size={18} />
              <span>{labels.logout}</span>
            </button>
          </div>
        )}
      </div>

      <aside
  className={`fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-3 py-3 text-black transition-all duration-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white lg:flex ${sidebarWidthClass}`}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDesktopSidebarToggle}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-black shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:text-white"
            aria-label={desktopSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            title={desktopSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
          >
            {desktopSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <img
            src="/adinkra_logo.png"
            alt="Adinkra Drive Logo"
            className={
              desktopSidebarOpen
                ? "h-44 w-44 rounded-full border border-gray-200 bg-white p-3 object-cover shadow-sm dark:border-[#30363d] dark:bg-[#161b22]"
                : "h-16 w-16 rounded-full border border-gray-200 bg-white p-1 object-cover shadow-sm dark:border-[#30363d] dark:bg-[#161b22]"
            }
          />
        </div>

        <div className="flex flex-1 overflow-y-auto py-6">
            <div className={`w-full space-y-4 ${desktopSidebarOpen ? "px-0" : "mx-auto max-w-[72px]"}`}>
            {navItems.map((item) => {
  const Icon = item.icon;
  return (
    <button
      key={item.key}
      type="button"
      onClick={() => onTabChange(item.key)}
      className={navButtonClass(item.key, !desktopSidebarOpen)}
      title={!desktopSidebarOpen ? item.label : undefined}
    >
      <Icon size={22} />
      {desktopSidebarOpen && <span>{item.label}</span>}

      {item.key === "purchase_history" && purchaseHistoryCount > 0 && (
        <span
          className={`rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white ${
            desktopSidebarOpen ? "ml-auto" : "absolute -right-1 -top-1"
          }`}
        >
          {purchaseHistoryCount}
        </span>
      )}
    </button>
  );
})}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={() => onLogout?.()}
            className={`flex w-full items-center rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm dark:border-red-900/40 dark:bg-[#161b22] dark:text-red-400 ${
              desktopSidebarOpen ? "justify-center gap-2" : "justify-center"
            }`}
            title={!desktopSidebarOpen ? labels.logout : undefined}
          >
            <LogOut size={18} />
            {desktopSidebarOpen && <span>{labels.logout}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}