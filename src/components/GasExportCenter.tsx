import { useState } from "react";
import { Terminal, Copy, Check, FileSpreadsheet, Download, ExternalLink, HelpCircle, BookOpen, AlertTriangle, Globe } from "lucide-react";
import { gasCodeGs, gasIndexHtml } from "../data/gasTemplates";

export default function GasExportCenter() {
  const [activeCodeTab, setActiveCodeTab] = useState<"gs" | "html" | "blogger">("gs");
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedBlogger, setCopiedBlogger] = useState(false);
  const [gasUrl, setGasUrl] = useState("https://script.google.com/macros/s/AKfycbxItP3VgrTR3KjK4GQOKpxrf74zYJP0vQlgsMgXKsVriUPgFsfze8cQQGt13Xx1EAk/exec");

  const handleCopyGs = () => {
    navigator.clipboard.writeText(gasCodeGs);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(gasIndexHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const bloggerCode = `<!-- PORTAL ABSENSI GURU QR & GPS - MI ISLAMIYAH BUMIAYU -->
<!-- Salin dan tempel kode ini di Halaman atau Postingan Blogger Anda (Mode HTML View) -->
<div class="absensi-blogger-container" style="position: relative; width: 100%; max-width: 600px; margin: 20px auto; overflow: hidden; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; background: #ffffff;">
  <iframe 
    src="${gasUrl || "[TEMPEL_TAUTAN_URL_WEBAPP_GAS_DI_SINI]"}" 
    style="width: 100%; height: 820px; border: none; display: block; overflow: hidden;" 
    allow="geolocation; camera"
    referrerpolicy="no-referrer">
  </iframe>
</div>`;

  const handleCopyBlogger = () => {
    navigator.clipboard.writeText(bloggerCode);
    setCopiedBlogger(true);
    setTimeout(() => setCopiedBlogger(false), 2000);
  };

  const handleDownloadGsFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Pusat Integrasi Webapp GAS + BLOGGER (Blogspot)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dapatkan kode Google Apps Script backend, portal HTML, serta kode sematan khusus untuk website Blogger Sekolah Anda.
          </p>
        </div>

        <div className="flex flex-wrap rounded-lg bg-slate-150 p-1 dark:bg-slate-800 gap-1 sm:gap-0">
          <button
            onClick={() => setActiveCodeTab("gs")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeCodeTab === "gs"
                ? "bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-blue-600" />
            <span>Code.gs (Backend)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab("html")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeCodeTab === "html"
                ? "bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <span className="text-[10px] font-bold text-amber-500">HTML</span>
            <span>Index.html (Frontend)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab("blogger")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeCodeTab === "blogger"
                ? "bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-orange-500" />
            <span>Sematkan di Blogger</span>
          </button>
        </div>
      </div>

      {/* Interactive Diagnosis Card for the User's link */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-950/20 dark:bg-rose-950/10 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-xl dark:bg-rose-950/40 text-rose-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
              Solusi Error HP: "Maaf, saat ini tidak dapat membuka file"
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Link Web App Anda (<code className="font-semibold text-rose-800 dark:text-rose-400">.../exec</code>) sebenarnya sudah <b>100% BENAR</b> dan siap pakai. 
              Penyebab utama error di HP Android/iOS adalah <b>"Bug Multi-Akun Google di Chrome"</b> (Ketika HP login lebih dari 1 email Google, sistem redirect Google Apps Script sering tabrakan dan memunculkan error tersebut).
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          <div className="rounded-xl bg-white p-3.5 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-1.5 text-xs">
            <span className="font-bold text-rose-700 dark:text-rose-400">1. Gunakan Mode Penyamaran</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Coba salin link <code className="font-semibold text-blue-600">/exec</code> Anda dan buka di <b>Tab Penyamaran (Incognito Window)</b> di HP. 
              Pasti aplikasi langsung terbuka normal tanpa error!
            </p>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-1.5 text-xs">
            <span className="font-bold text-rose-700 dark:text-rose-400">2. Atur Akses "Siapa Saja"</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Saat melakukan <b>Deploy</b>, pastikan Anda mengatur kolom <i>"Who has access"</i> ke <b>"Anyone" (Siapa saja)</b> agar guru tidak dipaksa login Google.
            </p>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-1.5 text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">3. Solusi Terbaik: Pakai Blogger</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Sematkan link Anda ke Blogger menggunakan tab <b>Sematkan di Blogger</b> di bawah. Ini membungkus aplikasi agar aman dari gangguan bug login HP!
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Code view on left, documentation on right */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Left Side: Code block display */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          
          {activeCodeTab !== "blogger" ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {activeCodeTab === "gs" ? "Code.gs" : "Index.html"}
                </span>

                <div className="flex gap-2">
                  {/* Copy Button */}
                  <button
                    onClick={activeCodeTab === "gs" ? handleCopyGs : handleCopyHtml}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {activeCodeTab === "gs" ? (
                      copiedGs ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />
                    ) : (
                      copiedHtml ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{activeCodeTab === "gs" ? (copiedGs ? "Disalin!" : "Salin Kode") : (copiedHtml ? "Disalin!" : "Salin Kode")}</span>
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() =>
                      handleDownloadGsFile(
                        activeCodeTab === "gs" ? "Code.gs" : "Index.html",
                        activeCodeTab === "gs" ? gasCodeGs : gasIndexHtml
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh File</span>
                  </button>
                </div>
              </div>

              {/* Textarea Code previewer */}
              <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] text-blue-400 dark:border-slate-800 overflow-hidden shadow-inner">
                <pre className="max-h-[460px] overflow-y-auto leading-relaxed pr-2 whitespace-pre-wrap">
                  {activeCodeTab === "gs" ? gasCodeGs : gasIndexHtml}
                </pre>
              </div>
            </>
          ) : (
            // Blogger Embed Code Generator View
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  Generator Kode Embed Iframe Blogger
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Masukkan tautan hasil deploy webapp Google Apps Script Anda untuk menghasilkan kode HTML yang siap dipasang di Blogger.
                </p>
              </div>

              {/* Input for GAS App URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  URL Web App Google Apps Script Anda (Berakhiran /exec)
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <span className="block text-[10px] text-rose-600 font-medium">
                  Pastikan link TIDAK mengandung kata /macros/u/0/... karena itu adalah tautan tes (uji coba) yang akan error saat diakses guru di HP mereka!
                </span>
              </div>

              {/* Generated Iframe preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Salin Kode HTML Di Bawah Ini:
                  </span>
                  <button
                    onClick={handleCopyBlogger}
                    className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-orange-700 cursor-pointer"
                  >
                    {copiedBlogger ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedBlogger ? "Disalin!" : "Salin Kode Blogger"}</span>
                  </button>
                </div>

                <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] text-orange-400 dark:border-slate-800 overflow-hidden shadow-inner">
                  <pre className="max-h-[220px] overflow-y-auto leading-relaxed pr-2 whitespace-pre-wrap">
                    {bloggerCode}
                  </pre>
                </div>
              </div>

              {/* Critical Alert for Iframe Permissions */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-[11px] text-amber-950 dark:border-amber-950/20 dark:bg-amber-950/10 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>MENGAPA KAMERA & GPS BIASA BLOCKED DI BLOGGER?</span>
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  Secara standar, browser HP memblokir kamera dan lokasi jika sebuah website berada di dalam iframe (embedded). 
                  Namun, kode generator di atas telah dilengkapi dengan atribut <code className="font-bold bg-white px-1 dark:bg-slate-900">allow="geolocation; camera"</code>. 
                  Atribut ini secara sah mengizinkan blog Anda untuk mengakses kamera dan lokasi, sehingga scanner QR dan GPS dapat bekerja 100% normal di HP guru!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Step by Step installation instructions */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Step-by-Step Card */}
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Panduan Instalasi & Deploy (3 Menit)
              </h3>
            </div>

            {/* List */}
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-4 list-decimal pl-4 leading-relaxed">
              <li>
                <b>Buat Spreadsheet Baru:</b><br />
                Buka akun Google Drive Anda, buat Google Spreadsheet baru, dan beri nama misalnya: 
                <span className="font-mono bg-slate-150 px-1 py-0.5 rounded text-blue-700 dark:bg-slate-800 dark:text-blue-300">Database_Absensi_Guru</span>.
              </li>

              <li>
                <b>Buka Google Apps Script:</b><br />
                Di menu atas spreadsheet, klik menu <b>Ekstensi</b> &gt; <b>Apps Script</b>.
              </li>

              <li>
                <b>Tempel Kode Backend (Code.gs):</b><br />
                Hapus seluruh baris kode default <span className="font-mono">myFunction()</span> di editor Apps Script, 
                lalu salin dan tempelkan kode dari tombol <b>Code.gs</b> di samping kiri.
              </li>

              <li>
                <b>Buat File HTML (Index.html):</b><br />
                Klik ikon tambah <b>+</b> di sisi kiri editor Apps Script (di samping "File"), pilih <b>HTML</b>, beri nama file persis 
                <span className="font-mono bg-slate-150 px-1 py-0.5 rounded text-amber-600 dark:bg-slate-800">Index</span> (tanpa akhiran .html), 
                lalu salin dan tempel kode <b>Index.html</b> di samping kiri.
              </li>

              <li>
                <b>Inisialisasi Database (Wajib):</b><br />
                Pada toolbar editor atas, pilih fungsi bernama <b>setupSpreadsheet</b>, lalu klik tombol <b>Run</b> (ikon Segitiga). 
                Klik <b>Review Permissions</b> dan izinkan hak akses ke Spreadsheet Anda. Seluruh sheet database guru & jadwal akan otomatis terbuat!
              </li>

              <li>
                <b>Deploy Sebagai Web App:</b><br />
                Di kanan atas editor, klik tombol <b>Terapkan (Deploy)</b> &gt; <b>Penerapan Baru (New Deployment)</b>.<br />
                - Klik ikon gerigi (Pilih Jenis): pilih <b>Aplikasi Web (Web App)</b>.<br />
                - Jalankan Sebagai (Execute as): pilih <b>Saya (Your Email)</b>.<br />
                - Siapa yang memiliki akses (Who has access): pilih <b>Siapa saja (Anyone)</b>.<br />
                - Klik <b>Terapkan (Deploy)</b>.
              </li>

              <li>
                <b>Selesai & Sematkan di Blogger:</b><br />
                Salin tautan <b>URL Aplikasi Web</b> yang diberikan (berakhiran <code className="font-semibold text-blue-600 dark:text-blue-400">/exec</code>). 
                Buka tab <b>Sematkan di Blogger</b> di panel kiri, tempelkan link tersebut, salin kode HTML iframe yang dihasilkan, lalu tempelkan ke postingan/halaman Blogger Anda dengan mode <b>HTML View</b>!
              </li>
            </ol>

            {/* Troubleshooting alert for /macros/u/ issue */}
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-[11px] text-rose-950 dark:border-rose-950/20 dark:bg-rose-950/10 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>PENTING: Mengatasi Error "Maaf, saat ini tidak dapat membuka file" di HP</span>
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Jika di HP Anda muncul pesan error Google Drive di atas, hal tersebut disebabkan oleh salah satu hal berikut:
              </p>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed text-slate-600 dark:text-slate-400">
                <li>
                  <b>Menggunakan Link "Uji Penerapan" (Test Deployment):</b> Link yang mengandung kata <code className="font-bold bg-white px-1 dark:bg-slate-900">/macros/u/0/...</code> adalah link tes yang hanya bisa dibuka oleh pemilik email utama. 
                  Pastikan Anda menyalin link hasil <b>Deploy Resmi</b> yang berakhiran <code className="font-bold bg-white px-1 dark:bg-slate-900">/exec</code> tanpa ada tulisan <code className="font-bold bg-white px-1 dark:bg-slate-900">/u/0/</code>.
                </li>
                <li>
                  <b>Salah Pengaturan Akses:</b> Pastikan saat Deploy, opsi <b>"Siapa saja" (Anyone)</b> terpilih, bukan "Hanya saya" (Only myself).
                </li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                Cara perbaikan: Klik kembali tombol <b>Terapkan (Deploy)</b> &gt; <b>Kelola Penerapan (Manage Deployments)</b>, klik ikon pensil (edit), pastikan Akses diset ke <b>Siapa saja (Anyone)</b>, ubah Versi ke <b>Versi Baru (New Version)</b>, lalu klik <b>Terapkan (Deploy)</b> dan salin kembali URL Aplikasi Web yang baru.
              </p>
            </div>
          </div>

          {/* Database Schema reference */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-xs dark:border-blue-900/10 dark:bg-blue-950/20 space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2 dark:border-blue-900/10">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <h4 className="font-bold text-blue-950 dark:text-blue-200">Struktur Spreadsheet Otomatis</h4>
            </div>
            <p className="text-blue-900 leading-relaxed dark:text-blue-300">
              Dengan menjalankan fungsi <span className="font-mono bg-white dark:bg-slate-900 px-1 rounded font-bold">setupSpreadsheet</span>, 
              sistem secara cerdas memprovisikan 6 lembar kerja (Sheets) berikut:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-blue-800 dark:text-blue-300 font-semibold">
              <li>Guru (Data, QR Token, Status)</li>
              <li>Jadwal (Hari, Kelas, Jam Pelajaran)</li>
              <li>Absensi (Hasil Scan GPS + Validasi)</li>
              <li>Admin (Sesi Operator & Sandi Ter-Hash)</li>
              <li>Pengaturan (Titik Sekolah & Radius)</li>
              <li>AktivitasLog (Sistem audit logs)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
