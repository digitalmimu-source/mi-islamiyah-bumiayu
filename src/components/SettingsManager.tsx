import { useState, FormEvent } from "react";
import { Settings, Save, MapPin, ShieldAlert, Clock, School } from "lucide-react";
import { Pengaturan } from "../types";

interface SettingsManagerProps {
  pengaturan: Pengaturan;
  onSaveSettings: (settings: Pengaturan) => void;
}

export default function SettingsManager({
  pengaturan,
  onSaveSettings,
}: SettingsManagerProps) {
  const [namaSekolah, setNamaSekolah] = useState(pengaturan.namaSekolah);
  const [logo, setLogo] = useState(pengaturan.logo);
  const [lat, setLat] = useState(pengaturan.latitudeSekolah);
  const [lng, setLng] = useState(pengaturan.longitudeSekolah);
  const [radius, setRadius] = useState(pengaturan.radiusAbsensi);
  const [jamMasuk, setJamMasuk] = useState(pengaturan.jamMasuk);
  const [jamPulang, setJamPulang] = useState(pengaturan.jamPulang);
  const [toleransi, setToleransi] = useState(pengaturan.toleransiTerlambat);
  const [titikLokasi, setTitikLokasi] = useState(pengaturan.titikLokasiSekolah);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      namaSekolah,
      logo,
      latitudeSekolah: Number(lat),
      longitudeSekolah: Number(lng),
      radiusAbsensi: Number(radius),
      jamMasuk,
      jamPulang,
      toleransiTerlambat: Number(toleransi),
      titikLokasiSekolah: titikLokasi,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Pengaturan Parameter Sekolah
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Konfigurasi koordinat GPS sekolah, radius toleransi absensi, jam masuk-pulang, dan info madrasah.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        {/* Left Col: General Config */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <School className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Informasi Madrasah & Logo
              </h3>
            </div>

            <div className="grid gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Nama Sekolah</label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">URL Logo Madrasah</label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Time & Attendance Tolerances */}
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Jam Operasional & Toleransi Kehadiran
              </h3>
            </div>

            <div className="grid gap-4 text-xs sm:grid-cols-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Jam Masuk (Pelajaran Mulai)</label>
                <input
                  type="time"
                  value={jamMasuk}
                  onChange={(e) => setJamMasuk(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Jam Pulang Mengajar</label>
                <input
                  type="time"
                  value={jamPulang}
                  onChange={(e) => setJamPulang(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Toleransi Terlambat (Menit)</label>
                <input
                  type="number"
                  value={toleransi}
                  onChange={(e) => setToleransi(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Geofencing Coordinates */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Geofencing Koordinat GPS
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Latitude Sekolah</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Longitude Sekolah</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Radius Batas Absensi (Meter)</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                >
                  <option value={50}>50 Meter</option>
                  <option value={100}>100 Meter (Rekomendasi)</option>
                  <option value={150}>150 Meter</option>
                  <option value={200}>200 Meter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Label Titik Lokasi</label>
                <textarea
                  value={titikLokasi}
                  onChange={(e) => setTitikLokasi(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/55 p-4 dark:border-blue-900/30 dark:bg-blue-950/20 text-xs">
            <div className="flex gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-bold text-blue-800 dark:text-blue-200">Bagaimana Cara Kerja GPS?</h4>
                <p className="mt-1 text-blue-700 dark:text-blue-300 leading-relaxed">
                  Rumus Haversine mengukur jarak lurus permukaan bumi dari HP guru ke titik koordinat di atas. 
                  Jika jarak melebihi batas {radius} meter, sistem Google Script secara otomatis akan <b>menolak</b> absensi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button bar */}
        <div className="md:col-span-3 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            *Pengaturan disimpan secara lokal di simulator dan siap di ekspor ke Google Spreadsheet.
          </p>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Pengaturan berhasil disimpan!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
