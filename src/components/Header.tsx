import { useState, useEffect } from "react";
import { LogOut, LayoutDashboard, QrCode, Sun, Moon, RefreshCw } from "lucide-react";
import { Admin } from "../types";

interface HeaderProps {
  currentAdmin: Admin | null;
  onLogout: () => void;
  viewMode: "admin" | "portal";
  setViewMode: (mode: "admin" | "portal") => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Header({
  currentAdmin,
  onLogout,
  viewMode,
  setViewMode,
  darkMode,
  setDarkMode,
}: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 shadow-xs backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: Brand/Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
          MI
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-lg">
            MI ISLAMIYAH
          </h1>
          <p className="hidden text-[10px] text-slate-500 dark:text-slate-400 sm:block">
            Bumiayu, Baureno, Bojonegoro
          </p>
        </div>
      </div>

      {/* Middle: Live Time */}
      <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-850 dark:text-slate-300 md:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
        <span className="font-semibold text-slate-500 uppercase tracking-tighter">Auto-refresh 30s</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">WIB:</span>
        <span className="font-mono text-sm font-semibold">{formatTime(time)}</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>{formatDate(time)}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Portal / Admin Switcher */}
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setViewMode("portal")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "portal"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Portal Absen</span>
          </button>
          <button
            onClick={() => {
              if (currentAdmin) {
                setViewMode("admin");
              } else {
                setViewMode("admin");
              }
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "admin"
                ? "bg-slate-800 text-white shadow-sm dark:bg-slate-700"
                : "text-slate-600 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile */}
        {currentAdmin && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
            <div className="hidden text-right lg:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {currentAdmin.nama}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/30"
              title="Logout Admin"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
