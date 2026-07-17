import { useState, useRef, FormEvent, ChangeEvent } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Upload,
  QrCode,
  X,
  User,
  Phone,
  Mail,
  Key,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { Guru } from "../types";

interface GuruManagerProps {
  guruList: Guru[];
  onAddGuru: (guru: Guru) => void;
  onEditGuru: (guru: Guru) => void;
  onDeleteGuru: (idGuru: string) => void;
  onImportGuru: (imported: Guru[]) => void;
}

export default function GuruManager({
  guruList,
  onAddGuru,
  onEditGuru,
  onDeleteGuru,
  onImportGuru,
}: GuruManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentGuru, setCurrentGuru] = useState<Guru | null>(null);
  const [selectedGuruForQr, setSelectedGuruForQr] = useState<Guru | null>(null);

  // Form states
  const [formId, setFormId] = useState("");
  const [formNip, setFormNip] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formMapel, setFormMapel] = useState("");
  const [formJabatan, setFormJabatan] = useState("");
  const [formHp, setFormHp] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"Aktif" | "Nonaktif">("Aktif");
  const [formFoto, setFormFoto] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open modal for Add
  const openAddModal = () => {
    setCurrentGuru(null);
    setFormId(`G-${String(guruList.length + 1).padStart(3, "0")}`);
    setFormNip("");
    setFormNama("");
    setFormMapel("");
    setFormJabatan("");
    setFormHp("");
    setFormEmail("");
    setFormStatus("Aktif");
    setFormFoto("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const openEditModal = (guru: Guru) => {
    setCurrentGuru(guru);
    setFormId(guru.idGuru);
    setFormNip(guru.nip);
    setFormNama(guru.namaGuru);
    setFormMapel(guru.mataPelajaran);
    setFormJabatan(guru.jabatan);
    setFormHp(guru.nomorHp);
    setFormEmail(guru.email);
    setFormStatus(guru.statusAktif);
    setFormFoto(guru.foto);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formNama || !formNip) {
      alert("NIP dan Nama Guru wajib diisi!");
      return;
    }

    // Generate unique QR code token if adding new
    const secureToken = currentGuru
      ? currentGuru.qrCode
      : `MIG-${formId}-${formNama.replace(/\s+/g, "").toUpperCase().slice(0, 5)}-SECURE${Math.floor(Math.random() * 90 + 10)}`;

    const newGuruObj: Guru = {
      idGuru: formId,
      nip: formNip,
      namaGuru: formNama,
      mataPelajaran: formMapel,
      jabatan: formJabatan,
      nomorHp: formHp,
      email: formEmail,
      statusAktif: formStatus,
      qrCode: secureToken,
      foto: formFoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
    };

    if (currentGuru) {
      onEditGuru(newGuruObj);
    } else {
      onAddGuru(newGuruObj);
    }
    setIsModalOpen(false);
  };

  // Open QR Code Viewer
  const viewQrCard = (guru: Guru) => {
    setSelectedGuruForQr(guru);
    setIsQrModalOpen(true);
  };

  // Print QR Card
  const handlePrintQr = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID Guru", "NIP", "Nama Guru", "Mata Pelajaran", "Jabatan", "Nomor HP", "Email", "Status Aktif", "QR Code Token"];
    const rows = guruList.map((g) => [
      g.idGuru,
      g.nip,
      g.namaGuru,
      g.mataPelajaran,
      g.jabatan,
      g.nomorHp,
      g.email,
      g.statusAktif,
      g.qrCode,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Data_Guru_MI_Islamiyah.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV Trigger
  const handleImportCSV = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      
      const imported: Guru[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols.length >= 3) {
          imported.push({
            idGuru: cols[0] || `G-IMP-${Math.floor(Math.random() * 900 + 100)}`,
            nip: cols[1] || "-",
            namaGuru: cols[2] || "Tanpa Nama",
            mataPelajaran: cols[3] || "Tematik",
            jabatan: cols[4] || "Guru Kelas",
            nomorHp: cols[5] || "-",
            email: cols[6] || "-",
            statusAktif: (cols[7] as "Aktif" | "Nonaktif") || "Aktif",
            qrCode: cols[8] || `MIG-${cols[0]}-SECURE`,
            foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
          });
        }
      }

      if (imported.length > 0) {
        onImportGuru(imported);
        alert(`Berhasil mengimpor ${imported.length} data Guru!`);
      } else {
        alert("Gagal mengimpor. Format file CSV tidak sesuai.");
      }
    };
    reader.readAsText(file);
  };

  // Filtered List
  const filteredGuru = guruList.filter(
    (g) =>
      g.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.includes(searchQuery) ||
      g.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upper header action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Data Manajemen Guru
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mengatur data guru, mengimpor CSV, dan mengunduh Kartu QR Code Absen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Add Teacher Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Guru Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
          <Search className="h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari guru berdasarkan Nama, NIP, atau Mata Pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden dark:text-slate-200"
          />
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-6 py-4">Foto / ID</th>
                <th className="px-6 py-4">Nama Guru</th>
                <th className="px-6 py-4">NIP / Jabatan</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Nomor HP</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">QR Code</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              {filteredGuru.length > 0 ? (
                filteredGuru.map((g) => (
                  <tr key={g.idGuru} className="hover:bg-slate-50/55 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={g.foto}
                          alt={g.namaGuru}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                          onError={(e) => {
                            // fallback avatar
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120";
                          }}
                        />
                        <span className="font-mono text-[10px] font-bold text-blue-600">
                          {g.idGuru}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {g.namaGuru}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{g.nip || "-"}</p>
                      <p className="text-[10px] text-slate-400">{g.jabatan}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {g.mataPelajaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{g.nomorHp || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        g.statusAktif === "Aktif"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                      }`}>
                        {g.statusAktif}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => viewQrCard(g)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Lihat QR</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(g)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          title="Edit Guru"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus guru ${g.namaGuru}?`)) {
                              onDeleteGuru(g.idGuru);
                            }
                          }}
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          title="Hapus Guru"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data guru yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT GURU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {currentGuru ? "Ubah Data Guru" : "Tambah Guru Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">ID Guru</label>
                  <input
                    type="text"
                    disabled
                    value={formId}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">NIP</label>
                  <input
                    type="text"
                    placeholder="Contoh: 198503152014032001"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Nama Lengkap Guru (dengan Gelar)</label>
                <input
                  type="text"
                  placeholder="Contoh: Siti Aminah, S.Ag."
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    placeholder="Contoh: Aqidah Akhlak"
                    value={formMapel}
                    onChange={(e) => setFormMapel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Jabatan / Peran</label>
                  <input
                    type="text"
                    placeholder="Contoh: Waka Kurikulum"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Nomor HP</label>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={formHp}
                    onChange={(e) => setFormHp(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Email</label>
                  <input
                    type="email"
                    placeholder="Contoh: siti@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">URL Foto Profile (Opsional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formFoto}
                    onChange={(e) => setFormFoto(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Status Keaktifan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Aktif" | "Nonaktif")}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE QR CODE CARD */}
      {isQrModalOpen && selectedGuruForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:relative print:inset-auto print:bg-white print:p-0 print:backdrop-blur-none">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 print:shadow-none print:dark:bg-white print:p-0 print:w-full">
            
            {/* Close button - hidden when printing */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 print:hidden"
            >
              <X className="h-4 w-4" />
            </button>

            {/* QR Card Frame */}
            <div id="print-section" className="flex flex-col items-center text-center">
              <span className="text-[9px] font-bold tracking-widest text-blue-600 uppercase">
                KARTU ABSENSI GURU
              </span>
              <h4 className="mt-1 text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 print:text-slate-900">
                MI ISLAMIYAH BUMIAYU Bojonegoro
              </h4>
              <p className="text-[9px] text-slate-400">Bumiayu, Baureno, Bojonegoro, Jawa Timur</p>

              {/* QR Image */}
              <div className="mt-5 rounded-2xl border-4 border-blue-600/10 bg-slate-50 p-4 dark:bg-slate-800 print:bg-white print:border-blue-600">
                <img
                  src={`https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(selectedGuruForQr.qrCode)}`}
                  alt={`QR Code ${selectedGuruForQr.namaGuru}`}
                  className="h-44 w-44 object-contain"
                />
              </div>

              {/* User Details */}
              <div className="mt-5 space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-slate-900">
                  {selectedGuruForQr.namaGuru}
                </h3>
                <p className="font-mono text-[10px] text-slate-500">
                  ID: <span className="font-bold text-blue-600">{selectedGuruForQr.idGuru}</span> | NIP: {selectedGuruForQr.nip || "-"}
                </p>
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 print:bg-slate-100 print:text-slate-700">
                  Mapel: {selectedGuruForQr.mataPelajaran}
                </span>
              </div>

              {/* Security Hash / Verification */}
              <div className="mt-6 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[8px] font-mono text-slate-400 dark:bg-slate-800 print:bg-slate-50">
                <Key className="h-3 w-3" />
                <span>TOKEN: {selectedGuruForQr.qrCode.slice(-12)}</span>
              </div>
            </div>

            {/* Print Action Bar - hidden when printing */}
            <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 print:hidden">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintQr}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak / Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
