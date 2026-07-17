import { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Search,
  MapPin,
  ExternalLink,
  Filter,
  Calendar,
  Layers,
  Compass,
} from "lucide-react";
import { Absensi, Pengaturan } from "../types";

interface RekapAbsensiProps {
  absensiList: Absensi[];
  pengaturan: Pengaturan;
}

export default function RekapAbsensi({ absensiList, pengaturan }: RekapAbsensiProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [selectedRecordForMap, setSelectedRecordForMap] = useState<Absensi | null>(
    absensiList[0] || null
  );

  // Filters for other criteria
  const [filterHari, setFilterHari] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID Absensi", "Tanggal", "Hari", "Jam Scan", "ID Guru", "Nama Guru", 
      "Mata Pelajaran", "Kelas", "Ruang", "Jam Pelajaran", "Status", 
      "Latitude", "Longitude", "Akurasi GPS", "Jarak dari Sekolah (m)", 
      "Device", "Browser", "Status Validasi GPS"
    ];

    const rows = absensiList.map((a) => [
      a.idAbsensi,
      a.tanggal,
      a.hari,
      a.jamScan,
      a.idGuru,
      a.namaGuru,
      a.mataPelajaran,
      a.kelas,
      a.ruang,
      a.jamPelajaran,
      a.status,
      a.latitude,
      a.longitude,
      a.akurasiGps,
      a.jarakSekolah,
      a.device,
      a.browser,
      a.statusValidasiGps,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Absensi_Guru_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Card
  const handlePrint = () => {
    window.print();
  };

  // Filtered attendance list
  const filteredList = absensiList.filter((a) => {
    const matchSearch =
      a.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.idGuru.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = filterStatus === "" || a.status === filterStatus;
    const matchKelas = filterKelas === "" || a.kelas === filterKelas;
    const matchHari = filterHari === "" || a.hari === filterHari;
    
    let matchBulan = true;
    if (filterBulan !== "") {
      const recordMonth = new Date(a.tanggal).getMonth() + 1; // 1-indexed
      matchBulan = recordMonth === parseInt(filterBulan);
    }

    return matchSearch && matchStatus && matchKelas && matchHari && matchBulan;
  });

  // Calculate Map Coordinate projection for our radar visualizer
  const renderRadarSimulator = () => {
    if (!selectedRecordForMap) return null;

    // School coordinates (Center)
    const sLat = pengaturan.latitudeSekolah;
    const sLng = pengaturan.longitudeSekolah;
    const allowedRadius = pengaturan.radiusAbsensi;

    // Teacher Coordinates
    const tLat = selectedRecordForMap.latitude;
    const tLng = selectedRecordForMap.longitude;
    const distance = selectedRecordForMap.jarakSekolah;

    // Scale factors to fit in a 200x200 canvas
    // 100 meters = 60 pixels
    const pxPerMeter = 60 / allowedRadius;

    // Approximated offsets (y is lat, x is lng)
    const latDiff = tLat - sLat;
    const lngDiff = tLng - sLng;

    // Convert differences into approximated meters (roughly 111,000 meters per degree)
    const yMeters = latDiff * 111000;
    const xMeters = lngDiff * 111000 * Math.cos((sLat * Math.PI) / 180);

    // Map to canvas offsets
    const cX = 100 + xMeters * pxPerMeter;
    const cY = 100 - yMeters * pxPerMeter; // Invert y for screen space

    // Keep within bounds
    const markerX = Math.max(10, Math.min(190, cX));
    const markerY = Math.max(10, Math.min(190, cY));

    const isInside = distance <= allowedRadius;

    return (
      <div className="relative flex flex-col items-center rounded-2xl border border-slate-150 bg-slate-950 p-4 shadow-inner text-white">
        <span className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
          <Compass className="h-3 w-3 animate-pulse" />
          Radar Geofencing GPS
        </span>

        {/* The Radar Circle Canvas representation */}
        <div className="relative mt-4 flex h-48 w-48 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 shadow-xl">
          {/* Target concentric ripples */}
          <div className="absolute h-36 w-36 rounded-full border border-slate-800/60"></div>
          <div className="absolute h-24 w-24 rounded-full border border-slate-800/40"></div>
          
          {/* Geofence Boundary Circle (ALLOWED RADIUS) */}
          <div
            className={`absolute rounded-full border-2 border-dashed ${
              isInside ? "border-blue-500/60 bg-blue-500/5 animate-pulse" : "border-rose-500/40 bg-rose-500/5"
            }`}
            style={{ width: "120px", height: "120px" }}
          ></div>

          {/* School Center Marker */}
          <div className="absolute z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 border border-white shadow-md">
            <span className="block h-1.5 w-1.5 rounded-full bg-white"></span>
          </div>
          <span className="absolute top-[41%] text-[8px] font-bold text-blue-400 uppercase tracking-widest">
            MI ISLAMIYAH
          </span>

          {/* Teacher Scanned Position Marker */}
          <div
            className={`absolute z-20 flex h-4 w-4 -translate-x-2 -translate-y-2 items-center justify-center rounded-full border-2 border-white shadow-lg ${
              isInside ? "bg-emerald-500" : "bg-rose-500 animate-ping"
            }`}
            style={{ left: `${markerX}px`, top: `${markerY}px` }}
            title={`Lokasi Guru (${distance}m)`}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-white"></span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex w-full justify-between border-t border-slate-800 pt-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Sekolah</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>Scan Valid</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span>Scan Ditolak</span>
          </div>
        </div>

        <div className="mt-3.5 text-center text-xs">
          <h4 className="font-bold text-slate-100">{selectedRecordForMap.namaGuru}</h4>
          <p className="text-[10px] text-slate-400 mt-1">
            Jarak: <span className={`font-mono font-bold ${isInside ? "text-blue-400" : "text-rose-400"}`}>{distance} Meter</span> | Akurasi: ±{selectedRecordForMap.akurasiGps}m
          </p>
          <a
            href={`https://www.google.com/maps?q=${tLat},${tLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:underline"
          >
            <span>Lihat di Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Rekapitulasi Absensi Guru
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Riwayat log absensi guru yang dilengkapi dengan verifikasi akurasi GPS dan jarak dari sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak Rekap</span>
          </button>

          {/* Export Spreadsheet */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Ekspor ke Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid with Filtered List and Radar Projection */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Sidebar Radar Map projection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">
              Geofencing Visualizer
            </h3>
            {selectedRecordForMap ? (
              renderRadarSimulator()
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">
                Pilih baris absensi untuk melihat radar koordinat GPS guru.
              </p>
            )}
          </div>
        </div>

        {/* Tabular Lists Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters Card */}
          <div className="grid gap-4 rounded-2xl border border-slate-150 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 md:grid-cols-5">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 sm:border-0 sm:pb-0">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Log:</span>
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
            >
              <option value="">Semua Status</option>
              <option value="Hadir">Hadir Tepat Waktu</option>
              <option value="Terlambat">Terlambat</option>
            </select>

            {/* Filter Hari */}
            <select
              value={filterHari}
              onChange={(e) => setFilterHari(e.target.value)}
              className="rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
            >
              <option value="">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
            </select>

            {/* Filter Bulan */}
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
            >
              <option value="">Semua Bulan</option>
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Filter Kelas */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
            >
              <option value="">Semua Kelas</option>
              <option value="VI A">Kelas VI A</option>
              <option value="VI B">Kelas VI B</option>
              <option value="V A">Kelas V A</option>
              <option value="V B">Kelas V B</option>
            </select>
          </div>

          {/* Interactive Search & List Table */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
              <Search className="h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari absensi berdasarkan Nama Guru, Mata Pelajaran, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden dark:text-slate-200"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                    <th className="px-5 py-3">Tanggal / Waktu</th>
                    <th className="px-5 py-3">Guru</th>
                    <th className="px-5 py-3">Mapel / Kelas</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3">Validasi GPS & Jarak</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                  {filteredList.length > 0 ? (
                    filteredList.map((a) => (
                      <tr
                        key={a.idAbsensi}
                        onClick={() => setSelectedRecordForMap(a)}
                        className={`cursor-pointer transition-colors ${
                          selectedRecordForMap?.idAbsensi === a.idAbsensi
                            ? "bg-blue-500/10 dark:bg-blue-500/5 font-medium"
                            : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold">{a.tanggal}</p>
                          <p className="text-[10px] text-slate-400">
                            Hari {a.hari} • Pukul {a.jamScan}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {a.namaGuru}
                          </p>
                          <p className="font-mono text-[9px] text-slate-400">ID: {a.idGuru}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {a.mataPelajaran}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Kelas {a.kelas} ({a.ruang})
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            a.status === "Hadir"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${
                              a.statusValidasiGps === "VALID" ? "bg-emerald-500" : "bg-rose-500"
                            }`}></span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {a.statusValidasiGps}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Jarak: <span className="font-bold">{a.jarakSekolah}m</span> | GPS Acc: ±{a.akurasiGps}m
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <a
                            href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                            onClick={(e) => e.stopPropagation()} // Prevent row selection trigger
                          >
                            <MapPin className="h-3 w-3" />
                            <span>Buka Maps</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ditemukan rekap absensi yang cocok dengan filter Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
