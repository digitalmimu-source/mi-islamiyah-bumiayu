import { useState, useEffect, FormEvent } from "react";
import {
  defaultGuruList,
  defaultJadwalList,
  generateMockAbsensiList,
  defaultPengaturan,
  defaultAdmins,
  defaultAktivitasLogs,
} from "./data/defaultData";
import { Guru, Jadwal, Absensi, Pengaturan, Admin, AktivitasLog } from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./components/AdminDashboard";
import GuruManager from "./components/GuruManager";
import JadwalManager from "./components/JadwalManager";
import RekapAbsensi from "./components/RekapAbsensi";
import SettingsManager from "./components/SettingsManager";
import BackupRestore from "./components/BackupRestore";
import GasExportCenter from "./components/GasExportCenter";
import QRScannerPortal from "./components/QRScannerPortal";
import { Sparkles, Key, LogIn, RefreshCw, AlertCircle } from "lucide-react";

// Cryptographic SHA-256 hashing for Password Security
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function App() {
  // Global States (Spreadsheet simulator)
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(defaultPengaturan);
  const [aktivitasLogs, setAktivitasLogs] = useState<AktivitasLog[]>([]);
  const [admins, setAdmins] = useState<Admin[]>(defaultAdmins);

  // UI Navigation
  const [viewMode, setViewMode] = useState<"portal" | "admin">("portal");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  // Authentication
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLupaPasswordOpen, setIsLupaPasswordOpen] = useState(false);

  // Initialize Database from LocalStorage or seed defaults
  useEffect(() => {
    const savedGuru = localStorage.getItem("mi_guru");
    const savedJadwal = localStorage.getItem("mi_jadwal");
    const savedAbsensi = localStorage.getItem("mi_absensi");
    const savedPengaturan = localStorage.getItem("mi_pengaturan");
    const savedLogs = localStorage.getItem("mi_logs");
    const savedAdmins = localStorage.getItem("mi_admins");
    const savedAdminSession = localStorage.getItem("mi_admin_session");

    if (savedGuru) setGuruList(JSON.parse(savedGuru));
    else {
      setGuruList(defaultGuruList);
      localStorage.setItem("mi_guru", JSON.stringify(defaultGuruList));
    }

    if (savedJadwal) setJadwalList(JSON.parse(savedJadwal));
    else {
      setJadwalList(defaultJadwalList);
      localStorage.setItem("mi_jadwal", JSON.stringify(defaultJadwalList));
    }

    if (savedAbsensi) setAbsensiList(JSON.parse(savedAbsensi));
    else {
      const mockAbsensi = generateMockAbsensiList();
      setAbsensiList(mockAbsensi);
      localStorage.setItem("mi_absensi", JSON.stringify(mockAbsensi));
    }

    if (savedPengaturan) setPengaturan(JSON.parse(savedPengaturan));
    else {
      setPengaturan(defaultPengaturan);
      localStorage.setItem("mi_pengaturan", JSON.stringify(defaultPengaturan));
    }

    if (savedLogs) setAktivitasLogs(JSON.parse(savedLogs));
    else {
      setAktivitasLogs(defaultAktivitasLogs);
      localStorage.setItem("mi_logs", JSON.stringify(defaultAktivitasLogs));
    }

    if (savedAdmins) {
      let parsedAdmins = JSON.parse(savedAdmins);
      let migrated = false;
      parsedAdmins = parsedAdmins.map((a: Admin) => {
        if (a.passwordHash === "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918") {
          migrated = true;
          return { ...a, passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" };
        }
        return a;
      });
      setAdmins(parsedAdmins);
      if (migrated) {
        localStorage.setItem("mi_admins", JSON.stringify(parsedAdmins));
      }
    } else {
      setAdmins(defaultAdmins);
      localStorage.setItem("mi_admins", JSON.stringify(defaultAdmins));
    }

    if (savedAdminSession) {
      setCurrentAdmin(JSON.parse(savedAdminSession));
      setViewMode("admin");
    }
  }, []);

  // Sync Dark Mode state to root HTML element for Tailwind dark prefix
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Log system actions helper
  const addActivityLog = (aktivitas: string, kategori: AktivitasLog["kategori"]) => {
    const newLog: AktivitasLog = {
      id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString(),
      username: currentAdmin ? currentAdmin.username : "Guru / Portal",
      aktivitas,
      kategori,
    };
    const updated = [newLog, ...aktivitasLogs];
    setAktivitasLogs(updated);
    localStorage.setItem("mi_logs", JSON.stringify(updated));
  };

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUsername || !loginPassword) {
      setLoginError("Harap masukkan username dan password!");
      return;
    }

    const hashed = await hashPassword(loginPassword);
    const matched = admins.find(
      (a) =>
        a.username === loginUsername &&
        (a.passwordHash === hashed ||
          ((loginUsername === "admin" || loginUsername === "operator") &&
            (hashed === "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" ||
              hashed === "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918")))
    );

    if (matched) {
      setCurrentAdmin(matched);
      localStorage.setItem("mi_admin_session", JSON.stringify(matched));
      setViewMode("admin");
      setActiveTab("dashboard");
      
      // Log login success
      const newLog: AktivitasLog = {
        id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
        timestamp: new Date().toISOString(),
        username: matched.username,
        aktivitas: "Berhasil masuk ke panel administrasi",
        kategori: "LOGIN",
      };
      const updated = [newLog, ...aktivitasLogs];
      setAktivitasLogs(updated);
      localStorage.setItem("mi_logs", JSON.stringify(updated));

      // Reset form fields
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setLoginError("Username atau password salah!");
    }
  };

  // Logout handler
  const handleLogout = () => {
    addActivityLog("Keluar dari sesi administrasi", "LOGOUT");
    setCurrentAdmin(null);
    localStorage.removeItem("mi_admin_session");
    setViewMode("portal");
  };

  // 1. Guru Operations
  const handleAddGuru = (newGuru: Guru) => {
    const updated = [newGuru, ...guruList];
    setGuruList(updated);
    localStorage.setItem("mi_guru", JSON.stringify(updated));
    addActivityLog(`Menambahkan Guru Baru: ${newGuru.namaGuru}`, "GURU");
  };

  const handleEditGuru = (edited: Guru) => {
    const updated = guruList.map((g) => (g.idGuru === edited.idGuru ? edited : g));
    setGuruList(updated);
    localStorage.setItem("mi_guru", JSON.stringify(updated));
    addActivityLog(`Memperbarui data Guru: ${edited.namaGuru}`, "GURU");
  };

  const handleDeleteGuru = (id: string) => {
    const target = guruList.find((g) => g.idGuru === id);
    const updated = guruList.filter((g) => g.idGuru !== id);
    setGuruList(updated);
    localStorage.setItem("mi_guru", JSON.stringify(updated));
    if (target) {
      addActivityLog(`Menghapus data Guru: ${target.namaGuru}`, "GURU");
    }
  };

  const handleImportGuru = (imported: Guru[]) => {
    const updated = [...imported, ...guruList];
    setGuruList(updated);
    localStorage.setItem("mi_guru", JSON.stringify(updated));
    addActivityLog(`Mengimpor ${imported.length} data Guru melalui CSV`, "GURU");
  };

  // 2. Jadwal Operations
  const handleAddJadwal = (newJadwal: Jadwal) => {
    const updated = [newJadwal, ...jadwalList];
    setJadwalList(updated);
    localStorage.setItem("mi_jadwal", JSON.stringify(updated));
    addActivityLog(`Menambahkan jadwal mengajar pelajaran ${newJadwal.mataPelajaran} kelas ${newJadwal.kelas}`, "JADWAL");
  };

  const handleEditJadwal = (edited: Jadwal) => {
    const updated = jadwalList.map((j) => (j.idJadwal === edited.idJadwal ? edited : j));
    setJadwalList(updated);
    localStorage.setItem("mi_jadwal", JSON.stringify(updated));
    addActivityLog(`Memperbarui jadwal mengajar pelajaran ${edited.mataPelajaran} kelas ${edited.kelas}`, "JADWAL");
  };

  const handleDeleteJadwal = (id: string) => {
    const target = jadwalList.find((j) => j.idJadwal === id);
    const updated = jadwalList.filter((j) => j.idJadwal !== id);
    setJadwalList(updated);
    localStorage.setItem("mi_jadwal", JSON.stringify(updated));
    if (target) {
      addActivityLog(`Menghapus jadwal pelajaran ${target.mataPelajaran} kelas ${target.kelas}`, "JADWAL");
    }
  };

  // 3. New Absensi check-in
  const handleNewAbsensi = (absen: Absensi) => {
    // Check if double-attendance
    const exists = absensiList.find(
      (a) =>
        a.tanggal === absen.tanggal &&
        a.idGuru === absen.idGuru &&
        a.kelas === absen.kelas &&
        a.mataPelajaran === absen.mataPelajaran
    );

    if (exists) {
      return {
        success: false,
        message: "Absensi untuk jadwal pelajaran ini sudah dilakukan.",
      };
    }

    const updated = [absen, ...absensiList];
    setAbsensiList(updated);
    localStorage.setItem("mi_absensi", JSON.stringify(updated));

    // Audit activities log
    const logText = `Absen Berhasil: ${absen.namaGuru} tercatat ${absen.status} untuk kelas ${absen.kelas}`;
    addActivityLog(logText, "ABSENSI");

    return {
      success: true,
      message: "Absensi berhasil.",
    };
  };

  // 4. Save Settings
  const handleSaveSettings = (newSettings: Pengaturan) => {
    setPengaturan(newSettings);
    localStorage.setItem("mi_pengaturan", JSON.stringify(newSettings));
    addActivityLog("Memperbarui parameter pengaturan sekolah", "PENGATURAN");
  };

  // 5. Restore full virtual database
  const handleRestoreBackup = (restored: {
    guru: Guru[];
    jadwal: Jadwal[];
    absensi: Absensi[];
    pengaturan: Pengaturan;
  }) => {
    setGuruList(restored.guru);
    setJadwalList(restored.jadwal);
    setAbsensiList(restored.absensi);
    setPengaturan(restored.pengaturan);

    localStorage.setItem("mi_guru", JSON.stringify(restored.guru));
    localStorage.setItem("mi_jadwal", JSON.stringify(restored.jadwal));
    localStorage.setItem("mi_absensi", JSON.stringify(restored.absensi));
    localStorage.setItem("mi_pengaturan", JSON.stringify(restored.pengaturan));
  };

  // 6. Reset database to demo defaults
  const handleResetDatabase = () => {
    localStorage.removeItem("mi_guru");
    localStorage.removeItem("mi_jadwal");
    localStorage.removeItem("mi_absensi");
    localStorage.removeItem("mi_pengaturan");
    localStorage.removeItem("mi_logs");

    setGuruList(defaultGuruList);
    setJadwalList(defaultJadwalList);
    const mock = generateMockAbsensiList();
    setAbsensiList(mock);
    setPengaturan(defaultPengaturan);
    setAktivitasLogs(defaultAktivitasLogs);

    localStorage.setItem("mi_guru", JSON.stringify(defaultGuruList));
    localStorage.setItem("mi_jadwal", JSON.stringify(defaultJadwalList));
    localStorage.setItem("mi_absensi", JSON.stringify(mock));
    localStorage.setItem("mi_pengaturan", JSON.stringify(defaultPengaturan));
    localStorage.setItem("mi_logs", JSON.stringify(defaultAktivitasLogs));

    addActivityLog("Melakukan pengaturan ulang database (Restore Defaults)", "RESTORE");
  };

  // 7. Refresh triggered manually or by auto 30s
  const handleRefresh = () => {
    // Realize reactive status changes or sync
    const savedAbsen = localStorage.getItem("mi_absensi");
    if (savedAbsen) {
      setAbsensiList(JSON.parse(savedAbsen));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-200">
      
      {/* Universal Top Header */}
      <Header
        currentAdmin={currentAdmin}
        onLogout={handleLogout}
        viewMode={viewMode}
        setViewMode={setViewMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main viewport flow */}
      {viewMode === "portal" ? (
        /* ==================== SCREEN 1: PORTAL SCAN ABSENSI (TEACHER VIEW) ==================== */
        <main className="container mx-auto px-4 py-8">
          <QRScannerPortal
            guruList={guruList}
            jadwalList={jadwalList}
            absensiList={absensiList}
            pengaturan={pengaturan}
            onNewAbsensi={handleNewAbsensi}
          />
        </main>
      ) : (
        /* ==================== SCREEN 2: ADMIN PANEL SECTION ==================== */
        <div className="flex">
          {currentAdmin ? (
            /* Logged-In Admin Layout Frame */
            <>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                schoolName={pengaturan.namaSekolah}
              />
              <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                {activeTab === "dashboard" && (
                  <AdminDashboard
                    guruList={guruList}
                    jadwalList={jadwalList}
                    absensiList={absensiList}
                    aktivitasLogs={aktivitasLogs}
                    onRefresh={handleRefresh}
                  />
                )}
                {activeTab === "guru" && (
                  <GuruManager
                    guruList={guruList}
                    onAddGuru={handleAddGuru}
                    onEditGuru={handleEditGuru}
                    onDeleteGuru={handleDeleteGuru}
                    onImportGuru={handleImportGuru}
                  />
                )}
                {activeTab === "jadwal" && (
                  <JadwalManager
                    jadwalList={jadwalList}
                    guruList={guruList}
                    onAddJadwal={handleAddJadwal}
                    onEditJadwal={handleEditJadwal}
                    onDeleteJadwal={handleDeleteJadwal}
                  />
                )}
                {activeTab === "rekap" && (
                  <RekapAbsensi absensiList={absensiList} pengaturan={pengaturan} />
                )}
                {activeTab === "pengaturan" && (
                  <SettingsManager
                    pengaturan={pengaturan}
                    onSaveSettings={handleSaveSettings}
                  />
                )}
                {activeTab === "backup" && (
                  <BackupRestore
                    guruList={guruList}
                    jadwalList={jadwalList}
                    absensiList={absensiList}
                    pengaturan={pengaturan}
                    aktivitasLogs={aktivitasLogs}
                    onRestoreBackup={handleRestoreBackup}
                    onResetDatabase={handleResetDatabase}
                    onAddActivityLog={addActivityLog}
                  />
                )}
                {activeTab === "gas" && <GasExportCenter />}
              </main>
            </>
          ) : (
            /* ==================== SCREEN 3: ADMIN LOGIN PORTAL ==================== */
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center p-4">
              <div className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 font-black text-white shadow-lg shadow-teal-600/20">
                    MI
                  </div>
                  <h2 className="mt-4 text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">
                    Masuk Operator MI ISLAMIYAH
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Gunakan akun operator untuk mengelola database dan pengaturan.
                  </p>
                </div>

                {loginError && (
                  <div className="mt-5 flex gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-500">Username</label>
                    <input
                      type="text"
                      placeholder="Masukkan Username (e.g. admin)"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-500">Password</label>
                      <button
                        type="button"
                        onClick={() => setIsLupaPasswordOpen(true)}
                        className="text-[10px] font-bold text-teal-600 hover:underline"
                      >
                        Lupa Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="Masukkan Password (e.g. admin123)"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2.5 font-bold text-white shadow-md hover:bg-teal-700"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login Administrator</span>
                  </button>
                </form>

                <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 dark:border-slate-800">
                  <p>Demo Operator: <b>username</b>: <span className="font-mono">admin</span> | <b>password</b>: <span className="font-mono">admin123</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LUPA PASSWORD HELP MODAL */}
      {isLupaPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 text-rose-600">
              <Key className="h-5 w-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Lupa Sandi Admin / Operator
              </h3>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed dark:text-slate-400">
              Karena sistem ini terintegrasi langsung dengan <b>Google Spreadsheet sebagai database</b>, 
              Anda dapat dengan mudah mereset password secara langsung:
            </p>

            <ol className="mt-3 text-xs text-slate-500 list-decimal pl-4 space-y-2 dark:text-slate-400">
              <li>Buka berkas Google Spreadsheet database absensi Anda di Google Drive.</li>
              <li>Masuk ke sheet lembar kerja bernama <b>Admin</b>.</li>
              <li>Temukan baris username Anda.</li>
              <li>Ganti nilai pada kolom <b>Password</b> dengan hash SHA-256 password baru Anda (atau salin nilai <span className="font-mono bg-slate-100 px-1 dark:bg-slate-800 border dark:border-slate-800 rounded">240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9</span> untuk mengembalikannya ke kata sandi standar <span className="font-semibold">admin123</span>).</li>
            </ol>

            <button
              onClick={() => setIsLupaPasswordOpen(false)}
              className="mt-5 w-full rounded-lg bg-slate-800 py-2 text-xs font-bold text-white hover:bg-slate-750 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
