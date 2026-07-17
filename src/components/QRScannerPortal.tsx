import { useState, useEffect, useRef } from "react";
import {
  Compass,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  RotateCcw,
  Volume2,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Html5Qrcode } from "html5-qrcode";
import { Guru, Jadwal, Absensi, Pengaturan } from "../types";
import { verifyLocation } from "../utils/haversine";

interface QRScannerPortalProps {
  guruList: Guru[];
  jadwalList: Jadwal[];
  absensiList: Absensi[];
  pengaturan: Pengaturan;
  onNewAbsensi: (absen: Absensi) => { success: boolean; message: string };
}

export default function QRScannerPortal({
  guruList,
  jadwalList,
  absensiList,
  pengaturan,
  onNewAbsensi,
}: QRScannerPortalProps) {
  // Simulator Time Controls (to test different schedules)
  const [simHari, setSimHari] = useState("Jumat");
  const [simJam, setSimJam] = useState("07:15");

  // GPS Coordinates Simulator
  const [gpsMode, setGpsMode] = useState<"inside" | "outside" | "far" | "real">("inside");
  const [userLat, setUserLat] = useState(-7.118800);
  const [userLng, setUserLng] = useState(112.126400);
  const [gpsAccuracy, setGpsAccuracy] = useState(6);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // QR Scanning states
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedGuruMockScan, setSelectedGuruMockScan] = useState("");
  const [absensiResponse, setAbsensiResponse] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const audioBeepRef = useRef<HTMLAudioElement | null>(null);

  // Sync simulated coordinates based on mode
  useEffect(() => {
    if (gpsMode === "inside") {
      setUserLat(-7.118800); // ~15m from school center (-7.118745, 112.126379)
      setUserLng(112.126400);
      setGpsAccuracy(5);
    } else if (gpsMode === "outside") {
      setUserLat(-7.119700); // ~115m (just outside 100m radius)
      setUserLng(112.126800);
      setGpsAccuracy(8);
    } else if (gpsMode === "far") {
      setUserLat(-7.200000); // ~15km away in Bojonegoro town
      setUserLng(112.200000);
      setGpsAccuracy(15);
    }
  }, [gpsMode]);

  // Real Geolocation Fetcher
  const handleFetchRealGps = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation!");
      setGpsLoading(false);
      setGpsMode("inside");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setGpsAccuracy(Math.round(position.coords.accuracy));
        setGpsLoading(false);
      },
      (err) => {
        alert("Gagal mendeteksi lokasi GPS Anda. Pastikan izin lokasi aktif.");
        setGpsLoading(false);
        setGpsMode("inside");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Play Beep sound on successful scans
  const playBeepSound = () => {
    if (audioBeepRef.current) {
      audioBeepRef.current.currentTime = 0;
      audioBeepRef.current.play().catch((err) => console.log("Audio trigger failed:", err));
    }
  };

  // Turn Camera QR Scanner On
  const startCameraScan = () => {
    setCameraActive(true);
    setAbsensiResponse(null);
    setTimeout(() => {
      try {
        const qrScanner = new Html5Qrcode("portal-camera-viewfinder");
        scannerRef.current = qrScanner;
        qrScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // QR Scanned Successfully!
            handleProcessQrCodeToken(decodedText);
            stopCameraScan();
          },
          () => {} // silent failure of scanning frame
        ).catch(() => {
          alert("Gagal mengakses kamera belakang. Gunakan simulasi scan di bawah!");
          setCameraActive(false);
        });
      } catch (err) {
        console.error("Camera scanner error:", err);
        setCameraActive(false);
      }
    }, 300);
  };

  // Turn Camera Off
  const stopCameraScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setCameraActive(false);
      }).catch(() => {
        setCameraActive(false);
      });
    } else {
      setCameraActive(false);
    }
  };

  // Process QR value
  const handleProcessQrCodeToken = (qrToken: string) => {
    // 1. Find Teacher
    const teacher = guruList.find((g) => g.qrCode === qrToken && g.statusAktif === "Aktif");
    if (!teacher) {
      playBeepSound();
      setAbsensiResponse({
        success: false,
        message: "Absensi gagal. QR Code Guru Tidak Valid atau Guru Nonaktif.",
      });
      return;
    }

    // 2. Validate Geolocation
    const geoReport = verifyLocation(
      userLat,
      userLng,
      pengaturan.latitudeSekolah,
      pengaturan.longitudeSekolah,
      pengaturan.radiusAbsensi
    );

    if (geoReport.status === "DITOLAK") {
      playBeepSound();
      setAbsensiResponse({
        success: false,
        message: `Absensi gagal. ${geoReport.message}`,
      });
      return;
    }

    // 3. Find Schedule matching simulated Day & Time
    const matchedSchedulesForDay = jadwalList.filter(
      (j) => j.idGuru === teacher.idGuru && j.hari === simHari
    );

    let activeSchedule = null;
    const [simH, simM] = simJam.split(":").map(Number);
    const simMinutes = simH * 60 + simM;

    for (let s of matchedSchedulesForDay) {
      const [startH, startM] = s.jamMulai.split(":").map(Number);
      const [endH, endM] = s.jamSelesai.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // Teachers are allowed to sign in from 45 mins before class starts up to the end of class
      if (simMinutes >= startMinutes - 45 && simMinutes <= endMinutes) {
        activeSchedule = s;
        break;
      }
    }

    if (!activeSchedule) {
      playBeepSound();
      setAbsensiResponse({
        success: false,
        message: `Absensi gagal. Tidak ditemukan jadwal mengajar aktif untuk ${teacher.namaGuru} pada hari ${simHari} pukul ${simJam}.`,
      });
      return;
    }

    // 4. Calculate Tardiness Status
    const [startH, startM] = activeSchedule.jamMulai.split(":").map(Number);
    const lateThresholdMinutes = startH * 60 + startM + pengaturan.toleransiTerlambat;
    const statusKehadiran = simMinutes > lateThresholdMinutes ? "Terlambat" : "Hadir";

    // 5. Submit to Parent virtual DB State
    const idAbsen = `ABS-${Math.floor(Math.random() * 90000 + 10000)}`;
    const userAgent = navigator.userAgent;

    const record: Absensi = {
      idAbsensi: idAbsen,
      tanggal: "2026-07-17", // Fixed simulated date
      hari: simHari,
      jamScan: `${simJam}:00`,
      timestamp: new Date().toISOString(),
      idGuru: teacher.idGuru,
      namaGuru: teacher.namaGuru,
      mataPelajaran: activeSchedule.mataPelajaran,
      kelas: activeSchedule.kelas,
      ruang: activeSchedule.ruang,
      jamPelajaran: `${activeSchedule.jamMulai} - ${activeSchedule.jamSelesai}`,
      status: statusKehadiran,
      latitude: userLat,
      longitude: userLng,
      akurasiGps: gpsAccuracy,
      lokasiAlamat: "Jl. Raya Bumiayu, Kec. Baureno, Kabupaten Bojonegoro, Jawa Timur 62192",
      jarakSekolah: geoReport.distance,
      device: "Samsung Galaxy S24 Ultra",
      browser: "Chrome Mobile",
      statusValidasiGps: "VALID",
    };

    const submitResult = onNewAbsensi(record);

    playBeepSound();
    if (submitResult.success) {
      // Trigger canvas confetti on success!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#10b981", "#fbbf24"],
      });

      setAbsensiResponse({
        success: true,
        message: submitResult.message,
        details: record,
      });
    } else {
      setAbsensiResponse({
        success: false,
        message: submitResult.message,
      });
    }
  };

  // Mock scan trigger
  const handleMockScanSubmit = () => {
    if (!selectedGuruMockScan) {
      alert("Pilih guru terlebih dahulu untuk mensimulasikan scan!");
      return;
    }
    const teacher = guruList.find((g) => g.idGuru === selectedGuruMockScan);
    if (teacher) {
      handleProcessQrCodeToken(teacher.qrCode);
    }
  };

  const geoReport = verifyLocation(
    userLat,
    userLng,
    pengaturan.latitudeSekolah,
    pengaturan.longitudeSekolah,
    pengaturan.radiusAbsensi
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Upper Welcome Header */}
      <div className="text-center space-y-2 py-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 shadow-xs">
          <QrCode className="h-7 w-7 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Portal Absensi Guru
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            MI ISLAMIYAH • Bumiayu, Baureno, Bojonegoro
          </p>
        </div>
      </div>

      {/* Main Scanning Card */}
      <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Absensi Scanner
            </h3>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            MANDIRI
          </span>
        </div>

        {/* Compact Status Indicator Badges (GPS & Waktu) */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-1.5 justify-center">
            <Compass className={`h-3.5 w-3.5 ${geoReport.isValid ? "text-emerald-500" : "text-rose-500"}`} />
            <span>GPS: {geoReport.status === "VALID" ? "Radius Sesuai" : "Luar Radius"} ({geoReport.distance}m)</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center border-l border-slate-200 dark:border-slate-700">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            <span>{simHari}, {simJam} WIB</span>
          </div>
        </div>

        {/* Camera viewport wrapper */}
        {cameraActive ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-1">
            <div id="portal-camera-viewfinder" className="h-64 w-full"></div>
            <button
              onClick={stopCameraScan}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-rose-700 cursor-pointer"
            >
              Matikan Kamera
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
            <Camera className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
            <h4 className="mt-3 text-xs font-bold text-slate-800 dark:text-white">Arahkan Kamera ke QR Code</h4>
            <p className="mt-1 max-w-xs text-[10px] text-slate-500 leading-relaxed">
              Scan kartu QR absensi fisik Anda untuk memvalidasi jam mengajar dan lokasi GPS.
            </p>
            <button
              onClick={startCameraScan}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Nyalakan Kamera Scanner</span>
            </button>
          </div>
        )}

        {/* MOCK SCAN SELECTOR FOR EASY TESTING */}
        <div className="border-t border-slate-150 pt-4 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Simulasi Sekali-Klik (Tanpa Kamera)</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Untuk kemudahan pengetesan, pilih nama guru terdaftar untuk mensimulasikan scan instan:
          </p>

          <div className="flex gap-2 text-xs">
            <select
              value={selectedGuruMockScan}
              onChange={(e) => setSelectedGuruMockScan(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
            >
              <option value="">-- Pilih Guru Untuk Absen --</option>
              {guruList.map((g) => (
                <option key={g.idGuru} value={g.idGuru}>
                  {g.namaGuru} ({g.mataPelajaran})
                </option>
              ))}
            </select>
            <button
              onClick={handleMockScanSubmit}
              className="rounded-lg bg-slate-800 px-4 py-2 font-bold text-white shadow-xs hover:bg-slate-750 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
            >
              Simulasikan Scan
            </button>
          </div>
        </div>
      </div>

      {/* ATTENDANCE VALIDATION RESULTS STATUS CARD */}
      {absensiResponse && (
        <div
          className={`rounded-2xl border p-5 shadow-sm animate-fade-in ${
            absensiResponse.success
              ? "border-emerald-100 bg-emerald-50/70 dark:border-emerald-900/10 dark:bg-emerald-950/10"
              : "border-rose-100 bg-rose-50/70 dark:border-rose-900/10 dark:bg-rose-950/10"
          }`}
        >
          <div className="flex items-start gap-3 text-xs">
            {absensiResponse.success ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4
                className={`font-extrabold ${
                  absensiResponse.success ? "text-emerald-900 dark:text-emerald-400" : "text-rose-900 dark:text-rose-400"
                }`}
              >
                {absensiResponse.success ? "ABSENSI BERHASIL!" : "ABSENSI GAGAL!"}
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                {absensiResponse.message}
              </p>

              {absensiResponse.success && absensiResponse.details && (
                <div className="mt-3 rounded-xl bg-white/70 p-3 font-mono text-[10px] space-y-1 text-slate-700 border border-emerald-150 dark:bg-slate-900/40 dark:border-emerald-900/20 dark:text-slate-400">
                  <p>Nama: <span className="font-bold text-slate-900 dark:text-white">{absensiResponse.details.namaGuru}</span></p>
                  <p>Mata Pelajaran: {absensiResponse.details.mataPelajaran}</p>
                  <p>Kelas: {absensiResponse.details.kelas} ({absensiResponse.details.ruang})</p>
                  <p>Waktu Scan: Hari {absensiResponse.details.hari}, Pukul {absensiResponse.details.jamScan}</p>
                  <p className="font-bold text-blue-600">Status Kehadiran: {absensiResponse.details.status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE SIMULATOR SETTINGS AT THE BOTTOM */}
      <div className="pt-6 border-t border-slate-150 dark:border-slate-800 text-center">
        <button
          type="button"
          onClick={() => setShowSimulator(!showSimulator)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-xs hover:text-blue-600 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors cursor-pointer"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{showSimulator ? "Sembunyikan Pengaturan Simulator" : "Tampilkan Pengaturan Simulator (GPS & Waktu)"}</span>
        </button>

        {showSimulator && (
          <div className="mt-5 text-left grid gap-5 md:grid-cols-2 animate-fade-in">
            {/* Geolocation Mock Settings */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Compass className="h-5 w-5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                  Setelan Lokasi GPS (Mocker)
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500">Pilih Radius Simulasi</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGpsMode("inside")}
                      className={`rounded-lg py-2 font-semibold cursor-pointer ${
                        gpsMode === "inside"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Di Dalam Sekolah
                    </button>
                    <button
                      onClick={() => setGpsMode("outside")}
                      className={`rounded-lg py-2 font-semibold cursor-pointer ${
                        gpsMode === "outside"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Luar Radius (120m)
                    </button>
                    <button
                      onClick={() => setGpsMode("far")}
                      className={`rounded-lg py-2 font-semibold cursor-pointer ${
                        gpsMode === "far"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Sangat Jauh (15km)
                    </button>
                    <button
                      onClick={() => {
                        setGpsMode("real");
                        handleFetchRealGps();
                      }}
                      className={`rounded-lg py-2 font-semibold cursor-pointer ${
                        gpsMode === "real"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Gunakan GPS Asli
                    </button>
                  </div>
                </div>

                {/* GPS Coordinates readout */}
                <div className="rounded-xl bg-slate-50 p-3 font-mono text-[10px] space-y-1 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <p>Lat: <span className="font-bold text-slate-900 dark:text-white">{userLat.toFixed(6)}</span></p>
                  <p>Lng: <span className="font-bold text-slate-900 dark:text-white">{userLng.toFixed(6)}</span></p>
                  <p>Akurasi: ±{gpsAccuracy} meter</p>
                  <p className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1 font-semibold">
                    Jarak ke Sekolah: <span className={geoReport.isValid ? "text-emerald-600" : "text-rose-500"}>{geoReport.distance} meter</span>
                  </p>
                  <p className={`font-bold uppercase text-[9px] ${geoReport.isValid ? "text-emerald-600" : "text-rose-500"}`}>
                    Status GPS: {geoReport.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Time & Schedule Simulator Settings */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                  Setelan Hari & Jam Absen
                </h3>
              </div>

              <div className="grid gap-3.5 text-xs sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-500">Hari Mengajar</label>
                  <select
                    value={simHari}
                    onChange={(e) => setSimHari(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat (Rekomendasi)</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-500">Jam Scan Absen</label>
                  <input
                    type="time"
                    value={simJam}
                    onChange={(e) => setSimJam(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                *TIPS: Atur jam mengajar sesuai dengan slot jadwal mengajar Guru yang ingin Anda simulasikan agar absensi lolos validasi jadwal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for chime sound effects */}
      <audio
        ref={audioBeepRef}
        src="https://assets.mixkit.co/active_storage/sfx/911/911-200.wav"
        preload="auto"
        className="hidden"
      ></audio>
    </div>
  );
}
