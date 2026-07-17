export interface Guru {
  idGuru: string;
  nip: string;
  namaGuru: string;
  mataPelajaran: string;
  jabatan: string;
  nomorHp: string;
  email: string;
  statusAktif: "Aktif" | "Nonaktif";
  qrCode: string; // Token / ID used in QR Code
  foto: string;
}

export interface Jadwal {
  idJadwal: string;
  hari: string; // Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
  jamMulai: string; // HH:mm
  jamSelesai: string; // HH:mm
  mataPelajaran: string;
  kelas: string;
  ruang: string;
  idGuru: string;
}

export interface Absensi {
  idAbsensi: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;
  jamScan: string; // HH:mm:ss
  timestamp: string; // ISO String
  idGuru: string;
  namaGuru: string;
  mataPelajaran: string;
  kelas: string;
  ruang: string;
  jamPelajaran: string; // e.g. "07:30 - 09:00"
  status: "Hadir" | "Terlambat" | "Belum Absen";
  latitude: number;
  longitude: number;
  akurasiGps: number;
  lokasiAlamat: string;
  jarakSekolah: number; // in meters
  device: string;
  browser: string;
  statusValidasiGps: "VALID" | "DITOLAK";
}

export interface Admin {
  username: string;
  passwordHash: string; // Simplified for client simulation
  nama: string;
}

export interface Pengaturan {
  namaSekolah: string;
  logo: string;
  latitudeSekolah: number;
  longitudeSekolah: number;
  radiusAbsensi: number; // 50, 100, 150, 200
  jamMasuk: string; // HH:mm
  jamPulang: string; // HH:mm
  toleransiTerlambat: number; // in minutes
  titikLokasiSekolah: string; // Label / Description
}

export interface AktivitasLog {
  id: string;
  timestamp: string;
  username: string;
  aktivitas: string;
  kategori: "LOGIN" | "LOGOUT" | "GURU" | "JADWAL" | "ABSENSI" | "PENGATURAN" | "BACKUP" | "RESTORE";
  ipAddress?: string;
}
