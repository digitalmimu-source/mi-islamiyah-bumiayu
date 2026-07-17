import { Guru, Jadwal, Absensi, Admin, Pengaturan, AktivitasLog } from "../types";

export const defaultPengaturan: Pengaturan = {
  namaSekolah: "MI ISLAMIYAH Bumiayu Baureno Bojonegoro",
  logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
  latitudeSekolah: -7.118745,
  longitudeSekolah: 112.126379,
  radiusAbsensi: 100, // 100 Meter
  jamMasuk: "07:00",
  jamPulang: "13:30",
  toleransiTerlambat: 15, // 15 menit
  titikLokasiSekolah: "Gedung Utama MI Islamiyah Bumiayu, Baureno, Bojonegoro",
};

export const defaultAdmins: Admin[] = [
  {
    username: "admin",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // SHA-256 for "admin123"
    nama: "H. Achmad Syafi'i, S.Pd.I.",
  },
  {
    username: "operator",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // "admin123"
    nama: "Fathur Rohman, S.Kom.",
  }
];

export const defaultGuruList: Guru[] = [
  {
    idGuru: "G-001",
    nip: "198204122009121003",
    namaGuru: "Drs. H. Masykur, M.Pd.",
    mataPelajaran: "Al-Qur'an Hadits",
    jabatan: "Kepala Madrasah / Guru Madya",
    nomorHp: "081234567890",
    email: "masykur.miislamiyah@gmail.com",
    statusAktif: "Aktif",
    qrCode: "MIG-001-MASYKUR-SECURE77",
    foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-002",
    nip: "198503152014032001",
    namaGuru: "Siti Aminah, S.Ag.",
    mataPelajaran: "Aqidah Akhlak",
    jabatan: "Waka Kurikulum / Guru Muda",
    nomorHp: "081398765432",
    email: "siti.aminah@gmail.com",
    statusAktif: "Aktif",
    qrCode: "MIG-002-SITI-SECURE92",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-003",
    nip: "199011242018011002",
    namaGuru: "Ahmad Fauzi, S.Pd.",
    mataPelajaran: "Matematika",
    jabatan: "Waka Kesiswaan / Guru Pertama",
    nomorHp: "085611223344",
    email: "ahmadfauzi.bojonegoro@gmail.com",
    statusAktif: "Aktif",
    qrCode: "MIG-003-FAUZI-SECURE12",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-004",
    nip: "198808052015042002",
    namaGuru: "Lailatul Qodriyah, S.Pd.I.",
    mataPelajaran: "Bahasa Arab",
    jabatan: "Guru Kelas IV",
    nomorHp: "081333444555",
    email: "lailatul.qodriyah@outlook.com",
    statusAktif: "Aktif",
    qrCode: "MIG-004-LAILA-SECURE55",
    foto: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-005",
    nip: "199407122020101001",
    namaGuru: "Muhammad Yusuf, S.Pd.",
    mataPelajaran: "Fiqih",
    jabatan: "Pembina Pramuka / Guru",
    nomorHp: "082199887766",
    email: "yusuf.mi@gmail.com",
    statusAktif: "Aktif",
    qrCode: "MIG-005-YUSUF-SECURE84",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-006",
    nip: "199205162021122002",
    namaGuru: "Rina Wijayanti, S.Pd.",
    mataPelajaran: "Sejarah Kebudayaan Islam (SKI)",
    jabatan: "Guru Kelas III",
    nomorHp: "081255566677",
    email: "rinawijaya@yahoo.co.id",
    statusAktif: "Aktif",
    qrCode: "MIG-006-RINA-SECURE31",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-007",
    nip: "199510012023011005",
    namaGuru: "Zainal Abidin, S.Pd.",
    mataPelajaran: "Bahasa Indonesia",
    jabatan: "Guru Kelas V",
    nomorHp: "085799001122",
    email: "zainal.abidin@gmail.com",
    statusAktif: "Aktif",
    qrCode: "MIG-007-ZAINAL-SECURE49",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  {
    idGuru: "G-008",
    nip: "199612082024032004",
    namaGuru: "Fatmawati, S.Pd.",
    mataPelajaran: "IPA Terpadu",
    jabatan: "Guru Kelas VI",
    nomorHp: "087855443322",
    email: "fatmawati.mi@gmail.com",
    statusAktif: "Aktif",
    qrCode: "MIG-008-FATMA-SECURE62",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
];

export const defaultJadwalList: Jadwal[] = [
  // Senin
  { idJadwal: "J-001", hari: "Senin", jamMulai: "07:00", jamSelesai: "08:30", mataPelajaran: "Al-Qur'an Hadits", kelas: "VI A", ruang: "Ruang Kelas 6", idGuru: "G-001" },
  { idJadwal: "J-002", hari: "Senin", jamMulai: "08:30", jamSelesai: "10:00", mataPelajaran: "Aqidah Akhlak", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-002" },
  { idJadwal: "J-003", hari: "Senin", jamMulai: "10:15", jamSelesai: "11:45", mataPelajaran: "Matematika", kelas: "V A", ruang: "Ruang Kelas 4", idGuru: "G-003" },
  
  // Selasa
  { idJadwal: "J-004", hari: "Selasa", jamMulai: "07:00", jamSelesai: "08:30", mataPelajaran: "Bahasa Arab", kelas: "VI A", ruang: "Ruang Kelas 6", idGuru: "G-004" },
  { idJadwal: "J-005", hari: "Selasa", jamMulai: "08:30", jamSelesai: "10:00", mataPelajaran: "Fiqih", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-005" },
  { idJadwal: "J-006", hari: "Selasa", jamMulai: "10:15", jamSelesai: "11:45", mataPelajaran: "Sejarah Kebudayaan Islam (SKI)", kelas: "V A", ruang: "Ruang Kelas 4", idGuru: "G-006" },

  // Rabu
  { idJadwal: "J-007", hari: "Rabu", jamMulai: "07:00", jamSelesai: "08:30", mataPelajaran: "Al-Qur'an Hadits", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-001" },
  { idJadwal: "J-008", hari: "Rabu", jamMulai: "08:30", jamSelesai: "10:00", mataPelajaran: "Aqidah Akhlak", kelas: "VI A", ruang: "Ruang Kelas 6", idGuru: "G-002" },
  { idJadwal: "J-009", hari: "Rabu", jamMulai: "10:15", jamSelesai: "11:45", mataPelajaran: "Bahasa Indonesia", kelas: "V B", ruang: "Ruang Kelas 3", idGuru: "G-007" },

  // Kamis
  { idJadwal: "J-010", hari: "Kamis", jamMulai: "07:00", jamSelesai: "08:30", mataPelajaran: "Matematika", kelas: "VI A", ruang: "Ruang Kelas 6", idGuru: "G-003" },
  { idJadwal: "J-011", hari: "Kamis", jamMulai: "08:30", jamSelesai: "10:00", mataPelajaran: "Bahasa Arab", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-004" },
  { idJadwal: "J-012", hari: "Kamis", jamMulai: "10:15", jamSelesai: "11:45", mataPelajaran: "IPA Terpadu", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-008" },

  // Jumat
  { idJadwal: "J-013", hari: "Jumat", jamMulai: "07:00", jamSelesai: "08:30", mataPelajaran: "Fiqih", kelas: "VI A", ruang: "Ruang Kelas 6", idGuru: "G-005" },
  { idJadwal: "J-014", hari: "Jumat", jamMulai: "08:30", jamSelesai: "10:00", mataPelajaran: "Sejarah Kebudayaan Islam (SKI)", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-006" },

  // Sabtu
  { idJadwal: "J-015", hari: "Sabtu", jamMulai: "07:00", jamSelesai: "08:30", mataPelajaran: "Bahasa Indonesia", kelas: "VI B", ruang: "Ruang Kelas 5", idGuru: "G-007" },
  { idJadwal: "J-016", hari: "Sabtu", jamMulai: "08:30", jamSelesai: "10:00", mataPelajaran: "IPA Terpadu", kelas: "VI A", ruang: "Ruang Kelas 6", idGuru: "G-008" },
];

export const generateMockAbsensiList = (): Absensi[] => {
  const list: Absensi[] = [];
  const daysOfActivity = [
    { offset: 0, date: "2026-07-17", dayName: "Jumat" },
    { offset: 1, date: "2026-07-16", dayName: "Kamis" },
    { offset: 2, date: "2026-07-15", dayName: "Rabu" },
    { offset: 3, date: "2026-07-14", dayName: "Selasa" },
    { offset: 4, date: "2026-07-13", dayName: "Senin" },
    { offset: 6, date: "2026-07-11", dayName: "Sabtu" },
  ];

  let idCount = 1;

  daysOfActivity.forEach(({ date, dayName }) => {
    // Filter schedules for this day
    const schedulesForDay = defaultJadwalList.filter(j => j.hari === dayName);

    schedulesForDay.forEach((j, index) => {
      const guru = defaultGuruList.find(g => g.idGuru === j.idGuru);
      if (!guru) return;

      // Simulate some teachers missing, some arriving on time, some late
      let status: "Hadir" | "Terlambat" | "Belum Absen" = "Hadir";
      let jamScan = j.jamMulai; // Exact start time

      const randomVal = (idCount * 7) % 10;
      if (randomVal < 2) {
        status = "Terlambat";
        // 18 minutes late
        const [hours, mins] = j.jamMulai.split(":").map(Number);
        const newMins = mins + 18;
        const scanH = String(hours + Math.floor(newMins / 60)).padStart(2, "0");
        const scanM = String(newMins % 60).padStart(2, "0");
        jamScan = `${scanH}:${scanM}:${String((idCount * 13) % 60).padStart(2, "0")}`;
      } else if (randomVal === 9) {
        // Did not log in (Belum Absen)
        status = "Belum Absen";
      } else {
        // Present, 5 minutes early
        const [hours, mins] = j.jamMulai.split(":").map(Number);
        let newMins = mins - 5;
        let newHours = hours;
        if (newMins < 0) {
          newMins += 60;
          newHours -= 1;
        }
        jamScan = `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}:${String((idCount * 19) % 60).padStart(2, "0")}`;
      }

      if (status !== "Belum Absen") {
        // Simulate a minor GPS offset within radius
        const latOffset = ((idCount * 3) % 7 - 3) * 0.0001; // very small drift
        const lngOffset = ((idCount * 5) % 7 - 3) * 0.0001;
        const lat = defaultPengaturan.latitudeSekolah + latOffset;
        const lng = defaultPengaturan.longitudeSekolah + lngOffset;
        
        // simple simulated distance (10 - 45 meters)
        const distance = 15 + ((idCount * 11) % 40);

        list.push({
          idAbsensi: `ABS-${String(idCount).padStart(5, "0")}`,
          tanggal: date,
          hari: dayName,
          jamScan: jamScan,
          timestamp: `${date}T${jamScan}Z`,
          idGuru: guru.idGuru,
          namaGuru: guru.namaGuru,
          mataPelajaran: j.mataPelajaran,
          kelas: j.kelas,
          ruang: j.ruang,
          jamPelajaran: `${j.jamMulai} - ${j.jamSelesai}`,
          status: status,
          latitude: lat,
          longitude: lng,
          akurasiGps: 5 + (idCount % 8),
          lokasiAlamat: "Jl. Raya Bumiayu, Kec. Baureno, Kabupaten Bojonegoro, Jawa Timur 62192",
          jarakSekolah: parseFloat(distance.toFixed(1)),
          device: idCount % 2 === 0 ? "Samsung Galaxy S23" : "iPhone 14 Pro",
          browser: idCount % 2 === 0 ? "Chrome Mobile" : "Safari",
          statusValidasiGps: "VALID",
        });
      }
      idCount++;
    });
  });

  return list;
};

export const defaultAktivitasLogs: AktivitasLog[] = [
  { id: "LOG-001", timestamp: "2026-07-17T07:05:12Z", username: "admin", aktivitas: "Admin berhasil masuk ke dashboard", kategori: "LOGIN" },
  { id: "LOG-002", timestamp: "2026-07-17T07:12:45Z", username: "admin", aktivitas: "Menambahkan data Guru baru: Fatmawati, S.Pd.", kategori: "GURU" },
  { id: "LOG-003", timestamp: "2026-07-17T07:15:30Z", username: "admin", aktivitas: "Memperbarui pengaturan radius absensi sekolah menjadi 100 Meter", kategori: "PENGATURAN" },
];
