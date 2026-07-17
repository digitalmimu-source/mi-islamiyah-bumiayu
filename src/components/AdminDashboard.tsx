import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Activity,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Guru, Jadwal, Absensi, AktivitasLog } from "../types";

interface AdminDashboardProps {
  guruList: Guru[];
  jadwalList: Jadwal[];
  absensiList: Absensi[];
  aktivitasLogs: AktivitasLog[];
  onRefresh: () => void;
}

export default function AdminDashboard({
  guruList,
  jadwalList,
  absensiList,
  aktivitasLogs,
  onRefresh,
}: AdminDashboardProps) {
  const [countdown, setCountdown] = useState(30);

  // Auto-refresh timer every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  // Current Day in Indonesian
  const indonesianDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = indonesianDays[new Date().getDay()];
  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("/").reverse().join("-"); // Format YYYY-MM-DD approximately

  // Exact date matching: We will use the most recent date from records for demo simulation, e.g. "2026-07-17"
  const TODAY_DATE = "2026-07-17"; // Anchored on simulated system time

  // Filtering list based on anchor date
  const absensiToday = absensiList.filter((a) => a.tanggal === TODAY_DATE);
  const jadwalToday = jadwalList.filter((j) => j.hari === "Jumat"); // anchor day is Friday (Jumat) for 2026-07-17

  // Calculate Metrics
  const totalGuru = guruList.filter((g) => g.statusAktif === "Aktif").length;
  const guruHadir = absensiToday.filter((a) => a.status === "Hadir").length;
  const guruTerlambat = absensiToday.filter((a) => a.status === "Terlambat").length;
  
  // Who is absent today (total active teachers scheduled today but haven't scanned yet)
  const scheduledTeachersTodayIds = Array.from(new Set(jadwalToday.map((j) => j.idGuru)));
  const presentTeachersTodayIds = absensiToday.map((a) => a.idGuru);
  const guruBelumAbsenCount = Math.max(
    0,
    scheduledTeachersTodayIds.filter((id) => !presentTeachersTodayIds.includes(id)).length
  );

  // Jadwal Sedang Berlangsung (Schedule running now)
  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const currentMinutes = currentH * 60 + currentM;

  const activeSchedules = jadwalToday.filter((j) => {
    const [startH, startM] = j.jamMulai.split(":").map(Number);
    const [endH, endM] = j.jamSelesai.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  });

  // Chart 1: Grafik Harian (Attendance status over last 5 active dates)
  const last5Dates = Array.from(new Set(absensiList.map((a) => a.tanggal)))
    .sort()
    .slice(-5);

  const dailyTrendData = last5Dates.map((date) => {
    const records = absensiList.filter((a) => a.tanggal === date);
    const dateFormatted = new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
    return {
      tanggal: dateFormatted,
      Hadir: records.filter((r) => r.status === "Hadir").length,
      Terlambat: records.filter((r) => r.status === "Terlambat").length,
    };
  });

  // Chart 2: Grafik Per Mata Pelajaran (Mapel)
  const mapelCountMap: { [key: string]: { hadir: number; terlambat: number } } = {};
  absensiList.forEach((a) => {
    if (!mapelCountMap[a.mataPelajaran]) {
      mapelCountMap[a.mataPelajaran] = { hadir: 0, terlambat: 0 };
    }
    if (a.status === "Hadir") mapelCountMap[a.mataPelajaran].hadir++;
    if (a.status === "Terlambat") mapelCountMap[a.mataPelajaran].terlambat++;
  });
  const mapelChartData = Object.keys(mapelCountMap).map((mapel) => ({
    name: mapel,
    Hadir: mapelCountMap[mapel].hadir,
    Terlambat: mapelCountMap[mapel].terlambat,
  })).slice(0, 6);

  // Chart 3: Grafik Per Guru (Teacher attendance rate)
  const guruStats = guruList.map((g) => {
    const totalSchedules = absensiList.filter((a) => a.idGuru === g.idGuru).length;
    const totalLate = absensiList.filter((a) => a.idGuru === g.idGuru && a.status === "Terlambat").length;
    const totalPresent = totalSchedules - totalLate;
    return {
      nama: g.namaGuru.split(",")[0], // Short name
      Hadir: totalPresent,
      Terlambat: totalLate,
    };
  }).filter((g) => g.Hadir > 0 || g.Terlambat > 0).slice(0, 5);

  // Chart 4: Pie Chart Overall Status
  const totalRecordsAllTime = absensiList.length;
  const totalHadirAllTime = absensiList.filter((a) => a.status === "Hadir").length;
  const totalTerlambatAllTime = absensiList.filter((a) => a.status === "Terlambat").length;

  const pieData = [
    { name: "Tepat Waktu", value: totalHadirAllTime, color: "#2563eb" },
    { name: "Terlambat", value: totalTerlambatAllTime, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Status Row: Refresh indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 px-6 py-4 dark:bg-blue-950/10 dark:border-blue-900/30">
        <div>
          <h2 className="text-base font-bold text-blue-950 dark:text-blue-100 sm:text-lg">
            Dashboard Utama Admin
          </h2>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Simulasi Aktif: Memantau kehadiran guru secara real-time. Hari ini: <b>Jumat, 17 Juli 2026</b>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-blue-800 dark:text-blue-200">
            <Clock className="h-3.5 w-3.5 animate-spin text-blue-600" />
            Auto-refresh dalam <b className="font-mono">{countdown}s</b>
          </span>
          <button
            onClick={() => {
              onRefresh();
              setCountdown(30);
            }}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Refresh Sekarang</span>
          </button>
        </div>
      </div>

      {/* Grid Cards 1 - Key Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Guru */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-150 bg-white p-5 shadow-xs transition-all hover:scale-[1.01] hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Guru Aktif
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalGuru}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
            <span className="font-semibold">100%</span>
            <span className="ml-1.5 text-slate-500">terdaftar aktif mengajar</span>
          </div>
        </div>

        {/* Card 2: Guru Hadir Hari Ini */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Hadir Tepat Waktu
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {guruHadir}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-all group-hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
            <span className="font-semibold">
              {totalGuru > 0 ? Math.round((guruHadir / totalGuru) * 100) : 0}%
            </span>
            <span className="ml-1.5 text-slate-500">kehadiran tepat waktu hari ini</span>
          </div>
        </div>

        {/* Card 3: Guru Terlambat */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Guru Terlambat
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {guruTerlambat}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-all group-hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600 dark:text-amber-400">
            <span className="font-semibold">
              {totalGuru > 0 ? Math.round((guruTerlambat / totalGuru) * 100) : 0}%
            </span>
            <span className="ml-1.5 text-slate-500">datang melampaui toleransi</span>
          </div>
        </div>

        {/* Card 4: Belum Absen */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Belum Absen Hari Ini
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {guruBelumAbsenCount}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-all group-hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-rose-600 dark:text-rose-400">
            <span className="font-semibold">{guruBelumAbsenCount} Guru</span>
            <span className="ml-1.5 text-slate-500">belum log masuk jadwalnya</span>
          </div>
        </div>
      </div>

      {/* Grid: Live Schedules Today & Quick Simulation Statistics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column Left/Middle: Live Schedules */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Jadwal Hari Ini & Status Kelas (Hari {currentDayName})
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {jadwalToday.length} Jadwal Total
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
            {jadwalToday.length > 0 ? (
              jadwalToday.map((j) => {
                const isAbsen = absensiToday.find((a) => a.idGuru === j.idGuru && a.kelas === j.kelas && a.mataPelajaran === j.mataPelajaran);
                return (
                  <div key={j.idJadwal} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {j.mataPelajaran} — Kelas {j.kelas}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Pukul: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{j.jamMulai} - {j.jamSelesai}</span> | Ruang: {j.ruang}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAbsen ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isAbsen.status === "Hadir"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}>
                          <CheckCircle className="h-3 w-3" />
                          {isAbsen.status} ({isAbsen.jamScan})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          Belum Absen
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada jadwal mengajar pada hari {currentDayName}
              </div>
            )}
          </div>
        </div>

        {/* Column Right: Schedules Ongoing Now */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-2 w-2 animate-ping rounded-full bg-rose-500"></div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Sedang Berlangsung Sekarang
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {activeSchedules.length > 0 ? (
              activeSchedules.map((as) => (
                <div key={as.idJadwal} className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/30 dark:bg-blue-950/10">
                  <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                    Kelas {as.kelas} • {as.ruang}
                  </span>
                  <h4 className="mt-1 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    {as.mataPelajaran}
                  </h4>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{as.jamMulai} - {as.jamSelesai}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Sedang Mengajar</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-slate-400">
                <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="mt-2.5">Tidak ada pelajaran yang sedang berlangsung jam sekarang.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Area Chart: Tren Kehadiran Harian */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Grafik Tren Kehadiran Harian (5 Hari Terakhir)
              </h3>
            </div>
          </div>
          <div className="mt-6 h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="tanggal" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "12px", background: "#0f172a", border: "none", color: "#fff" }} />
                <Legend />
                <Area type="monotone" dataKey="Hadir" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHadir)" />
                <Area type="monotone" dataKey="Terlambat" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Kehadiran Per Mata Pelajaran */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Laporan Kehadiran Berdasarkan Mata Pelajaran
              </h3>
            </div>
          </div>
          <div className="mt-6 h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mapelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" tickFormatter={(v) => v.slice(0, 10) + ".."} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "12px", background: "#0f172a", border: "none", color: "#fff" }} />
                <Legend />
                <Bar dataKey="Hadir" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pie Chart: Rasio Ketepatan Waktu */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
              Rasio Ketepatan Waktu All-Time
            </h3>
          </div>
          <div className="mt-6 flex h-48 flex-col items-center justify-center text-xs">
            {totalRecordsAllTime > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex gap-4">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span> Tepat Waktu ({totalHadirAllTime})
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Terlambat ({totalTerlambatAllTime})
                  </span>
                </div>
              </>
            ) : (
              <p className="text-slate-400">Tidak ada data rekap absensi</p>
            )}
          </div>
        </div>

        {/* Bar Chart: Guru Paling Aktif */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
              Frekuensi Kehadiran Berdasarkan Guru (Top 5)
            </h3>
          </div>
          <div className="mt-6 h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={guruStats} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="nama" type="category" stroke="#94a3b8" width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", background: "#0f172a", border: "none", color: "#fff" }} />
                <Bar dataKey="Hadir" stackId="a" fill="#2563eb" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Terlambat" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Log Activities */}
      <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
              Aktivitas Sistem & Riwayat Absen Terbaru (Log Absensi)
            </h3>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {aktivitasLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 text-xs">
              <div className="flex gap-3">
                <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  log.kategori === "LOGIN" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" :
                  log.kategori === "ABSENSI" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                  log.kategori === "PENGATURAN" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {log.kategori}
                </span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{log.aktivitas}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Oleh: {log.username}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
