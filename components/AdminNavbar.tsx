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
} from "lucide-react";

export type AdminTab =
  | "vehicles"
  | "gps"
  | "employees"
  | "attendance"
  | "members"
  | "settings";

type AdminNavbarProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  desktopSidebarOpen: boolean;
  onDesktopSidebarToggle: () => void;
  onLogout?: () => void;
  labels: {
    vehicles: string;
    gps: string;
    employees: string;
    attendance: string;
    members: string;
    settings: string;
    logout: string;
  };
};

export default function AdminNavbar({
  activeTab,
  onTabChange,
  mobileMenuOpen,
  onMobileMenuToggle,
  desktopSidebarOpen,
  onDesktopSidebarToggle,
  onLogout,
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
    { key: "settings", label: labels.settings, icon: Settings },
  ];

  const navButtonClass = (tab: AdminTab, compact = false) =>
    `flex w-full items-center rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300 ${
      compact ? "justify-center" : "justify-start gap-4"
    } ${
      activeTab === tab
        ? "bg-white text-black shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 dark:bg-white dark:text-black"
        : "bg-transparent text-black/90 hover:bg-white/70 dark:text-white/90 dark:hover:bg-white/10"
    }`;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80 lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex items-center justify-center rounded-2xl bg-white p-3 text-black shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5 dark:bg-gray-900 dark:text-white dark:ring-white/10"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Admin
            </p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Adinkra Drive
            </h1>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-4 rounded-3xl bg-white/75 p-4 text-black shadow-[0_18px_50px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur-xl dark:bg-gray-900/90 dark:text-white dark:ring-white/10">
            <div className="mb-8 flex items-center justify-center">
              <img
                src="/adinkra_logo.png"
                alt="Adinkra Drive Logo"
                className="h-28 w-28 rounded-full bg-white p-2 object-cover shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
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
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onLogout?.()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-red-200 dark:bg-gray-800 dark:text-red-400 dark:ring-red-900/40"
            >
              <LogOut size={18} />
              <span>{labels.logout}</span>
            </button>
          </div>
        )}
      </div>

      <aside
        className={`fixed left-0 top-0 hidden h-screen shrink-0 flex-col bg-white/65 px-3 py-3 text-black backdrop-blur-xl transition-all duration-300 shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] dark:bg-gray-950/75 dark:text-white lg:flex ${sidebarWidthClass}`}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-gray-300/60 to-transparent dark:via-white/10" />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDesktopSidebarToggle}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/5 dark:bg-gray-900 dark:text-white dark:ring-white/10"
            aria-label={desktopSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            title={desktopSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
          >
            {desktopSidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          {desktopSidebarOpen ? (
            <img
              src="/adinkra_logo.png"
              alt="Adinkra Drive Logo"
              className="h-44 w-44 rounded-full bg-white p-3 object-cover shadow-[0_14px_40px_rgba(15,23,42,0.10)] ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
            />
          ) : (
            <img
              src="/adinkra_logo.png"
              alt="Adinkra Drive Logo"
              className="h-16 w-16 rounded-full bg-white p-1 object-cover shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
            />
          )}
        </div>

        <div className="flex flex-1 items-center">
          <div
            className={`w-full space-y-4 ${
              desktopSidebarOpen ? "px-0" : "mx-auto max-w-[72px]"
            }`}
          >
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
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={() => onLogout?.()}
            className={`flex w-full items-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-red-200 dark:bg-gray-900 dark:text-red-400 dark:ring-red-900/40 ${
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