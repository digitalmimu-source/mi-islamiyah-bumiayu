import { useState, FormEvent } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  Filter,
  X,
  BookOpen,
} from "lucide-react";
import { Jadwal, Guru } from "../types";

interface JadwalManagerProps {
  jadwalList: Jadwal[];
  guruList: Guru[];
  onAddJadwal: (jadwal: Jadwal) => void;
  onEditJadwal: (jadwal: Jadwal) => void;
  onDeleteJadwal: (idJadwal: string) => void;
}

export default function JadwalManager({
  jadwalList,
  guruList,
  onAddJadwal,
  onEditJadwal,
  onDeleteJadwal,
}: JadwalManagerProps) {
  const [filterHari, setFilterHari] = useState("");
  const [filterGuru, setFilterGuru] = useState("");
  const [filterKelas, setFilterKelas] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJadwal, setCurrentJadwal] = useState<Jadwal | null>(null);

  // Form states
  const [formId, setFormId] = useState("");
  const [formHari, setFormHari] = useState("Senin");
  const [formJamMulai, setFormJamMulai] = useState("07:00");
  const [formJamSelesai, setFormJamSelesai] = useState("08:30");
  const [formMapel, setFormMapel] = useState("");
  const [formKelas, setFormKelas] = useState("");
  const [formRuang, setFormRuang] = useState("");
  const [formIdGuru, setFormIdGuru] = useState("");

  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const kelasOptions = ["I A", "I B", "II A", "II B", "III A", "III B", "IV A", "IV B", "V A", "V B", "VI A", "VI B"];

  const openAddModal = () => {
    setCurrentJadwal(null);
    setFormId(`J-${String(jadwalList.length + 1).padStart(3, "0")}`);
    setFormHari("Senin");
    setFormJamMulai("07:00");
    setFormJamSelesai("08:30");
    setFormMapel("");
    setFormKelas("VI A");
    setFormRuang("Ruang Kelas 6");
    setFormIdGuru(guruList[0]?.idGuru || "");
    setIsModalOpen(true);
  };

  const openEditModal = (j: Jadwal) => {
    setCurrentJadwal(j);
    setFormId(j.idJadwal);
    setFormHari(j.hari);
    setFormJamMulai(j.jamMulai);
    setFormJamSelesai(j.jamSelesai);
    setFormMapel(j.mataPelajaran);
    setFormKelas(j.kelas);
    setFormRuang(j.ruang);
    setFormIdGuru(j.idGuru);
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formMapel || !formKelas || !formIdGuru) {
      alert("Mata Pelajaran, Kelas, dan Guru pengajar wajib dipilih/diisi!");
      return;
    }

    const newJadwal: Jadwal = {
      idJadwal: formId,
      hari: formHari,
      jamMulai: formJamMulai,
      jamSelesai: formJamSelesai,
      mataPelajaran: formMapel,
      kelas: formKelas,
      ruang: formRuang || `Ruang Kelas ${formKelas}`,
      idGuru: formIdGuru,
    };

    if (currentJadwal) {
      onEditJadwal(newJadwal);
    } else {
      onAddJadwal(newJadwal);
    }
    setIsModalOpen(false);
  };

  // Filtered schedule
  const filteredJadwal = jadwalList.filter((j) => {
    const matchHari = filterHari === "" || j.hari === filterHari;
    const matchGuru = filterGuru === "" || j.idGuru === filterGuru;
    const matchKelas = filterKelas === "" || j.kelas === filterKelas;
    return matchHari && matchGuru && matchKelas;
  });

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Jadwal Mengajar Guru
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mengonfigurasi dan mencocokkan jadwal mengajar harian guru MI Islamiyah Bumiayu.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Jadwal Pelajaran</span>
        </button>
      </div>

      {/* Advanced Filter Row */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-150 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Filter Jadwal:</span>
        </div>

        {/* Filter Hari */}
        <select
          value={filterHari}
          onChange={(e) => setFilterHari(e.target.value)}
          className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
        >
          <option value="">Semua Hari</option>
          {daysOfWeek.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Filter Guru */}
        <select
          value={filterGuru}
          onChange={(e) => setFilterGuru(e.target.value)}
          className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
        >
          <option value="">Semua Guru Pengajar</option>
          {guruList.map((g) => (
            <option key={g.idGuru} value={g.idGuru}>
              {g.namaGuru}
            </option>
          ))}
        </select>

        {/* Filter Kelas */}
        <select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
          className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-300"
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((k) => (
            <option key={k} value={k}>
              Kelas {k}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {(filterHari !== "" || filterGuru !== "" || filterKelas !== "") && (
          <button
            onClick={() => {
              setFilterHari("");
              setFilterGuru("");
              setFilterKelas("");
            }}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Grid of Schedules by Day */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {daysOfWeek.map((day) => {
          const schedulesForDay = filteredJadwal.filter((j) => j.hari === day);
          if (filterHari !== "" && day !== filterHari) return null;

          return (
            <div key={day} className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Hari {day}
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                  {schedulesForDay.length} Jadwal
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {schedulesForDay.length > 0 ? (
                  schedulesForDay.map((j) => {
                    const guru = guruList.find((g) => g.idGuru === j.idGuru);
                    return (
                      <div
                        key={j.idJadwal}
                        className="group relative rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/20 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                              Kelas {j.kelas} • {j.ruang}
                            </span>
                            <h4 className="mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                              {j.mataPelajaran}
                            </h4>
                          </div>

                          {/* Actions Panel */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(j)}
                              className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
                                  onDeleteJadwal(j.idJadwal);
                                }
                              }}
                              className="rounded-md p-1 text-rose-400 hover:bg-rose-100/40 hover:text-rose-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Metas */}
                        <div className="mt-3.5 space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                              {j.jamMulai} - {j.jamSelesai}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                              {guru ? guru.namaGuru : "Guru tidak ditemukan"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada jadwal mengajar.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT JADWAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {currentJadwal ? "Edit Jadwal Mengajar" : "Tambah Jadwal Baru"}
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
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">ID Jadwal</label>
                  <input
                    type="text"
                    disabled
                    value={formId}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Hari Mengajar</label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Jam Mulai</label>
                  <input
                    type="time"
                    value={formJamMulai}
                    onChange={(e) => setFormJamMulai(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Jam Selesai</label>
                  <input
                    type="time"
                    value={formJamSelesai}
                    onChange={(e) => setFormJamSelesai(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Mata Pelajaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Al-Qur'an Hadits"
                  value={formMapel}
                  onChange={(e) => setFormMapel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Pilih Kelas</label>
                  <select
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  >
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400">Ruangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Kelas 6"
                    value={formRuang}
                    onChange={(e) => setFormRuang(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400">Guru Pengajar</label>
                <select
                  value={formIdGuru}
                  onChange={(e) => setFormIdGuru(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Pilih Guru --</option>
                  {guruList.map((g) => (
                    <option key={g.idGuru} value={g.idGuru}>
                      {g.namaGuru} ({g.mataPelajaran})
                    </option>
                  ))}
                </select>
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
