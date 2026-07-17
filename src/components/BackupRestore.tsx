import { useState, useRef, ChangeEvent } from "react";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Clock,
  History,
  ShieldCheck,
} from "lucide-react";
import { AktivitasLog, Guru, Jadwal, Absensi, Pengaturan } from "../types";

interface BackupRestoreProps {
  guruList: Guru[];
  jadwalList: Jadwal[];
  absensiList: Absensi[];
  pengaturan: Pengaturan;
  aktivitasLogs: AktivitasLog[];
  onRestoreBackup: (data: {
    guru: Guru[];
    jadwal: Jadwal[];
    absensi: Absensi[];
    pengaturan: Pengaturan;
  }) => void;
  onResetDatabase: () => void;
  onAddActivityLog: (aktivitas: string, kategori: AktivitasLog["kategori"]) => void;
}

export default function BackupRestore({
  guruList,
  jadwalList,
  absensiList,
  pengaturan,
  aktivitasLogs,
  onRestoreBackup,
  onResetDatabase,
  onAddActivityLog,
}: BackupRestoreProps) {
  const [activeSubTab, setActiveSubTab] = useState<"logs" | "database">("logs");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup Full Simulator DB
  const handleBackup = () => {
    const fullBackup = {
      appId: "MI-ISLAMIYAH-QR-ATTENDANCE",
      backupTime: new Date().toISOString(),
      guru: guruList,
      jadwal: jadwalList,
      absensi: absensiList,
      pengaturan: pengaturan,
    };

    const text = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Backup_Spreadsheet_MI_Islamiyah_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onAddActivityLog("Berhasil mendownload backup virtual database spreadsheet", "BACKUP");
  };

  // Restore DB from Backup file
  const handleRestore = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.appId !== "MI-ISLAMIYAH-QR-ATTENDANCE") {
          alert("Gagal memulihkan! File JSON tersebut bukan file backup absensi yang sah.");
          return;
        }

        onRestoreBackup({
          guru: parsed.guru || [],
          jadwal: parsed.jadwal || [],
          absensi: parsed.absensi || [],
          pengaturan: parsed.pengaturan || pengaturan,
        });

        alert("Data virtual spreadsheet database berhasil dipulihkan dari file backup!");
        onAddActivityLog("Berhasil memulihkan database dari file backup JSON", "RESTORE");
      } catch (err) {
        alert("Gagal membaca file JSON. Pastikan file valid.");
      }
    };
    reader.readAsText(file);
  };

  // Reset virtual database
  const handleReset = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mengatur ulang database ke data bawaan demo? Seluruh riwayat absen baru akan dihapus!"
      )
    ) {
      onResetDatabase();
      alert("Database virtual spreadsheet berhasil dikembalikan ke data bawaan!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Pusat Riwayat & Cadangan Database
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mengunduh backup database spreadsheet, merestorasi dari file JSON, dan memantau log aktivitas.
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveSubTab("logs")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === "logs"
                ? "bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat Aktivitas Log</span>
          </button>
          <button
            onClick={() => setActiveSubTab("database")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === "database"
                ? "bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Manajemen Backup</span>
          </button>
        </div>
      </div>

      {activeSubTab === "logs" ? (
        /* TAB 1: HISTORY ACTIVITY LOGS */
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Riwayat Aktivitas Operator & Admin
            </h3>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/20">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">ID Log</th>
                  <th className="px-5 py-3">Nama Pengguna</th>
                  <th className="px-5 py-3">Aktivitas / Kegiatan</th>
                  <th className="px-5 py-3 text-right">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                {aktivitasLogs.length > 0 ? (
                  aktivitasLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                        {log.id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-950 dark:text-slate-100">
                        {log.username}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {log.aktivitas}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          log.kategori === "LOGIN" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" :
                          log.kategori === "GURU" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                          log.kategori === "JADWAL" ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400" :
                          log.kategori === "ABSENSI" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                          log.kategori === "PENGATURAN" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                          "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                        }`}>
                          {log.kategori}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Belum ada log riwayat tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: DATABASE BACKUP / RESTORE ACTIONS */
        <div className="grid gap-6 md:grid-cols-2">
          {/* Export / Import Panel */}
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Cadangan Data Simulator
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              Unduh data guru, jadwal pelajaran, pengaturan sekolah, dan riwayat absensi secara lengkap dalam file backup JSON 
              untuk dapat dipulihkan kapan pun.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {/* Backup Button */}
              <button
                onClick={handleBackup}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh File Backup JSON</span>
              </button>

              {/* Restore Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Unggah & Restore Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRestore}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Reset Panel */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-xs dark:border-red-900/10 dark:bg-red-950/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-red-100 pb-3 dark:border-red-900/10">
              <RefreshCw className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-bold text-red-800 dark:text-red-400">
                Pembersihan / Pengaturan Ulang Database
              </h3>
            </div>

            <p className="text-xs text-red-700/80 leading-relaxed dark:text-red-400">
              Tindakan ini akan mengosongkan seluruh riwayat absensi guru harian yang baru, 
              dan merestorasi data database ke pengaturan bawaan demo sekolah MI Islamiyah Bumiayu.
            </p>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "5s" }} />
                <span>Reset Database Bawaan</span>
              </button>
            </div>
          </div>

          {/* Quick Info card */}
          <div className="md:col-span-2 rounded-2xl border border-slate-150 bg-slate-50 px-4 py-3.5 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
            <div className="flex gap-2.5">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <b>Keamanan & Penyimpanan:</b> Seluruh data simulator dicadangkan secara otomatis di 
                penyimpanan lokal browser (<i>localStorage</i>). Anda dapat menutup browser ini dengan aman tanpa khawatir kehilangan data, 
                atau mendownload file cadangan di atas untuk dipindahkan ke perangkat lain.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
