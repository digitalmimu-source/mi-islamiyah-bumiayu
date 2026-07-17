export const gasCodeGs = `/**
 * =================================================================================
 * MI ISLAMIYAH BUMIAYU - SISTEM ABSENSI GURU BERBASIS QR CODE & GPS GEOLOCATION
 * =================================================================================
 * File: Code.gs (Google Apps Script Backend)
 * Deskripsi: Mengelola seluruh logika server-side, integrasi Google Spreadsheet
 *            sebagai database, autentikasi admin, validasi GPS & Jadwal,
 *            dan penyimpanan riwayat absensi guru.
 * =================================================================================
 */

// Konstanta Nama Sheet
const SHEET_GURU = "Guru";
const SHEET_JADWAL = "Jadwal";
const SHEET_ABSENSI = "Absensi";
const SHEET_ADMIN = "Admin";
const SHEET_PENGATURAN = "Pengaturan";
const SHEET_AKTIVITAS = "AktivitasLog";

/**
 * Menyajikan halaman HTML utama saat Web App diakses di browser.
 */
function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Absensi Guru - MI Islamiyah Bumiayu")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Memasukkan file eksternal (CSS/JS) ke dalam file HTML utama.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Menghubungkan ke file spreadsheet aktif.
 */
function getDb() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * =================================================================================
 * 1. INISIALISASI DATABASE & SHEET (AUTO-PROVISIONING)
 * =================================================================================
 * Fungsi ini otomatis membuat seluruh sheet dengan header kolom yang sesuai
 * jika belum ada di dalam Google Spreadsheet Anda.
 */
function setupSpreadsheet() {
  const ss = getDb();
  
  // 1. Sheet Guru
  createSheetWithHeaders(ss, SHEET_GURU, [
    "ID Guru", "NIP", "Nama Guru", "Mata Pelajaran", "Jabatan", "Nomor HP", "Email", "Status Aktif", "QR Code", "Foto"
  ]);
  
  // Seed default Guru jika kosong
  const sheetGuru = ss.getSheetByName(SHEET_GURU);
  if (sheetGuru.getLastRow() === 1) {
    sheetGuru.appendRow(["G-001", "198204122009121003", "Drs. H. Masykur, M.Pd.", "Al-Qur'an Hadits", "Kepala Madrasah", "081234567890", "masykur@gmail.com", "Aktif", "MIG-001-MASYKUR-SECURE77", ""]);
    sheetGuru.appendRow(["G-002", "198503152014032001", "Siti Aminah, S.Ag.", "Aqidah Akhlak", "Waka Kurikulum", "081398765432", "siti.aminah@gmail.com", "Aktif", "MIG-002-SITI-SECURE92", ""]);
    sheetGuru.appendRow(["G-003", "199011242018011002", "Ahmad Fauzi, S.Pd.", "Matematika", "Waka Kesiswaan", "085611223344", "fauzi@gmail.com", "Aktif", "MIG-003-FAUZI-SECURE12", ""]);
  }

  // 2. Sheet Jadwal
  createSheetWithHeaders(ss, SHEET_JADWAL, [
    "ID Jadwal", "Hari", "Jam Mulai", "Jam Selesai", "Mata Pelajaran", "Kelas", "Ruang", "ID Guru"
  ]);
  
  const sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
  if (sheetJadwal.getLastRow() === 1) {
    sheetJadwal.appendRow(["J-001", "Senin", "07:00", "08:30", "Al-Qur'an Hadits", "VI A", "Kelas 6", "G-001"]);
    sheetJadwal.appendRow(["J-002", "Senin", "08:30", "10:00", "Aqidah Akhlak", "VI B", "Kelas 5", "G-002"]);
  }

  // 3. Sheet Absensi
  createSheetWithHeaders(ss, SHEET_ABSENSI, [
    "ID Absensi", "Tanggal", "Hari", "Jam Scan", "Timestamp", "ID Guru", "Nama Guru", "Mata Pelajaran", 
    "Kelas", "Ruang", "Jam Pelajaran", "Status", "Latitude", "Longitude", "Akurasi GPS", 
    "Lokasi (Alamat)", "Jarak dari Sekolah", "Device", "Browser", "Status Validasi"
  ]);

  // 4. Sheet Admin
  createSheetWithHeaders(ss, SHEET_ADMIN, ["Username", "Password", "Nama"]);
  const sheetAdmin = ss.getSheetByName(SHEET_ADMIN);
  if (sheetAdmin.getLastRow() === 1) {
    // Password default "admin123" yang di-hash SHA-256: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
    sheetAdmin.appendRow(["admin", "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", "H. Achmad Syafi'i, S.Pd.I."]);
  }

  // 5. Sheet Pengaturan
  createSheetWithHeaders(ss, SHEET_PENGATURAN, [
    "Nama Sekolah", "Logo", "Latitude Sekolah", "Longitude Sekolah", "Radius Absensi", "Jam Masuk", "Jam Pulang", "Toleransi Terlambat", "Titik Lokasi"
  ]);
  const sheetPengaturan = ss.getSheetByName(SHEET_PENGATURAN);
  if (sheetPengaturan.getLastRow() === 1) {
    sheetPengaturan.appendRow([
      "MI ISLAMIYAH Bumiayu Baureno Bojonegoro",
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150",
      -7.118745,
      112.126379,
      100, // Radius 100 meter
      "07:00",
      "13:30",
      15, // Toleransi terlambat 15 menit
      "Gedung Utama MI Islamiyah Bumiayu"
    ]);
  }

  // 6. Sheet AktivitasLog
  createSheetWithHeaders(ss, SHEET_AKTIVITAS, ["ID", "Timestamp", "Username", "Aktivitas", "Kategori"]);
  
  return "Database Berhasil Diinisialisasi!";
}

function createSheetWithHeaders(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    // Format header agar rapi
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight("bold");
    range.setBackground("#f3f4f6");
    range.setBorder(true, true, true, true, true, true);
  }
}

/**
 * =================================================================================
 * 2. AUTENTIKASI ADMIN & SECURITY SESSION
 * =================================================================================
 */
function doLogin(username, passwordHash) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_ADMIN);
  if (!sheet) return { success: false, message: "Database Admin belum siap." };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === passwordHash) {
      logAktivitas(username, "Admin berhasil masuk ke sistem", "LOGIN");
      return {
        success: true,
        admin: { username: data[i][0], nama: data[i][2] }
      };
    }
  }
  return { success: false, message: "Username atau Password salah." };
}

/**
 * =================================================================================
 * 3. LOGIKA VALIDASI & SCAN ABSENSI (SERVER-SIDE)
 * =================================================================================
 */
function checkTeacherScheduleToday(idGuru, currentHourStr, dayName) {
  const ss = getDb();
  const sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
  if (!sheetJadwal) return null;

  const schedules = sheetJadwal.getDataRange().getValues();
  const matchedSchedules = [];

  for (let i = 1; i < schedules.length; i++) {
    const sIdGuru = schedules[i][7];
    const sHari = schedules[i][1];
    
    if (sIdGuru === idGuru && sHari.toLowerCase() === dayName.toLowerCase()) {
      matchedSchedules.push({
        idJadwal: schedules[i][0],
        hari: sHari,
        jamMulai: schedules[i][2],
        jamSelesai: schedules[i][3],
        mataPelajaran: schedules[i][4],
        kelas: schedules[i][5],
        ruang: schedules[i][6]
      });
    }
  }

  if (matchedSchedules.length === 0) return null;

  // Bandingkan jam scan dengan jam mulai
  // Toleransi absensi adalah 45 menit sebelum jam mulai hingga sebelum jam selesai
  const [scanH, scanM] = currentHourStr.split(":").map(Number);
  const scanMinutes = scanH * 60 + scanM;

  for (let s of matchedSchedules) {
    const [startH, startM] = s.jamMulai.split(":").map(Number);
    const [endH, endM] = s.jamSelesai.split(":").map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Bolehkah absen? 45 menit sebelum mulai s/d sebelum selesai pelajaran
    if (scanMinutes >= (startMinutes - 45) && scanMinutes <= endMinutes) {
      return s; // Menemukan jadwal aktif!
    }
  }

  return null;
}

function processAbsensi(scanData) {
  const { qrValue, latitude, longitude, akurasi, device, browser } = scanData;
  const ss = getDb();
  
  // 1. Temukan Guru berdasarkan token QR
  const sheetGuru = ss.getSheetByName(SHEET_GURU);
  const guruData = sheetGuru.getDataRange().getValues();
  let guruObj = null;

  for (let i = 1; i < guruData.length; i++) {
    if (guruData[i][8] === qrValue && guruData[i][7] === "Aktif") {
      guruObj = {
        idGuru: guruData[i][0],
        nip: guruData[i][1],
        namaGuru: guruData[i][2],
        mataPelajaran: guruData[i][3],
        jabatan: guruData[i][4]
      };
      break;
    }
  }

  if (!guruObj) {
    return { success: false, message: "QR Code Guru Tidak Valid atau Status Guru Nonaktif." };
  }

  // Ambil data pengaturan
  const sheetPengaturan = ss.getSheetByName(SHEET_PENGATURAN);
  const settings = sheetPengaturan.getDataRange().getValues()[1];
  const schoolLat = settings[2];
  const schoolLng = settings[3];
  const radius = settings[4];
  const tolerance = settings[7];

  // 2. Validasi Geolocation (GPS) menggunakan rumus Haversine
  const distance = calculateHaversine(latitude, longitude, schoolLat, schoolLng);
  const statusGps = distance <= radius ? "VALID" : "DITOLAK";

  if (statusGps === "DITOLAK") {
    return {
      success: false,
      message: "Absensi Ditolak! Anda berada di luar area sekolah. Jarak: " + Math.round(distance) + "m (Maksimal " + radius + "m)."
    };
  }

  // 3. Validasi Hari & Jam Mengajar sesuai Jadwal
  const timezone = "Asia/Jakarta";
  const now = new Date();
  
  // Ambil Hari Bahasa Indonesia
  const indonesianDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = indonesianDays[now.getDay()];
  
  const currentHourStr = Utilities.formatDate(now, timezone, "HH:mm");
  const currentDateStr = Utilities.formatDate(now, timezone, "yyyy-MM-dd");

  const activeSchedule = checkTeacherScheduleToday(guruObj.idGuru, currentHourStr, currentDayName);

  if (!activeSchedule) {
    return {
      success: false,
      message: "Absensi Gagal! Tidak ditemukan jadwal mengajar aktif untuk Anda pada hari " + currentDayName + " pukul " + currentHourStr + "."
    };
  }

  // 4. Cegah Absensi Ganda pada Jadwal dan Hari yang sama
  const sheetAbsensi = ss.getSheetByName(SHEET_ABSENSI);
  const absensiRecords = sheetAbsensi.getDataRange().getValues();

  for (let i = 1; i < absensiRecords.length; i++) {
    const aTanggal = Utilities.formatDate(new Date(absensiRecords[i][1]), timezone, "yyyy-MM-dd");
    const aIdGuru = absensiRecords[i][5];
    const aKelas = absensiRecords[i][8];
    const aMapel = absensiRecords[i][7];

    if (aTanggal === currentDateStr && aIdGuru === guruObj.idGuru && aKelas === activeSchedule.kelas && aMapel === activeSchedule.mataPelajaran) {
      return {
        success: false,
        message: "Absensi untuk jadwal pelajaran " + activeSchedule.mataPelajaran + " di kelas " + activeSchedule.kelas + " sudah dilakukan hari ini."
      };
    }
  }

  // 5. Hitung Status Terlambat
  // Bandingkan jam scan dengan jamMulai + toleransiTerlambat
  const [scanH, scanM] = currentHourStr.split(":").map(Number);
  const [startH, startM] = activeSchedule.jamMulai.split(":").map(Number);
  
  const scanMinutes = scanH * 60 + scanM;
  const lateLimitMinutes = startH * 60 + startM + tolerance;

  const statusKehadiran = scanMinutes > lateLimitMinutes ? "Terlambat" : "Hadir";

  // 6. Simpan Ke Spreadsheet
  const idAbsensi = "ABS-" + Math.floor(Math.random() * 90000 + 10000);
  const rowData = [
    idAbsensi,
    currentDateStr,
    currentDayName,
    currentHourStr + ":" + String(now.getSeconds()).padStart(2, "0"),
    now.toISOString(),
    guruObj.idGuru,
    guruObj.namaGuru,
    activeSchedule.mataPelajaran,
    activeSchedule.kelas,
    activeSchedule.ruang,
    activeSchedule.jamMulai + " - " + activeSchedule.jamSelesai,
    statusKehadiran,
    latitude,
    longitude,
    akurasi,
    "Jl. Raya Bumiayu, Baureno, Bojonegoro",
    Math.round(distance),
    device,
    browser,
    statusGps
  ];

  sheetAbsensi.appendRow(rowData);
  logAktivitas("Guru: " + guruObj.namaGuru, "Melakukan Absensi " + statusKehadiran + " (Jadwal " + activeSchedule.mataPelajaran + ")", "ABSENSI");

  return {
    success: true,
    message: "Absensi Berhasil! " + guruObj.namaGuru + " tercatat " + statusKehadiran + " pada jam " + currentHourStr + ".",
    data: {
      nama: guruObj.namaGuru,
      status: statusKehadiran,
      jam: currentHourStr,
      mapel: activeSchedule.mataPelajaran,
      kelas: activeSchedule.kelas
    }
  };
}

/**
 * Rumus Haversine untuk menghitung jarak dua koordinat GPS dalam satuan Meter.
 */
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Hasil dalam meter
}

/**
 * =================================================================================
 * 4. FUNGSI LOG DAN RIWAYAT AKTIVITAS
 * =================================================================================
 */
function logAktivitas(username, aktivitas, kategori) {
  try {
    const ss = getDb();
    const sheet = ss.getSheetByName(SHEET_AKTIVITAS);
    if (!sheet) return;

    const id = "LOG-" + Math.floor(Math.random() * 90000 + 10000);
    sheet.appendRow([
      id,
      new Date().toISOString(),
      username,
      aktivitas,
      kategori
    ]);
  } catch (e) {
    Logger.log("Gagal mencatat aktivitas: " + e.message);
  }
}

/**
 * =================================================================================
 * 5. GETTER & SETTER DATA GURU (CRUD)
 * =================================================================================
 */
function getGuruList() {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_GURU);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < values.length; i++) {
    list.push({
      idGuru: values[i][0],
      nip: values[i][1],
      namaGuru: values[i][2],
      mataPelajaran: values[i][3],
      jabatan: values[i][4],
      nomorHp: values[i][5],
      email: values[i][6],
      statusAktif: values[i][7],
      qrCode: values[i][8],
      foto: values[i][9]
    });
  }
  return list;
}

function saveGuru(guru) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_GURU);
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === guru.idGuru) {
      foundRow = i + 1; // 1-indexed plus header
      break;
    }
  }

  const rowData = [
    guru.idGuru,
    guru.nip,
    guru.namaGuru,
    guru.mataPelajaran,
    guru.jabatan,
    guru.nomorHp,
    guru.email,
    guru.statusAktif,
    guru.qrCode,
    guru.foto
  ];

  if (foundRow > -1) {
    sheet.getRange(foundRow, 1, 1, 10).setValues([rowData]);
    logAktivitas("Admin", "Mengedit data guru: " + guru.namaGuru, "GURU");
  } else {
    sheet.appendRow(rowData);
    logAktivitas("Admin", "Menambahkan guru baru: " + guru.namaGuru, "GURU");
  }
  return true;
}

function deleteGuru(idGuru) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_GURU);
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === idGuru) {
      const nama = values[i][2];
      sheet.deleteRow(i + 1);
      logAktivitas("Admin", "Menghapus data guru: " + nama, "GURU");
      return true;
    }
  }
  return false;
}

/**
 * =================================================================================
 * 6. GETTER & SETTER DATA JADWAL (CRUD)
 * =================================================================================
 */
function getJadwalList() {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_JADWAL);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < values.length; i++) {
    list.push({
      idJadwal: values[i][0],
      hari: values[i][1],
      jamMulai: values[i][2],
      jamSelesai: values[i][3],
      mataPelajaran: values[i][4],
      kelas: values[i][5],
      ruang: values[i][6],
      idGuru: values[i][7]
    });
  }
  return list;
}

function saveJadwal(jadwal) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_JADWAL);
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === jadwal.idJadwal) {
      foundRow = i + 1;
      break;
    }
  }

  const rowData = [
    jadwal.idJadwal,
    jadwal.hari,
    jadwal.jamMulai,
    jadwal.jamSelesai,
    jadwal.mataPelajaran,
    jadwal.kelas,
    jadwal.ruang,
    jadwal.idGuru
  ];

  if (foundRow > -1) {
    sheet.getRange(foundRow, 1, 1, 8).setValues([rowData]);
    logAktivitas("Admin", "Mengedit jadwal " + jadwal.mataPelajaran + " " + jadwal.kelas, "JADWAL");
  } else {
    sheet.appendRow(rowData);
    logAktivitas("Admin", "Menambah jadwal baru " + jadwal.mataPelajaran + " " + jadwal.kelas, "JADWAL");
  }
  return true;
}

function deleteJadwal(idJadwal) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_JADWAL);
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === idJadwal) {
      const mapel = values[i][4];
      const kelas = values[i][5];
      sheet.deleteRow(i + 1);
      logAktivitas("Admin", "Menghapus jadwal " + mapel + " " + kelas, "JADWAL");
      return true;
    }
  }
  return false;
}

/**
 * =================================================================================
 * 7. REKAP ABSENSI & LAPORAN
 * =================================================================================
 */
function getAbsensiList() {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_ABSENSI);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const list = [];
  const timezone = "Asia/Jakarta";

  for (let i = 1; i < values.length; i++) {
    list.push({
      idAbsensi: values[i][0],
      tanggal: Utilities.formatDate(new Date(values[i][1]), timezone, "yyyy-MM-dd"),
      hari: values[i][2],
      jamScan: values[i][3],
      timestamp: values[i][4],
      idGuru: values[i][5],
      namaGuru: values[i][6],
      mataPelajaran: values[i][7],
      kelas: values[i][8],
      ruang: values[i][9],
      jamPelajaran: values[i][10],
      status: values[i][11],
      latitude: values[i][12],
      longitude: values[i][13],
      akurasiGps: values[i][14],
      lokasiAlamat: values[i][15],
      jarakSekolah: values[i][16],
      device: values[i][17],
      browser: values[i][18],
      statusValidasiGps: values[i][19]
    });
  }
  return list;
}

/**
 * =================================================================================
 * 8. PENGATURAN SEKOLAH
 * =================================================================================
 */
function getPengaturan() {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;

  return {
    namaSekolah: values[1][0],
    logo: values[1][1],
    latitudeSekolah: values[1][2],
    longitudeSekolah: values[1][3],
    radiusAbsensi: values[1][4],
    jamMasuk: values[1][5],
    jamPulang: values[1][6],
    toleransiTerlambat: values[1][7],
    titikLokasiSekolah: values[1][8]
  };
}

function savePengaturan(pengaturan) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) return false;

  const rowData = [
    pengaturan.namaSekolah,
    pengaturan.logo,
    parseFloat(pengaturan.latitudeSekolah),
    parseFloat(pengaturan.longitudeSekolah),
    parseInt(pengaturan.radiusAbsensi),
    pengaturan.jamMasuk,
    pengaturan.jamPulang,
    parseInt(pengaturan.toleransiTerlambat),
    pengaturan.titikLokasiSekolah
  ];

  sheet.getRange(2, 1, 1, 9).setValues([rowData]);
  logAktivitas("Admin", "Memperbarui pengaturan sekolah", "PENGATURAN");
  return true;
}

/**
 * =================================================================================
 * 9. BACKUP & RESTORE DATABASE SPREADSHEET
 * =================================================================================
 */
function exportFullDatabase() {
  const db = {
    guru: getGuruList(),
    jadwal: getJadwalList(),
    absensi: getAbsensiList(),
    pengaturan: getPengaturan()
  };
  return JSON.stringify(db);
}

function importDatabaseBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const ss = getDb();

    // Pastikan sheet siap
    setupSpreadsheet();

    // Restore Guru
    if (data.guru) {
      const sheet = ss.getSheetByName(SHEET_GURU);
      sheet.clear();
      sheet.appendRow(["ID Guru", "NIP", "Nama Guru", "Mata Pelajaran", "Jabatan", "Nomor HP", "Email", "Status Aktif", "QR Code", "Foto"]);
      data.guru.forEach(g => {
        sheet.appendRow([g.idGuru, g.nip, g.namaGuru, g.mataPelajaran, g.jabatan, g.nomorHp, g.email, g.statusAktif, g.qrCode, g.foto]);
      });
    }

    // Restore Jadwal
    if (data.jadwal) {
      const sheet = ss.getSheetByName(SHEET_JADWAL);
      sheet.clear();
      sheet.appendRow(["ID Jadwal", "Hari", "Jam Mulai", "Jam Selesai", "Mata Pelajaran", "Kelas", "Ruang", "ID Guru"]);
      data.jadwal.forEach(j => {
        sheet.appendRow([j.idJadwal, j.hari, j.jamMulai, j.jamSelesai, j.mataPelajaran, j.kelas, j.ruang, j.idGuru]);
      });
    }

    // Restore Pengaturan
    if (data.pengaturan) {
      const p = data.pengaturan;
      savePengaturan(p);
    }

    logAktivitas("Admin", "Melakukan restorasi database dari backup", "RESTORE");
    return { success: true, message: "Restorasi data backup selesai!" };
  } catch (e) {
    return { success: false, message: "Restorasi gagal: " + e.message };
  }
}
`;

export const gasIndexHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Absensi Guru - MI Islamiyah Bumiayu</title>
  
  <!-- CSS Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <!-- SweetAlert2 -->
  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
  <!-- Fonts Google -->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #f4f6f9;
      color: #1e293b;
    }
    .brand-header {
      background: linear-gradient(135deg, #0d9488, #0f766e);
      color: white;
      border-radius: 0 0 2rem 2rem;
      padding: 3rem 1.5rem;
      text-align: center;
      box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.2);
    }
    .card-portal {
      border: none;
      border-radius: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      background: white;
      transition: all 0.3s ease;
    }
    .btn-teal {
      background-color: #0d9488;
      color: white;
      border-radius: 1rem;
      padding: 0.8rem 1.5rem;
      font-weight: 600;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-teal:hover {
      background-color: #0f766e;
      color: white;
      transform: translateY(-2px);
    }
    #reader {
      width: 100%;
      border-radius: 1.5rem;
      overflow: hidden;
      border: 3px solid #e2e8f0;
      background-color: #000;
    }
    .gps-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.8rem 1rem;
      border-radius: 1rem;
      font-size: 0.85rem;
    }
    .loading-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(255,255,255,0.9);
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      z-index: 9999;
    }
  </style>
</head>
<body>

  <!-- Loading Screen -->
  <div id="loading" class="loading-overlay">
    <div class="spinner-border text-teal" style="width: 3rem; height: 3rem; color: #0d9488" role="status"></div>
    <p class="mt-3 fw-medium">Mengambil lokasi GPS sekolah & izin kamera...</p>
  </div>

  <!-- Header Banner -->
  <div class="brand-header">
    <img src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120" alt="Logo" class="rounded-circle mb-3 border border-3 border-white" style="width: 80px; height: 80px; object-fit: cover;">
    <h1 class="h3 fw-bold mb-1">PORTAL ABSENSI GURU</h1>
    <p class="mb-0 text-teal-100 opacity-90">MI ISLAMIYAH BUMIAYU</p>
    <small class="opacity-75">Bumiayu, Baureno, Bojonegoro, Jawa Timur</small>
  </div>

  <div class="container my-4" style="max-width: 600px;">
    <!-- Step 1: GPS Check -->
    <div class="card card-portal p-4 mb-4" id="gps-card">
      <div class="d-flex align-items-center mb-3">
        <div class="bg-teal-light p-3 rounded-circle me-3" style="background-color: #f0fdfa; color: #0d9488">
          <i class="bi bi-geo-alt-fill fs-3"></i>
        </div>
        <div>
          <h4 class="fw-bold mb-1 h5">1. Verifikasi Geolocation GPS</h4>
          <p class="text-muted mb-0 text-xs">Pastikan GPS aktif dan berada di area sekolah</p>
        </div>
      </div>

      <div class="gps-badge mb-3">
        <div class="row text-center">
          <div class="col-4">
            <div class="text-xs text-muted">Latitude</div>
            <div class="fw-semibold" id="lbl-lat">-</div>
          </div>
          <div class="col-4">
            <div class="text-xs text-muted">Longitude</div>
            <div class="fw-semibold" id="lbl-lng">-</div>
          </div>
          <div class="col-4">
            <div class="text-xs text-muted">Jarak Sekolah</div>
            <div class="fw-semibold" id="lbl-distance">-</div>
          </div>
        </div>
      </div>

      <button onclick="requestGpsLocation()" class="btn btn-teal w-full" id="btn-gps">
        <i class="bi bi-compass me-2"></i> Verifikasi Lokasi Saya
      </button>
    </div>

    <!-- Step 2: QR Scanner (Hidden until GPS valid) -->
    <div class="card card-portal p-4 d-none" id="scan-card">
      <div class="d-flex align-items-center mb-3">
        <div class="bg-teal-light p-3 rounded-circle me-3" style="background-color: #f0fdfa; color: #0d9488">
          <i class="bi bi-qr-code-scan fs-3"></i>
        </div>
        <div>
          <h4 class="fw-bold mb-1 h5">2. Scan QR Code Anda</h4>
          <p class="text-muted mb-0 text-xs">Hadapkan kartu QR Code guru ke arah kamera</p>
        </div>
      </div>

      <!-- Kamera Viewfinder -->
      <div id="reader" class="mb-3"></div>

      <audio id="beep-sound" src="https://assets.mixkit.co/active_storage/sfx/911/911-200.wav" preload="auto"></audio>
    </div>
  </div>

  <!-- JS Dependencies -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- HTML5 QR Code Scanner -->
  <script src="https://unpkg.com/html5-qrcode"></script>

  <script>
    let schoolLat = -7.118745;
    let schoolLng = 112.126379;
    let maxRadius = 100;

    let userLat = null;
    let userLng = null;
    let userAccuracy = null;
    let scanner = null;

    window.onload = function() {
      // Ambil pengaturan sekolah saat load
      google.script.run
        .withSuccessHandler(function(settings) {
          if (settings) {
            schoolLat = settings.latitudeSekolah;
            schoolLng = settings.longitudeSekolah;
            maxRadius = settings.radiusAbsensi;
          }
          document.getElementById('loading').style.display = 'none';
        })
        .withFailureHandler(function(err) {
          console.error("Gagal memuat pengaturan: ", err);
          document.getElementById('loading').style.display = 'none';
        })
        .getPengaturan();
    };

    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3;
      const phi1 = (lat1 * Math.PI) / 180;
      const phi2 = (lat2 * Math.PI) / 180;
      const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
      const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    function requestGpsLocation() {
      const btn = document.getElementById('btn-gps');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Memverifikasi GPS...';

      if (!navigator.geolocation) {
        Swal.fire("Gagal", "Geolocation tidak didukung oleh browser Anda.", "error");
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-compass me-2"></i> Verifikasi Lokasi Saya';
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function(position) {
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
          userAccuracy = position.coords.accuracy;

          const dist = calculateDistance(userLat, userLng, schoolLat, schoolLng);

          document.getElementById('lbl-lat').textContent = userLat.toFixed(6);
          document.getElementById('lbl-lng').textContent = userLng.toFixed(6);
          document.getElementById('lbl-distance').textContent = Math.round(dist) + "m";

          if (dist <= maxRadius) {
            Swal.fire({
              title: "Lokasi Terverifikasi!",
              text: "Anda berada dalam radius sekolah (" + Math.round(dist) + "m). Silakan scan QR Code Anda.",
              icon: "success",
              timer: 3000,
              showConfirmButton: false
            });

            document.getElementById('btn-gps').className = "btn btn-success w-full";
            document.getElementById('btn-gps').innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Lokasi Valid';
            document.getElementById('scan-card').classList.remove('d-none');
            
            startQrScanner();
          } else {
            Swal.fire({
              title: "Lokasi Ditolak!",
              text: "Anda berada di luar area sekolah. Jarak: " + Math.round(dist) + "m (Maksimal: " + maxRadius + "m).",
              icon: "error"
            });
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-compass me-2"></i> Coba Verifikasi Lagi';
          }
        },
        function(err) {
          Swal.fire("GPS Gagal", "Gagal mengambil koordinat lokasi. Izinkan akses GPS Anda.", "error");
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-compass me-2"></i> Coba Verifikasi Lagi';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    function startQrScanner() {
      if (scanner) return;

      scanner = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      scanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        function(err) {
          // Silent scan error
        }
      ).catch(function(err) {
        Swal.fire("Kamera Gagal", "Gagal mengakses kamera belakang.", "error");
      });
    }

    function onScanSuccess(decodedText) {
      // Putar suara beep absensi
      try {
        document.getElementById('beep-sound').play();
      } catch (e) {
        console.log("Audio play failed");
      }

      // Hentikan scan agar tidak memicu dobel request
      if (scanner) {
        scanner.stop().then(function() {
          scanner = null;
        });
      }

      document.getElementById('loading').style.display = 'flex';
      document.getElementById('loading').querySelector('p').textContent = "Memproses absensi Anda di server...";

      // Ambil informasi device dan browser
      const userAgent = navigator.userAgent;
      let device = "Desktop / Laptop";
      if (/android/i.test(userAgent)) device = "HP Android";
      else if (/iPad|iPhone|iPod/.test(userAgent)) device = "iPhone / iPad";

      let browser = "Browser";
      if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
      else if (/safari/i.test(userAgent)) browser = "Safari";
      else if (/firefox/i.test(userAgent)) browser = "Firefox";

      const payload = {
        qrValue: decodedText,
        latitude: userLat,
        longitude: userLng,
        akurasi: userAccuracy,
        device: device,
        browser: browser
      };

      // Kirim ke Google Apps Script backend
      google.script.run
        .withSuccessHandler(function(response) {
          document.getElementById('loading').style.display = 'none';
          if (response.success) {
            Swal.fire({
              title: "Absensi Berhasil!",
              html: "<b>" + response.data.nama + "</b><br>Status: " + response.data.status + "<br>Mata Pelajaran: " + response.data.mapel + "<br>Kelas: " + response.data.kelas,
              icon: "success",
              confirmButtonText: "Selesai"
            }).then(function() {
              location.reload();
            });
          } else {
            Swal.fire({
              title: "Absensi Gagal",
              text: response.message,
              icon: "error",
              confirmButtonText: "Coba Lagi"
            }).then(function() {
              location.reload();
            });
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('loading').style.display = 'none';
          Swal.fire("Kesalahan Server", "Gagal menghubungi Apps Script: " + err, "error").then(function() {
            location.reload();
          });
        })
        .processAbsensi(payload);
    }
  </script>
</body>
</html>
`;
