import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  Database,
  Terminal,
  LogOut,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  schoolName: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  schoolName,
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      desc: "Ringkasan statistik harian",
    },
    {
      id: "guru",
      name: "Data Guru & QR",
      icon: Users,
      desc: "Manajemen Guru & Cetak QR",
    },
    {
      id: "jadwal",
      name: "Jadwal Mengajar",
      icon: CalendarDays,
      desc: "Pengaturan jadwal mengajar",
    },
    {
      id: "rekap",
      name: "Rekap Absensi",
      icon: FileSpreadsheet,
      desc: "Riwayat & detail lokasi GPS",
    },
    {
      id: "pengaturan",
      name: "Pengaturan Sistem",
      icon: Settings,
      desc: "Radius & koordinat sekolah",
    },
    {
      id: "backup",
      name: "Backup & Logs",
      icon: Database,
      desc: "Riwayat aktivitas & backup",
    },
    {
      id: "gas",
      name: "GAS & Blogger",
      icon: Terminal,
      desc: "Integrasi Google & Blogspot",
    },
  ];

  return (
    <aside className="hidden h-[calc(100vh-4rem)] w-72 flex-col justify-between border-r border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 lg:flex">
      {/* Upper Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        <div>
          <small className="px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Menu Utama
          </small>
          <nav className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
                    }`}
                  />
                  <div className="text-left">
                    <p className="leading-none">{item.name}</p>
                    <span
                      className={`text-[10px] font-normal block mt-0.5 ${
                        isActive ? "text-blue-100" : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Integration Status / Badge */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
          <div className="flex items-center gap-2 text-orange-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              GAS + Blogger Ready
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Portal ini dioptimalkan penuh untuk dijalankan di Google Apps Script dan disematkan langsung ke Blogger (Blogspot) Sekolah.
          </p>
          <button
            onClick={() => setActiveTab("gas")}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-slate-800 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 cursor-pointer"
          >
            Integrasi GAS & Blogger
          </button>
        </div>
      </div>

      {/* Footer / Account Management */}
      <div className="border-t border-slate-800 p-4 bg-slate-950/40">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-950/20"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Keluar Sesi Admin</span>
        </button>
      </div>
    </aside>
  );
}
