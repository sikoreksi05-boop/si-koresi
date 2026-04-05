/**
 * DATA OMR v2.0 - Core Application Logic
 */

// Initialize Firebase (Compat Mode)
const CONFIG = window.CONFIG;
const app = firebase.initializeApp(CONFIG.FIREBASE);
const db = firebase.firestore();
const auth = firebase.auth();

// --- APP STATE ---
let STATE = {
    currentView: 'dashboard',
    bankSoal: [],          // Dimuat setelah login via loadUserData()
    activeKeyId: null,
    scannedImage: null,
    scannedMimeType: null,
    tempResult: null,
    activeDetailKelas: null,
    activeDetailMapel: null,
    allHasilOMR: [],       // Dimuat setelah login via loadUserData()
    isCompressing: false,
    scannedImages: [],     // Array for multi-page PDF
    students: {},          // Dimuat setelah login via loadUserData()
    user: null             // Diisi oleh onAuthStateChanged
};

// --- DOM ELEMENTS ---
const el = {
    navItems: document.querySelectorAll('.nav-item'),
    sideNavItems: document.querySelectorAll('.side-nav-item'),
    views: document.querySelectorAll('.view'),
    recentExams: document.getElementById('recentExams'),
    aiModal: document.getElementById('aiModal'),
    aiResultContent: document.getElementById('aiResultContent'),
    btnConfirmResult: document.getElementById('btnConfirmResult'),
    btnDownloadResult: document.getElementById('btnDownloadResult'),
    modalTitle: document.getElementById('modalTitle'),
    modalFooter: document.getElementById('modalFooter'),
    resultsListBody: document.getElementById('resultsListBody'),
    setGeminiVision: document.getElementById('setGeminiVision'),
    setGeminiLogic: document.getElementById('setGeminiLogic'),
    setGroqKey: document.getElementById('setGroqKey'),
    setFirebaseKey: document.getElementById('setFirebaseKey'),
    btnSaveConfig: document.getElementById('btnSaveConfig'),
    btnResetTrial: document.getElementById('btnResetTrial'),
    togglePassBtns: document.querySelectorAll('.toggle-password'),
    appModeBadge: document.getElementById('appModeBadge'),
    hamburgerBtn: document.getElementById('hamburgerBtn'),
    sideNavDrawer: document.getElementById('sideNavDrawer'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    filterKelas: document.getElementById('filterKelas'),
    btnInputData: document.getElementById('btnInputData'),
    inputDataModal: document.getElementById('inputDataModal'),
    closeInputModal: document.getElementById('closeInputModal'),
    btnSaveManualData: document.getElementById('btnSaveManualData'),
    labelKategori: document.getElementById('labelKategori'),
    tabBtns: document.querySelectorAll('.tab-btn'),

    // Form Setup
    setupCategoryLabel: document.getElementById('setupCategoryLabel'),
    setupKelas: document.getElementById('setupKelas'),
    setupMapel: document.getElementById('setupMapel'),

    // Workspace
    wsCameraInput: document.getElementById('wsCameraInput'),
    wsScanPreview: document.getElementById('wsScanPreview'),
    wsImgPreview: document.getElementById('wsImgPreview'),
    btnWsProcessScan: document.getElementById('btnWsProcessScan'),
    wsScanningOverlay: document.getElementById('wsScanningOverlay'),
    btnSaveWsKey: document.getElementById('btnSaveWsKey'),
    setupDate: document.getElementById('setupDate'),
    setupUrutan: document.getElementById('setupUrutan'),
    prefLang: document.getElementById('prefLang'),
    btnCloseAiModal: document.getElementById('btnCloseAiModal')
};

const TRANSLATIONS = {
    id: {
        'sikoreksi-title': 'LEMBAR JAWABAN',
        'master-title': 'LEMBAR MASTER KUNCI JAWABAN',
        'subject-label': 'MATA PELAJARAN',
        'name-label': 'Nama',
        'nisn-label': 'NISN',
        'class-label': 'Kelas',
        'date-label': 'Tanggal',
        'instructions-label': 'PILIH SATU JAWABAN YANG BENAR',
        'correct-example': 'CONTOH BENAR',
        'wrong-example': 'CONTOH SALAH',
        'footer-text': 'Pindai Lembar Ini Menggunakan SI-KORESI',
        'cat-tugas': 'Tugas', 'cat-uh': 'Ulangan Harian', 'cat-uts': 'UTS', 'cat-uas': 'UAS', 'cat-ujian': 'Ujian',
        'p-school-addr': 'Alamat Sekolah',
        'p-school-logo': 'Logo Sekolah (Transparan)',
        'p-logo-hint': 'Gunakan format PNG transparan agar rapi di Si-Koreksi.',
        'nav-home': 'Beranda Dashboard', 'nav-results': 'Rekap & Laporan', 'nav-profile': 'Profil Guru', 'nav-settings': 'Pengaturan API', 'nav-logout': 'Keluar Sesi',
        'header-profile': 'Profil', 'dash-subtitle': 'Pilih kategori penilaian untuk memulai',
        'alert-profile-saved': 'Profil dan preferensi berhasil diperbarui!',
        'alert-fill-class-subject': 'Silakan isi Kelas dan Mata Pelajaran!',
        'alert-popup-blocked': 'Pop-up terblokir. Izinkan pop-up untuk mencetak.',
        'greet-morning': 'Selamat Pagi', 'greet-noon': 'Selamat Siang', 'greet-evening': 'Selamat Sore', 'greet-night': 'Selamat Malam',
        'theme-title': 'Tema Tampilan', 'theme-hint': 'Pilih mode yang nyaman untuk mata Anda.',
        'lang-title': 'Bahasa Aplikasi', 'btn-save-changes': 'Simpan Perubahan',
        'p-subject-main': 'Mata Pelajaran Utama', 'teacher-name': 'Pak Guru',
        'btn-back': 'Kembali', 'setup-title-prefix': 'Persiapan', 'setup-class': 'Kelas', 'setup-subject': 'Mata Pelajaran', 'setup-date': 'Tanggal Ujian',
        'btn-enter-workspace': 'Masuk ke Ruang Ujian', 'btn-change-setup': 'Ganti Kelas / Mapel',
        'ws-key-title': '1. Kunci Jawaban', 'ws-key-desc': 'Tentukan format opsi dan pilih jawaban untuk setiap nomor.',
        'ws-format': 'Format', 'ws-questions-count': 'Jml Soal', 'ws-weight-correct': 'Bobot Benar', 'ws-weight-wrong': 'Bobot Salah',
        'btn-save-key': 'Simpan Kunci Jawaban', 'ws-print-title': '2. Cetak Lembar', 'btn-print-sikoreksi': 'Cetak Lembar Soal',
        'btn-print-master': 'Cetak Lembar Master', 'ws-scan-title': '3. Pindai Lembar Siswa',
        'app-mode-custom': 'Custom (Akun Anda)',
        'btn-close': 'Tutup', 'btn-download': 'Simpan TXT', 'btn-save-confirm': 'Simpan Nilai',
        'alert-download-success': 'Laporan berhasil diunduh!',
        'setup-sequence': 'Urutan ke (Contoh: 1)',
        'results-select-class': 'Pilih Kelas',
        'results-select-desc': 'Pilih kelas untuk melihat data detail.',
        'col-student': 'SISWA', 'col-mapel': 'MATA PELAJARAN', 'col-skor': 'SKOR', 'col-tanggal': 'TANGGAL',
        'alert-delete-confirm': 'Apakah Anda yakin ingin menghapus data ini?',
        'group-sequence-prefix': 'Urutan ke-',
        'alert-no-image': 'Silakan ambil foto atau upload PDF Si-Koreksi terlebih dahulu!'
    },
    en: {
        'sikoreksi-title': 'ANSWER SHEET',
        'master-title': 'ANSWER KEY MASTER SHEET',
        'subject-label': 'SUBJECT',
        'name-label': 'Name',
        'nisn-label': 'NISN/ID',
        'class-label': 'Class',
        'date-label': 'Date',
        'instructions-label': 'CHOOSE THE CORRECT ANSWER',
        'correct-example': 'CORRECT',
        'wrong-example': 'INCORRECT',
        'footer-text': 'Scan This Sheet Using SI-KORESI',
        'cat-tugas': 'Assignment', 'cat-uh': 'Daily Test', 'cat-uts': 'Midterm', 'cat-uas': 'Final Exam', 'cat-ujian': 'Exam',
        'p-school-addr': 'School Address',
        'p-school-logo': 'School Logo (Transparent)',
        'p-logo-hint': 'Use transparent PNG format for better Si-Koreksi appearance.',
        'nav-home': 'Dashboard Home', 'nav-results': 'Recap & Reports', 'nav-profile': 'Teacher Profile', 'nav-settings': 'API Settings', 'nav-logout': 'Logout',
        'header-profile': 'Profile', 'dash-subtitle': 'Choose assessment category to start',
        'alert-profile-saved': 'Profile and preferences updated successfully!',
        'alert-fill-class-subject': 'Please fill in Class and Subject!',
        'alert-popup-blocked': 'Popup blocked. Please allow popups to print.',
        'greet-morning': 'Good Morning', 'greet-noon': 'Good Afternoon', 'greet-evening': 'Good Evening', 'greet-night': 'Good Night',
        'theme-title': 'Display Theme', 'theme-hint': 'Choose a mode that is comfortable for your eyes.',
        'lang-title': 'App Language', 'btn-save-changes': 'Save Changes',
        'p-subject-main': 'Primary Subject', 'teacher-name': 'Teacher',
        'btn-back': 'Back', 'setup-title-prefix': 'Preparation', 'setup-class': 'Class', 'setup-subject': 'Subject', 'setup-date': 'Exam Date',
        'btn-enter-workspace': 'Enter Workspace', 'btn-change-setup': 'Change Class / Subject',
        'ws-key-title': '1. Answer Key', 'ws-key-desc': 'Set option format and select answers for each number.',
        'ws-format': 'Format', 'ws-questions-count': 'Questions Count', 'ws-weight-correct': 'Correct Weight', 'ws-weight-wrong': 'Wrong Weight',
        'btn-save-key': 'Save Answer Key', 'ws-print-title': '2. Print Sheets', 'btn-print-sikoreksi': 'Print Student Question Sheet',
        'btn-print-master': 'Print Master Key', 'ws-scan-title': '3. Scan Student Sheets',
        'app-mode-custom': 'Custom (Your Account)',
        'btn-close': 'Close', 'btn-download': 'Save TXT', 'btn-save-confirm': 'Confirm Save',
        'alert-download-success': 'Report downloaded successfully!',
        'setup-sequence': 'Sequence No. (e.g., 1)',
        'results-select-class': 'Select Class',
        'results-select-desc': 'Choose a class to view detailed data.',
        'col-student': 'STUDENT', 'col-mapel': 'SUBJECT', 'col-skor': 'SCORE', 'col-tanggal': 'DATE',
        'alert-delete-confirm': 'Are you sure you want to delete this record?',
        'group-sequence-prefix': 'Sequence No.',
        'alert-no-image': 'Please take a photo or upload a PDF Si-Koreksi first!'
    }
};

function updateLanguage() {
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerText = dict[key];
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    initNavigation();
    loadRecentActivity();
    setupEventListeners();
    initStatsChart();

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (el.setupDate) el.setupDate.value = today;
    const elInputDate = document.getElementById('inputTanggal');
    if (elInputDate) elInputDate.value = today;

    ['setGroqKey', 'setFirebaseKey'].forEach(id => {
        const val = localStorage.getItem(id);
        if (val && el[id]) el[id].value = val;
    });

    initPasswordToggles();
    updateAppModeBadge();
    loadProfileAndSettings();
    updateLanguage();
    initAuthObserver();
    populateClassDropdowns(); // Isi dropdown kelas dari data yang tersimpan
    updateDashboardStats();   // Update statistik di stat bar
});

function updateDashboardStats() {
    const totalScans = STATE.allHasilOMR.length;
    const classes = getClasses ? getClasses() : [];
    const students = JSON.parse(localStorage.getItem(userKey('student_data'))) || {};
    const totalSiswa = Object.values(students).reduce((acc, arr) => acc + arr.length, 0);

    const elScans = document.getElementById('statTotalScans');
    const elKelas = document.getElementById('statTotalKelas');
    const elSiswa = document.getElementById('statTotalSiswa');
    if (elScans) elScans.textContent = totalScans;
    if (elKelas) elKelas.textContent = classes.length;
    if (elSiswa) elSiswa.textContent = totalSiswa;
}

function updateAppModeBadge() {
    if (!el.appModeBadge) return;
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;

    if (STATE.user && STATE.user.uid !== 'guest') {
        el.appModeBadge.innerText = "Akun Pribadi";
        el.appModeBadge.className = "badge-sm success";
    } else {
        el.appModeBadge.innerText = dict['app-mode-custom'] || "Mode Tamu";
        el.appModeBadge.className = "badge-sm warning";
    }
}

function updateGreeting() {
    const hours = new Date().getHours();
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;

    let greeting = dict['greet-night'];
    if (hours < 11) greeting = dict['greet-morning'];
    else if (hours < 15) greeting = dict['greet-noon'];
    else if (hours < 19) greeting = dict['greet-evening'];

    if (el.greetingMsg) {
        // Ambil nama depan saja dari profil
        const fullName = localStorage.getItem('profName') || dict['teacher-name'] || 'Pak Guru';
        const firstName = fullName.split(' ')[0]; // Ambil nama paling depan
        el.greetingMsg.innerText = `${greeting}, ${firstName}!`;
    }
    // Update juga subtitle dinamis
    const subEl = document.getElementById('dashSubtitle');
    if (subEl) {
        const fullName = localStorage.getItem('profName') || '';
        subEl.innerText = fullName ? `Kelola penilaian siswa Anda dengan mudah.` : 'Pilih kategori penilaian untuk memulai.';
    }
}

function initNavigation() {
    const allNavItems = [...el.navItems, ...el.sideNavItems];
    allNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
        });
    });
}

window.switchView = function (viewId) {
    STATE.currentView = viewId;
    toggleSideNav(false);

    const allNavItems = [...el.navItems, ...el.sideNavItems];
    allNavItems.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
    });

    el.views.forEach(view => {
        view.classList.toggle('hidden', view.id !== `view-${viewId}`);
    });

    if (viewId === 'results') loadFullResults();
    if (viewId === 'students') initStudentsView();
    if (viewId === 'setup') populateClassDropdowns();
};

function setupEventListeners() {
    if (el.wsCameraInput) el.wsCameraInput.addEventListener('change', handleCameraCapture);
    if (el.btnWsProcessScan) el.btnWsProcessScan.addEventListener('click', processWithAI);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });
    if (el.btnConfirmResult) el.btnConfirmResult.addEventListener('click', confirmAndSave);
    if (el.btnDownloadResult) el.btnDownloadResult.addEventListener('click', downloadResultAsTxt);
    if (el.btnCloseAiModal) {
        el.btnCloseAiModal.addEventListener('click', () => {
            el.aiModal.classList.add('hidden');
            if (typeof resetWsScanner === 'function') resetWsScanner();
        });
    }
    if (el.btnSaveWsKey) el.btnSaveWsKey.addEventListener('click', handleSaveNewKey);

    if (el.btnSaveConfig) el.btnSaveConfig.addEventListener('click', handleSaveAPIConfig);
    if (el.btnResetTrial) el.btnResetTrial.addEventListener('click', handleResetTrial);

    if (el.hamburgerBtn) el.hamburgerBtn.addEventListener('click', () => toggleSideNav(true));
    if (el.sidebarOverlay) el.sidebarOverlay.addEventListener('click', () => toggleSideNav(false));

    const btnExcel = document.getElementById('btnExcel');
    const btnPdf = document.getElementById('btnPdf');
    if (btnExcel) btnExcel.addEventListener('click', exportToExcel);
    if (btnPdf) btnPdf.addEventListener('click', () => window.print());

    // Settings New Listeners
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    if (btnSaveProfile) btnSaveProfile.addEventListener('click', saveProfileData);

    const logoInput = document.getElementById('profLogoInput');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    localStorage.setItem('profLogo', ev.target.result);
                    // Preview removed as per request
                };
                reader.readAsDataURL(file);
            }
        });
    }
    // Theme Toggle
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setAppTheme(theme);
        });
    });

    ['mapelName', 'className', 'keyKategori', 'keySequence', 'weightCorrect', 'weightWrong'].forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        const saved = localStorage.getItem(`draft_${id}`);
        if (saved) input.value = saved;
        input.addEventListener('input', (e) => localStorage.setItem(`draft_${id}`, e.target.value));
    });

    // Laporan tab events
    if (el.tabBtns) {
        el.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                el.tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'var(--surface)';
                    b.style.color = 'var(--text-color)';
                });
                e.target.classList.add('active');
                e.target.style.background = 'var(--primary)';
                e.target.style.color = 'white';
                STATE.kategoriAktif = e.target.getAttribute('data-kategori');
                if (el.labelKategori) el.labelKategori.innerText = e.target.innerText;
                if (STATE.activeDetailKelas && STATE.currentView === 'results') {
                    showClassDetail(STATE.activeDetailKelas, STATE.activeDetailMapel);
                }
            });
        });
    }

    const btnBackToClasses = document.getElementById('btnBackToClasses');
    if (btnBackToClasses) {
        btnBackToClasses.addEventListener('click', () => {
            STATE.activeDetailKelas = null;
            STATE.activeDetailMapel = null;
            if (STATE.currentView === 'results') loadFullResults();
        });
    }
    if (el.btnInputData) {
        el.btnInputData.addEventListener('click', () => {
            if (STATE.activeDetailKelas) {
                document.getElementById('inputKelas').value = STATE.activeDetailKelas;
            }
            if (STATE.kategoriAktif) {
                document.getElementById('inputKategori').value = STATE.kategoriAktif;
            }
            if (el.inputDataModal) el.inputDataModal.classList.remove('hidden');
        });
    }
    if (el.closeInputModal) {
        el.closeInputModal.addEventListener('click', () => {
            if (el.inputDataModal) el.inputDataModal.classList.add('hidden');
        });
    }
    if (el.btnSaveManualData) {
        el.btnSaveManualData.addEventListener('click', saveManualData);
    }
}

function toggleSideNav(show) {
    if (!el.sideNavDrawer || !el.sidebarOverlay) return;
    if (show) {
        el.sideNavDrawer.classList.add('active');
        el.sidebarOverlay.classList.add('active');
    } else {
        el.sideNavDrawer.classList.remove('active');
        el.sidebarOverlay.classList.remove('active');
    }
}

function initPasswordToggles() {
    el.togglePassBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = btn.querySelector('ion-icon');
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.name = 'eye-off-outline';
            } else {
                targetInput.type = 'password';
                icon.name = 'eye-outline';
            }
        });
    });
}

function handleSaveAPIConfig() {
    const groqInput = document.getElementById('setGroqKey');
    if (!groqInput || groqInput.value.trim() === '') {
        return alert('Mohon isi API Key terlebih dahulu!');
    }
    // Simpan ke localStorage dengan key standar (tidak per-user, karena ini konfigurasi alat)
    localStorage.setItem('setGroqKey', groqInput.value.trim());
    // Update CONFIG langsung di memori tanpa perlu reload
    if (window.CONFIG) window.CONFIG.GROQ_API_KEY = groqInput.value.trim();
    alert('✅ API Key berhasil disimpan! Anda bisa langsung memulai pemindaian.');
}

function handleResetTrial() {
    if (!confirm('Hapus API Key yang tersimpan?')) return;
    localStorage.removeItem('setGroqKey');
    localStorage.removeItem('setFirebaseKey');
    if (window.CONFIG) window.CONFIG.GROQ_API_KEY = '';
    const groqInput = document.getElementById('setGroqKey');
    if (groqInput) groqInput.value = '';
    alert('API Key telah dihapus.');
}

window.saveQuickGroqKey = function() {
    const val = document.getElementById('quickGroqKey').value;
    if (!val || val.trim() === '') return alert('Mohon masukkan API Key Anda.');
    localStorage.setItem('setGroqKey', val.trim());
    // Update langsung di memori tanpa reload
    if (window.CONFIG) window.CONFIG.GROQ_API_KEY = val.trim();
    alert('API Key berhasil disimpan! Anda bisa melanjutkan pemindaian.');
    document.getElementById('quickGroqKeyContainer').classList.add('hidden');
}


// --- SETTINGS & PROFILE LOGIC ---
function loadProfileAndSettings() {
    // Gunakan userKey() agar data profil terpisah per akun Google
    const fields = ['profName', 'profID', 'profSchool', 'profSchoolAddr', 'profSubject', 'prefRounding', 'prefPerQuestion', 'prefLang', 'prefNotify'];
    fields.forEach(id => {
        const elField = document.getElementById(id);
        if (!elField) return;
        const val = localStorage.getItem(userKey(id));
        if (val !== null) {
            if (elField.type === 'checkbox') elField.checked = val === 'true';
            else elField.value = val;
        } else {
            // Kosongkan field jika tidak ada data untuk akun ini
            if (elField.type === 'checkbox') elField.checked = false;
            else if (elField.tagName !== 'SELECT') elField.value = '';
        }
    });

    // Force light theme on initial load as per user request
    setAppTheme('light');

    // Handle Logo Loading (per akun)
    const savedLogo = localStorage.getItem(userKey('profLogo'));
    if (savedLogo) {
        const preview = document.getElementById('profLogoPreview');
        if (preview) preview.innerHTML = `<img src="${savedLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
    } else {
        const preview = document.getElementById('profLogoPreview');
        if (preview) preview.innerHTML = '';
    }

    syncProfileDisplay();
}

function saveProfileData() {
    // Simpan dengan prefix UID agar terpisah per akun Google
    const fields = ['profName', 'profID', 'profSchool', 'profSchoolAddr', 'profSubject', 'prefRounding', 'prefPerQuestion', 'prefLang', 'prefNotify'];
    fields.forEach(id => {
        const elField = document.getElementById(id);
        if (elField) {
            const val = elField.type === 'checkbox' ? elField.checked : elField.value;
            localStorage.setItem(userKey(id), val);
        }
    });
    syncProfileDisplay();
    updateLanguage();
    const lang = localStorage.getItem(userKey('prefLang')) || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    alert(dict['alert-profile-saved'] || 'Profil berhasil disimpan!');
}

function syncProfileDisplay() {
    // Prioritaskan data Google (dari STATE.user), fallback ke data profil tersimpan
    const googleName   = STATE.user && STATE.user.displayName ? STATE.user.displayName : null;
    const googleEmail  = STATE.user && STATE.user.email       ? STATE.user.email       : null;
    const googlePhoto  = STATE.user && STATE.user.photoURL    ? STATE.user.photoURL    : null;

    const savedName   = localStorage.getItem(userKey('profName'));
    const savedSchool = localStorage.getItem(userKey('profSchool'));

    const displayName   = savedName   || googleName   || 'Pengguna';
    const displaySchool = savedSchool || googleEmail  || '';

    // Auto-isi field profil dari data Google jika masih kosong
    const profNameEl = document.getElementById('profName');
    if (profNameEl && !profNameEl.value && googleName) profNameEl.value = googleName;

    // Update Sidebar (gunakan ID khusus)
    const sidebarName   = document.getElementById('sidebarName')   || document.querySelector('.user-info strong');
    const sidebarEmail  = document.getElementById('sidebarEmail')  || document.querySelector('.user-info p');
    const sidebarAvatar = document.getElementById('sidebarAvatar') || document.querySelector('.avatar-lg');
    const profileAvatar = document.getElementById('profilePageAvatar');

    if (sidebarName)  sidebarName.innerText  = displayName;
    if (sidebarEmail) sidebarEmail.innerText = displaySchool;

    // Update foto profil Google
    if (googlePhoto) {
        const imgHtml = `<img src="${googlePhoto}" alt="Foto Profil" style="width:100%;height:100%;object-fit:cover;border-radius:22px;">`;
        if (sidebarAvatar) sidebarAvatar.innerHTML = imgHtml;
        if (profileAvatar) profileAvatar.innerHTML = imgHtml;
    } else {
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        if (sidebarAvatar) sidebarAvatar.innerText = initials;
        if (profileAvatar) profileAvatar.innerText = initials;
    }
}


function setAppTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
}

// --- MANAGEMENT & WORKSPACE ---

window.openSetup = function (kategori) {
    STATE.kategoriAktif = kategori;
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    if (el.setupCategoryLabel) el.setupCategoryLabel.innerText = dict[`cat-${kategori}`] || dict['cat-ujian'];
    switchView('setup');
}

window.startWorkspace = function () {
    const kelas = el.setupKelas.value;
    const mapel = el.setupMapel.value;
    const urutan = el.setupUrutan ? el.setupUrutan.value : '1';
    const date = el.setupDate ? el.setupDate.value : '';
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    if (!kelas || !mapel) return alert(dict['alert-fill-class-subject']);

    // Set Workspace context
    STATE.activeWorkspace = { kelas, mapel, kategori: STATE.kategoriAktif, tanggal: date, urutan: urutan || '1' };

    // Update headers
    const title = document.getElementById('wsTitle');
    const subtitle = document.getElementById('wsSubtitle');
    if (title) title.innerText = `${kelas} - ${mapel}`;
    if (subtitle) subtitle.innerText = dict[`cat-${STATE.kategoriAktif}`] || dict['cat-ujian'];

    // Clear previous scan state
    resetWsScanner();

    // Check if key already exists, if so load it
    const existingKey = STATE.bankSoal.find(k => k.kelas === kelas && k.mapel === mapel && k.kategori === STATE.kategoriAktif);
    if (existingKey) {
        document.getElementById('wsKeySequence').value = existingKey.sequence || '';
        document.getElementById('wsWeightCorrect').value = existingKey.weight?.correct || 1;
        document.getElementById('wsWeightWrong').value = existingKey.weight?.wrong || 0;

        let totalSoal = 10;
        if (existingKey.sequence) {
            const parts = existingKey.sequence.split(',');
            if (parts.length > 0) totalSoal = parts.length;

            let fmt = 'ABCD';
            if (existingKey.sequence.includes(':E')) fmt = 'ABCDE';
            else if (!existingKey.sequence.includes(':D') && !existingKey.sequence.includes(':E') && existingKey.sequence.includes(':C')) fmt = 'ABC';
            document.getElementById('wsKeyFormat').value = fmt;
        }
        document.getElementById('wsKeyLength').value = Math.max(1, totalSoal);
        STATE.activeKeyId = existingKey.id;
    } else {
        document.getElementById('wsKeySequence').value = '';
        document.getElementById('wsWeightCorrect').value = 1;
        document.getElementById('wsWeightWrong').value = 0;
        document.getElementById('wsKeyLength').value = 10;
        document.getElementById('wsKeyFormat').value = 'ABCD';
        STATE.activeKeyId = null;
    }

    generateKeyGrid();
    switchView('workspace');
}

window.generateKeyGrid = function () {
    const format = document.getElementById('wsKeyFormat').value || 'ABCD';
    const length = parseInt(document.getElementById('wsKeyLength').value) || 10;
    const container = document.getElementById('wsKeyGridContainer');

    const seqData = document.getElementById('wsKeySequence').value;
    let existingAnswers = {};
    if (seqData) {
        seqData.split(',').forEach(item => {
            const parts = item.split(':');
            if (parts.length === 2) {
                existingAnswers[parts[0].trim()] = parts[1].trim();
            }
        });
    }

    const options = format.split('');
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    for (let i = 1; i <= length; i++) {
        let optionsHtml = options.map(opt => {
            const isChecked = existingAnswers[i] == opt;
            const bg = isChecked ? 'var(--primary)' : 'transparent';
            const color = isChecked ? 'white' : 'inherit';
            const brd = isChecked ? 'var(--primary)' : '#cbd5e1';
            return `<div onclick="selectKeyOption(${i}, '${opt}')" id="opt-${i}-${opt}" data-selected="${isChecked}" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid ${brd}; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.95rem; font-weight: 600; background: ${bg}; color: ${color}; transition: 0.2s; user-select: none;">${opt}</div>`;
        }).join('');

        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: var(--shadow-sm);">
                <span style="font-weight: 700; width: 40px; font-size: 1.1rem; color: var(--text-secondary);">${i}.</span>
                <div style="display: flex; gap: 10px;">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

window.selectKeyOption = function (qNum, opt) {
    const format = document.getElementById('wsKeyFormat').value || 'ABCD';
    const options = format.split('');
    options.forEach(o => {
        const el = document.getElementById(`opt-${qNum}-${o}`);
        if (el) {
            el.style.background = 'transparent';
            el.style.color = 'inherit';
            el.style.borderColor = '#cbd5e1';
            el.dataset.selected = 'false';
        }
    });

    const selEl = document.getElementById(`opt-${qNum}-${opt}`);
    if (selEl) {
        selEl.style.background = 'var(--primary)';
        selEl.style.color = 'white';
        selEl.style.borderColor = 'var(--primary)';
        selEl.dataset.selected = 'true';
    }

    updateKeySequenceFromGrid();
}

window.updateKeySequenceFromGrid = function () {
    const length = parseInt(document.getElementById('wsKeyLength').value) || 10;
    const format = document.getElementById('wsKeyFormat').value || 'ABCD';
    const options = format.split('');
    let seq = [];

    for (let i = 1; i <= length; i++) {
        let ans = '';
        for (let o of options) {
            const el = document.getElementById(`opt-${i}-${o}`);
            if (el && el.dataset.selected === 'true') {
                ans = o;
                break;
            }
        }
        if (ans) {
            seq.push(`${i}:${ans}`);
        }
    }
    document.getElementById('wsKeySequence').value = seq.join(', ');
}

window.printSiKoreksi = function (type) {
    let length = parseInt(document.getElementById('wsKeyLength').value) || 10;
    if (length > 50) length = 50;

    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;

    const format = document.getElementById('wsKeyFormat').value || 'ABCD';
    const options = format.split('');
    const mapel = el.setupMapel.value || 'Mapel';
    const kelas = el.setupKelas.value || 'Kelas';
    const kategoriLabel = dict[`cat-${STATE.kategoriAktif}`] || 'Exam';

    const seqData = document.getElementById('wsKeySequence').value;
    let existingAnswers = {};
    if (seqData && type === 'master') {
        seqData.split(',').forEach(item => {
            const parts = item.split(':');
            if (parts.length === 2) {
                existingAnswers[parts[0].trim()] = parts[1].trim();
            }
        });
    }

    const tmpl = document.getElementById('printTemplate');
    if (!tmpl) return;

    const schoolName = localStorage.getItem(userKey('profSchool')) || '';
    const schoolAddr = localStorage.getItem(userKey('profSchoolAddr')) || '';
    const schoolLogo = localStorage.getItem(userKey('profLogo')) || '';

    let titleMain = type === 'master' ? dict['master-title'] : `${dict['sikoreksi-title']} ${kategoriLabel.toUpperCase()}`;

    // Tighten the grid to fit more columns if there's less space, or smaller gaps
    // Sistem hitung ke bawah: Kita hitung jumlah baris yang dibutuhkan
    const colsCount = 4;
    const rowsCount = Math.ceil(length / colsCount);

    let bubblesHtml = `<div style="display: grid; grid-template-columns: repeat(${colsCount}, 1fr); grid-auto-flow: column; grid-template-rows: repeat(${rowsCount}, auto); column-gap: 15px; row-gap: 8px;">`;

    // Kita perlu mengisi grid berdasarkan index asli agar urutannya ke bawah
    // CSS grid-auto-flow: column + grid-template-rows akan menangani ini secara otomatis
    for (let i = 1; i <= length; i++) {
        let optsHtml = options.map(opt => {
            const isFilled = existingAnswers[i] == opt;
            const bg = isFilled ? 'black' : 'transparent';
            const col = isFilled ? 'white' : 'black';
            return `<div style="width: 18px; height: 18px; border: 2px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; margin-right: 4px; background: ${bg}; color: ${col};">${opt}</div>`;
        }).join('');

        bubblesHtml += `
            <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; width: 25px; font-size: 12px;">${i}.</span>
                <div style="display: flex;">${optsHtml}</div>
            </div>
        `;
    }
    bubblesHtml += '</div>';

    let html = `
        <div style="padding: 30px; border: 4px solid black; position: relative;">
            <!-- Fiducial markers -->
            <div style="position: absolute; top: 10px; left: 10px; width: 25px; height: 25px; background: black;"></div>
            <div style="position: absolute; top: 10px; right: 10px; width: 25px; height: 25px; background: black;"></div>
            <div style="position: absolute; bottom: 10px; left: 10px; width: 25px; height: 25px; background: black;"></div>
            <div style="position: absolute; bottom: 10px; right: 10px; width: 25px; height: 25px; background: black;"></div>
            
            <div style="text-align: center; margin-bottom: 20px; padding-top: 5px; position: relative; min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-bottom: 3px double black; padding-bottom: 10px;">
                ${schoolLogo ? `<img src="${schoolLogo}" style="position: absolute; left: 10px; top: 0; height: 75px; width: auto; max-width: 80px; object-fit: contain;">` : ''}
                ${schoolName ? `<h3 style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">${schoolName}</h3>` : ''}
                ${schoolAddr ? `<p style="font-family: Arial, sans-serif; font-size: 11px; margin: 2px 0; max-width: 80%;">${schoolAddr}</p>` : ''}
                <h1 style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase;">${titleMain}</h1>
            </div>
            <div style="text-align: center; margin-top: 10px; margin-bottom: 20px;">
                <h2 style="font-family: Arial, sans-serif; font-size: 18px; font-weight: normal; margin: 0;">${dict['subject-label']}: ${mapel}</h2>
            </div>
            
            <div style="border: 1px solid black; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: Arial, sans-serif; font-size: 13px;">
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['name-label']}: .................................................</div>
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['nisn-label']}: .......................</div>
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['class-label']}: ${kelas}</div>
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['date-label']}: ${STATE.activeWorkspace?.tanggal || '...................'}</div>
            </div>
            
            <!-- Panduan Pengisian -->
            <div style="margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 11px; display: flex; gap: 30px; align-items: center; justify-content: center; border: 1px dashed black; padding: 10px;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <b>${dict['correct-example']}</b> 
                    <div style="width: 16px; height: 16px; background: black; border: 2px solid black; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">A</div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <b>${dict['wrong-example']}</b>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 16px; height: 16px; border: 2px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; position: relative;">A<div style="position: absolute; color: black; font-weight: bold;">✕</div></div>
                        <div style="width: 16px; height: 16px; border: 2px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; position: relative;">B<div style="position: absolute; color: black; font-weight: bold;">✓</div></div>
                        <div style="width: 16px; height: 16px; border: 2px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; overflow: hidden;"><div style="width: 100%; height: 50%; background: black; align-self: flex-start;"></div>C</div>
                    </div>
                </div>
            </div>

            <div style="border: 2px solid black; padding: 25px; font-family: Arial, sans-serif;">
                <h3 style="margin-top: 0; margin-bottom: 15px; text-transform: uppercase;">${dict['instructions-label']}</h3>
                ${bubblesHtml}
            </div>
            
            <p style="text-align: center; margin-top: 20px; font-size: 11px; font-weight: bold; font-family: Arial, sans-serif;">${dict['footer-text']}</p>
        </div>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert(dict['alert-popup-blocked']);

    let finalHtml = '';
    const studentsInClass = (type === 'bulk') ? (STATE.students[kelas] || []) : [null];

    if (type === 'bulk' && studentsInClass.length === 0) {
        printWindow.close();
        return alert(`Data siswa untuk kelas ${kelas} belum ada. Silakan input di menu Data Siswa.`);
    }

    studentsInClass.forEach((student, idx) => {
        const studentName = student ? student.name : '.................................................';
        const studentID = student ? student.id : '.......................';

        finalHtml += `
            <div class="print-page" style="padding: 20px; border: 4px solid black; position: relative; height: 260mm; box-sizing: border-box; ${idx > 0 ? 'page-break-before: always; margin-top: 20px;' : ''}">
                <div style="position: absolute; top: 10px; left: 10px; width: 25px; height: 25px; background: black;"></div>
                <div style="position: absolute; top: 10px; right: 10px; width: 25px; height: 25px; background: black;"></div>
                <div style="position: absolute; bottom: 10px; left: 10px; width: 25px; height: 25px; background: black;"></div>
                <div style="position: absolute; bottom: 10px; right: 10px; width: 25px; height: 25px; background: black;"></div>
                
                <div style="text-align: center; margin-bottom: 20px; padding-top: 5px; position: relative; min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-bottom: 3px double black; padding-bottom: 10px;">
                    ${schoolLogo ? `<img src="${schoolLogo}" style="position: absolute; left: 10px; top: 0; height: 75px; width: auto; max-width: 80px; object-fit: contain;">` : ''}
                    <h3 style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">${schoolName}</h3>
                    <p style="font-family: Arial, sans-serif; font-size: 11px; margin: 2px 0; max-width: 80%;">${schoolAddr}</p>
                    <h1 style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase;">${titleMain}</h1>
                </div>

                <div style="text-align: center; margin-top: 10px; margin-bottom: 20px;">
                    <h2 style="font-family: Arial, sans-serif; font-size: 18px; font-weight: normal; margin: 0;">${dict['subject-label']}: ${mapel}</h2>
                </div>
                
                <div style="border: 1px solid black; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: Arial, sans-serif; font-size: 13px;">
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['name-label']}: <b>${studentName}</b></div>
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['nisn-label']}: <b>${studentID}</b></div>
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['class-label']}: ${kelas}</div>
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dict['date-label']}: ${STATE.activeWorkspace?.tanggal || '...................'}</div>
                </div>
                
                <div style="margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 11px; display: flex; gap: 30px; align-items: center; justify-content: center; border: 1px dashed black; padding: 10px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <b>${dict['correct-example']}</b> 
                        <div style="width: 16px; height: 16px; background: black; border: 2px solid black; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">A</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <b>${dict['wrong-example']}</b>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <div style="width: 16px; height: 16px; border: 2px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; position: relative;">A<div style="position: absolute; color: black; font-weight: bold;">✕</div></div>
                            <div style="width: 16px; height: 16px; border: 2px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; position: relative;">B<div style="position: absolute; color: black; font-weight: bold;">✓</div></div>
                        </div>
                    </div>
                </div>

                <div style="border: 2px solid black; padding: 25px; font-family: Arial, sans-serif;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; text-transform: uppercase;">${dict['instructions-label']}</h3>
                    ${bubblesHtml}
                </div>
                
                <p style="text-align: center; margin-top: 20px; font-size: 11px; font-weight: bold; font-family: Arial, sans-serif;">${dict['footer-text']}</p>
            </div>
        `;
    });

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Cetak Si-Koreksi - ${mapel} ${kelas}</title>
                <style>
                    body { margin: 0; padding: 0; background: white; color: black; }
                    .print-page { width: 210mm; margin: 0 auto; box-sizing: border-box; }
                    * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { size: A4; margin: 0; }
                    @media print {
                        body { padding: 0; }
                        .print-page { border: none !important; }
                    }
                </style>
            </head>
            <body>
                ${finalHtml}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// --- STUDENT MANAGEMENT ---
function initStudentsView() {
    const classSelect = document.getElementById('studentClassSelect');
    if (!classSelect) return;

    // Get unique classes from bankSoal and existing students
    const classes = new Set();
    STATE.bankSoal.forEach(k => classes.add(k.kelas));
    Object.keys(STATE.students).forEach(c => classes.add(c));

    classSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
        Array.from(classes).sort().map(c => `<option value="${c}">${c}</option>`).join('');

    // Load first if possible
    if (classes.size > 0) {
        classSelect.value = Array.from(classes)[0];
        loadStudentList();
    }
}

function loadStudentList() {
    const className = document.getElementById('studentClassSelect').value;
    const body = document.getElementById('studentListBody');
    const countEl = document.getElementById('studentCount');
    if (!body) return;

    const list = STATE.students[className] || [];
    countEl.innerText = `${list.length} Siswa`;
    document.getElementById('studentListTitle').innerText = className ? `Daftar Siswa : ${className}` : 'Daftar Siswa';

    body.innerHTML = list.length === 0
        ? '<tr><td colspan="3" class="text-center">Belum ada data siswa untuk kelas ini.</td></tr>'
        : list.map((s, idx) => `
            <tr>
                <td><b>${s.name}</b></td>
                <td>${s.id || '-'}</td>
                <td class="text-right">
                    <button class="btn-icon danger" onclick="deleteStudentItem('${className}', ${idx})">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </td>
            </tr>
        `).join('');
}

function openBulkImportModal() {
    const className = document.getElementById('studentClassSelect').value;
    if (!className) return alert('Pilih kelas terlebih dahulu!');
    document.getElementById('bulkStudentInput').value = '';
    document.getElementById('studentImportModal').classList.remove('hidden');
}

function processBulkImport() {
    const className = document.getElementById('studentClassSelect').value;
    const input = document.getElementById('bulkStudentInput').value;
    if (!input.trim()) return alert('Input tidak boleh kosong!');

    const lines = input.split('\n');
    const newList = [];

    lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(/[;|,]/);
        newList.push({
            name: parts[0].trim(),
            id: parts[1] ? parts[1].trim() : ''
        });
    });

    if (!STATE.students[className]) STATE.students[className] = [];
    STATE.students[className] = [...STATE.students[className], ...newList];

    localStorage.setItem(userKey('student_data'), JSON.stringify(STATE.students));
    document.getElementById('studentImportModal').classList.add('hidden');
    loadStudentList();
    alert(`Berhasil mengimpor ${newList.length} siswa!`);
}

function deleteStudentItem(className, index) {
    if (!confirm('Hapus siswa ini?')) return;
    STATE.students[className].splice(index, 1);
    localStorage.setItem(userKey('student_data'), JSON.stringify(STATE.students));
    loadStudentList();
}

function handleSaveNewKey() {
    if (!STATE.activeWorkspace) return alert('Sesi workspace tidak aktif.');

    const { mapel, kelas, kategori } = STATE.activeWorkspace;
    const sequence = document.getElementById('wsKeySequence').value;
    const weightCorrect = document.getElementById('wsWeightCorrect').value;
    const weightWrong = document.getElementById('wsWeightWrong').value;

    if (!sequence) return alert('Silakan isi Kunci Jawaban!');

    const newKey = {
        id: STATE.activeKeyId || Date.now(),
        mapel,
        kelas,
        kategori,
        sequence,
        weight: {
            correct: weightCorrect,
            wrong: weightWrong
        }
    };

    if (STATE.activeKeyId) {
        const idx = STATE.bankSoal.findIndex(k => k.id === STATE.activeKeyId);
        if (idx !== -1) STATE.bankSoal[idx] = newKey;
    } else {
        STATE.bankSoal.push(newKey);
        STATE.activeKeyId = newKey.id;
    }

    localStorage.setItem(userKey('bank_soal'), JSON.stringify(STATE.bankSoal));
    alert('Kunci Jawaban berhasil disimpan!');
}

// --- SCANNING & OPTIMIZATION ---
async function pdfToImageArray(pdfData) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData) });
    const pdf = await loadingTask.promise;
    const images = [];
    const maxPages = Math.min(pdf.numPages, 10); // Safe limit

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Lower scale for batch to avoid payload size error

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    }
    return images;
}

async function compressAndResize(base64Str, maxWidth = 1200) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width *= maxWidth / height;
                    height = maxWidth;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Kompres ke JPEG 80% (Keseimbangan speed & detail)
            const result = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            resolve(result);
        };
        img.src = base64Str;
    });
}

async function handleCameraCapture(e) {
    const file = e.target.files[0];
    if (!file) return;

    STATE.scannedMimeType = file.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg';
    STATE.isCompressing = true;

    const reader = new FileReader();
    reader.onload = async (event) => {
        let imageData = event.target.result;

        if (STATE.scannedMimeType === 'image/jpeg') {
            const scanPrompt = document.getElementById('wsScanPrompt');
            if (scanPrompt) scanPrompt.innerText = "Mengompresi Gambar...";
            STATE.scannedImage = await compressAndResize(imageData);
            STATE.scannedImages = []; // Reset batch images
            if (scanPrompt) scanPrompt.innerText = "Ketuk Layar Untuk Memotret / Upload PDF";
        } else {
            // Untuk PDF, simpan base64 murni dan buat preview image
            const scanPrompt = document.getElementById('wsScanPrompt');
            if (scanPrompt) scanPrompt.innerText = "Mengolah PDF...";
            const base64Pdf = imageData.substring(imageData.indexOf(',') + 1);
            STATE.scannedImage = base64Pdf;
            try {
                STATE.scannedImages = await pdfToImageArray(base64Pdf);
                STATE.scannedImageAsJpg = STATE.scannedImages[0]; // First page for preview
            } catch (err) {
                console.error("PDF to Image failed:", err);
            }
            if (scanPrompt) scanPrompt.innerText = `PDF: ${STATE.scannedImages.length} Halaman Terdeteksi`;
        }

        STATE.isCompressing = false;
        // UI Handling
        const inputArea = document.getElementById('wsInputArea');
        const previewArea = document.getElementById('wsScanPreview');
        const controlsArea = document.getElementById('wsScanControls');
        const imgPreview = document.getElementById('wsImgPreview');
        const pdfPreview = document.getElementById('wsPdfPreview');

        if (inputArea) inputArea.classList.add('hidden');
        if (previewArea) previewArea.classList.remove('hidden');
        if (controlsArea) controlsArea.classList.remove('hidden');

        if (STATE.scannedMimeType === 'application/pdf') {
            if (imgPreview) {
                imgPreview.src = 'data:image/jpeg;base64,' + STATE.scannedImageAsJpg;
                imgPreview.classList.remove('hidden');
            }
            if (pdfPreview) pdfPreview.classList.add('hidden'); // Sembunyikan icon PDF, pakai preview image
        } else {
            if (imgPreview) {
                imgPreview.src = event.target.result;
                imgPreview.classList.remove('hidden');
            }
            if (pdfPreview) pdfPreview.classList.add('hidden');
        }
    };
    reader.readAsDataURL(file);
}

window.resetWsScanner = function () {
    const inputArea = document.getElementById('wsInputArea');
    const previewArea = document.getElementById('wsScanPreview');
    const controlsArea = document.getElementById('wsScanControls');

    if (inputArea) inputArea.classList.remove('hidden');
    if (previewArea) previewArea.classList.add('hidden');
    if (controlsArea) controlsArea.classList.add('hidden');

    if (el.wsCameraInput) el.wsCameraInput.value = '';
    STATE.scannedImage = null;
    STATE.scannedMimeType = null;
};

function updateQuotaUI(status) {
    const dot = document.getElementById('quotaDot');
    const text = document.getElementById('quotaText');
    if (!dot || !text) return;

    if (status === 'green') {
        dot.style.background = '#22c55e';
        text.innerText = 'Sistem Siap (Lancar)';
    } else if (status === 'red') {
        dot.style.background = '#ef4444';
        text.innerText = 'Limit Tercapai (Tunggu 1 Menit)';
        // Reset kembali ke hijau setelah 60 detik
        setTimeout(() => updateQuotaUI('green'), 60000);
    }
}

async function processWithAI() {
    if (CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY.trim() !== "") {
        return processWithGroq();
    } else {
        const qc = document.getElementById('quickGroqKeyContainer');
        if (qc) {
            qc.classList.remove('hidden');
            const qi = document.getElementById('quickGroqKey');
            if(qi) qi.focus();
        } else {
            alert("Harap masukkan API Key Groq di menu Pengaturan terlebih dahulu.");
            switchView('settings');
        }
    }
}

async function processWithGroq() {
    if (!STATE.activeKeyId) return alert('Silakan Simpan Kunci Jawaban terlebih dahulu sebelum memindai!');
    if (!STATE.scannedImage) return alert('Silakan ambil foto atau upload PDF Si-Koreksi terlebih dahulu!');
    if (STATE.isCompressing) return alert('Mohon tunggu, sedang menyiapkan gambar...');

    const activeKey = STATE.bankSoal.find(k => k.id == STATE.activeKeyId);
    if (!activeKey) return alert('Kunci jawaban tidak ditemukan!');

    let btnProcess = document.getElementById('btnWsProcessScan');
    if (btnProcess) {
        btnProcess.disabled = true;
        btnProcess.innerText = 'Groq Running...';
    }

    let overlay = document.getElementById('wsScanningOverlay');
    if (overlay) overlay.classList.remove('hidden');
    // Tentukan apakah ini single atau batch scan berdasarkan jumlah gambar yang dikirim ke Groq
    let imageContents = [];
    let isBatchScan = false;
    
    // Pastikan kita menggunakan data gambar (Base64 JPG), bukan data PDF mentah
    if (STATE.scannedMimeType === 'application/pdf' && STATE.scannedImages && STATE.scannedImages.length > 0) {
        if (STATE.scannedImages.length > 1) {
            isBatchScan = true;
            imageContents = STATE.scannedImages.map(img => ({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${img}` }
            }));
        } else {
            isBatchScan = false;
            imageContents = [{
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${STATE.scannedImages[0]}` }
            }];
        }
    } else {
        isBatchScan = false;
        imageContents = [{
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${STATE.scannedImage}` }
        }];
    }

    // Prompt yang berbeda untuk single vs batch
    const promptText = isBatchScan
        ? `Analisis SETIAP halaman Si-Koreksi dalam gambar-gambar ini. Satu halaman = satu siswa. Kunci Jawaban: [${activeKey.sequence}]. JSON MURNI TANPA markdown:\n{"results": [{"nama": "nama siswa", "jawaban": [{"no": 1, "deteksi": "A"}, ...]}, ...]}`
        : `Ini adalah 1 lembar Si-Koreksi dari SATU siswa. Kunci Jawaban: [${activeKey.sequence}]. Baca nama siswa dan semua pilihan jawaban yang diisi. Kembalikan hasil dalam format JSON MURNI (tanpa markdown, tanpa kalimat lain):\n{"results": [{"nama": "nama siswa", "jawaban": [{"no": 1, "deteksi": "A"}, ...]}]}`;

    try {
        const apiKey = CONFIG.GROQ_API_KEY;
        const model = "meta-llama/llama-4-scout-17b-16e-instruct";

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            ...imageContents
                        ]
                    }
                ]
            })
        });

        const resData = await response.json();
        if (resData.error) throw new Error(resData.error.message || JSON.stringify(resData.error));

        if (!resData.choices || resData.choices.length === 0) {
            throw new Error("Respons API kosong atau tidak valid.");
        }

        const rawText = resData.choices[0].message.content;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Response Groq tidak berformat JSON. RAW: " + rawText.substring(0, 50));

        const result = JSON.parse(jsonMatch[0]);

        if (result.results && Array.isArray(result.results) && result.results.length > 0) {
            if (!isBatchScan) {
                // SINGLE SCAN: Selalu pakai hanya 1 hasil (yang pertama)
                // Groq kadang mengembalikan duplikat, kita abaikan sisanya
                showAIPreview(result.results[0], activeKey, false, true);
            } else {
                // BATCH SCAN: Proses semua hasil dari multi-halaman PDF
                let count = 0;
                for (const item of result.results) {
                    const keyMap = {};
                    activeKey.sequence.split(',').forEach(it => {
                        const trimmed = it.trim();
                        if(!trimmed) return;
                        const p = trimmed.split(':');
                        if (p.length === 2) keyMap[p[0].trim()] = p[1].trim();
                    });
                    
                    const totalQuestions = Object.keys(keyMap).length;
                    let b = 0;
                    if(item.jawaban) {
                        item.jawaban.forEach(j => { 
                            const studentAns = (j.deteksi || "").trim().toUpperCase();
                            const targetAns = (keyMap[String(j.no).trim()] || "").toUpperCase();
                            if (targetAns && studentAns === targetAns) b++; 
                        });
                    } else { item.jawaban = []; }
                    
                    item.benar = b;
                    const detectedAndMatched = item.jawaban ? item.jawaban.filter(j => keyMap[String(j.no).trim()]).length : 0;
                    const effectiveTotal = detectedAndMatched > 0 ? detectedAndMatched : totalQuestions;
                    item.salah = effectiveTotal - b;
                    item.skor = effectiveTotal > 0 ? ((b / effectiveTotal) * 100).toFixed(1) : 0;

                    const dataToSave = {
                        id: Date.now().toString() + Math.random().toString(36).substring(7),
                        ...item,
                        mapel: activeKey.mapel,
                        kelas: activeKey.kelas,
                        kategori: activeKey.kategori || STATE.kategoriAktif || 'uh',
                        tanggal: new Date().toLocaleDateString('id-ID'),
                        timestamp: Date.now()
                    };
                    saveToRekap(dataToSave);
                    count++;
                }
                alert(`Pemindaian Borongan Berhasil! Tersimpan ${count} lembar jawaban Si-Koreksi.`);
                resetWsScanner();
            }
        } else {
            // Groq returned flat object (no results array)
            showAIPreview(result, activeKey, false, true);
        }
    } catch (error) {
        console.error("Groq Error:", error);
        alert('Gagal memproses via Groq. Pesan: ' + error.message);
    } finally {
        if (btnProcess) {
            btnProcess.disabled = false;
            btnProcess.innerText = 'AI (Pintar)';
        }
        if (overlay) overlay.classList.add('hidden');
    }
}

/**
 * Central function to save results to STATE and LocalStorage with deduplication.
 * If a result for the same student/class/subject exists within 10 seconds, it's replaced.
 */
function saveToRekap(data) {
    const threshold = 10000; // 10 seconds
    const now = Date.now();
    
    // Identifikasi unik data
    const nama = data.nama || "Siswa (Hasil AI)";
    const kelas = data.kelas || "";
    const mapel = data.mapel || "";
    const kategori = data.kategori || "uh";

    // Cari kemiripan data yang baru masuk (dalam 10 detik terakhir)
    const duplicateIdx = STATE.allHasilOMR.findIndex(item => 
        item.nama === nama &&
        item.kelas === kelas &&
        item.mapel === mapel &&
        item.kategori === kategori &&
        Math.abs((item.timestamp || 0) - now) < threshold
    );

    if (duplicateIdx !== -1) {
        // Ganti data lama dengan yang baru (permintaan user: "hapus data pertama dan data yang dikirim terakhir yang disimpan")
        console.log("[Deduplication] Mengganti data ganda untuk:", nama);
        // Pertahankan ID lama agar tidak merusak list jika sedang dibuka
        const oldId = STATE.allHasilOMR[duplicateIdx].id;
        STATE.allHasilOMR[duplicateIdx] = { ...data, id: oldId, timestamp: now };
    } else {
        // Tambah baru
        STATE.allHasilOMR.unshift({ ...data, timestamp: now });
    }
    
    localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
}

function showAIPreview(result, keyInfo, readOnly = false, autoSaveNow = false) {
    // Safety check: ensure result has the expected structure
    if (!result.jawaban) result.jawaban = [];

    // Recalculate score and status based on official key for pinpoint accuracy
    if (keyInfo) {
        const keyMap = {};
        // Split by comma and handle potential spaces, then filter empty items
        keyInfo.sequence.split(',').forEach(item => {
            const trimmedItem = item.trim();
            if (!trimmedItem) return;
            const p = trimmedItem.split(':');
            if (p.length === 2) {
                const qNum = p[0].trim();
                const qAns = p[1].trim();
                keyMap[qNum] = qAns;
            }
        });

        // Buat lookup dari jawaban siswa berdasarkan nomor soal
        const studentAnswerMap = {};
        result.jawaban.forEach(j => {
            studentAnswerMap[String(j.no).trim()] = (j.deteksi || "").trim().toUpperCase();
        });

        // HITUNG BERDASARKAN SEMUA SOAL DI KUNCI (bukan hanya yang terdeteksi AI)
        let benarValue = 0;
        const totalSoal = Object.keys(keyMap).length;
        
        // Reset jawaban berdasarkan kunci lengkap
        const fullJawaban = [];
        Object.keys(keyMap).sort((a, b) => parseInt(a) - parseInt(b)).forEach(qNum => {
            const officialAns = keyMap[qNum].toUpperCase();
            const studentAns = studentAnswerMap[qNum] || "?";
            const isBenar = studentAns !== "?" && studentAns === officialAns;
            
            if (isBenar) benarValue++;
            
            fullJawaban.push({
                no: parseInt(qNum) || qNum,
                deteksi: studentAns,
                status: isBenar ? "benar" : "salah"
            });
        });

        // Ganti jawaban dengan data lengkap
        result.jawaban = fullJawaban;

        // Final recalculation of top-level stats
        result.benar = benarValue;
        result.salah = totalSoal - benarValue;
        result.skor = totalSoal > 0 ? ((benarValue / totalSoal) * 100).toFixed(1) : 0;

        console.log('[Scoring Debug]', { keyMap, studentAnswerMap, benar: benarValue, salah: result.salah, total: totalSoal });

        // Metadata assignment
        result.mapel = keyInfo.mapel;
        result.kelas = keyInfo.kelas;
        result.kategori = keyInfo.kategori || 'uh';
        result.tanggal = new Date().toLocaleDateString('id-ID');
    }

    // Ensure name is present
    if (!result.nama || result.nama.toLowerCase().includes("nama siswa")) {
        result.nama = "Siswa (Hasil AI)";
    }

    STATE.tempResult = { ...result };

    // Modal UI Adjustments
    if (el.modalTitle) el.modalTitle.innerText = readOnly ? "Detail Hasil Nilai" : "Hasil Koreksi AI";

    // AUTO SAVE: hanya jika eksplisit diminta (dari AI path) atau dari offline OMR (handled via confirmAndSave)
    if (autoSaveNow && !readOnly) {
        const dataToSave = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            ...result,
            tanggal: new Date().toLocaleDateString('id-ID'),
            timestamp: Date.now()
        };
        saveToRekap(dataToSave);
        console.log("[AI] Data otomatis tersimpan:", dataToSave.id);
    }

    // Generate detail list for Correct/Wrong
    let listHtml = '';
    if (result.jawaban && Array.isArray(result.jawaban)) {
        listHtml = `
            <div class="answer-details mt-15" style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; background: rgba(0,0,0,0.03); padding: 10px;">
                <h4 style="margin-bottom: 10px; font-size: 0.9rem;">Detail Jawaban:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; justify-content: center;">
                    ${result.jawaban.map((j, idx) => `
                        <div style="padding: 5px; border-radius: 4px; text-align: center; background: ${j.status === 'benar' ? '#dcfce7' : '#fee2e2'}; border: 1px solid ${j.status === 'benar' ? '#22c55e' : '#ef4444'}; font-size: 0.75rem;">
                            <b>Soal ${j.no || (idx + 1)}</b><br>Jawab: ${j.deteksi || '-'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    el.aiResultContent.innerHTML = `
        <div class="result-summary p-20 text-center">
            <h1 style="font-size: 3.5rem; color: var(--primary); font-weight: 800; margin-bottom: 5px;">${result.skor}</h1>
            <p style="font-size: 1.1rem;"><strong>${result.nama}</strong></p>
            <p class="text-muted" style="font-size: 0.9rem;">${result.mapel} - ${result.kelas}</p>
            <div class="mt-10 mb-10" style="display: flex; justify-content: center; gap: 20px;">
                <span style="color: #16a34a;">Benar: <b>${result.benar}</b></span>
                <span style="color: #dc2626;">Salah: <b>${result.salah}</b></span>
            </div>
            ${listHtml}
        </div>
    `;
    el.aiModal.classList.remove('hidden');
}

function downloadResultAsTxt() {
    if (!STATE.tempResult) return;
    const res = STATE.tempResult;
    let content = `HASIL PEMINDAIAN Si-Koreksi - DATA OMR\n`;
    content += `===============================\n`;
    content += `Nama      : ${res.nama}\n`;
    content += `Kelas     : ${res.kelas}\n`;
    content += `Mapel     : ${res.mapel}\n`;
    content += `Tanggal   : ${res.tanggal || '-'}\n`;
    content += `Skor      : ${res.skor}\n`;
    content += `Benar     : ${res.benar}\n`;
    content += `Salah     : ${res.salah}\n`;
    content += `===============================\n`;
    content += `DETAIL JAWABAN:\n`;
    if (res.jawaban) {
        res.jawaban.forEach(j => {
            content += `${j.no}. [${j.deteksi}] - ${j.status.toUpperCase()}\n`;
        });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hasil_${res.nama}_${res.mapel}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    // Notification as requested
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    alert(dict['alert-download-success']);
}

window.processWithNativeOMR = async function () {
    if (!STATE.activeKeyId) return alert('Silakan Simpan Kunci Jawaban terlebih dahulu sebelum memindai!');
    if (!STATE.scannedImage) return alert('Silakan ambil foto atau upload PDF Si-Koreksi terlebih dahulu!');

    const activeKey = STATE.bankSoal.find(k => k.id == STATE.activeKeyId);
    if (!activeKey) return alert('Kunci jawaban tidak ditemukan!');

    const overlay = document.getElementById('wsScanningOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        const overlayText = document.querySelector('#wsScanningOverlay .scan-text');
        if (overlayText) overlayText.innerText = "MEMINDAI SECARA LOKAL...";
    }

    // Reset Debug UI early
    const debugContainer = document.getElementById('omrDebugContainer');
    const debugCanvas = document.getElementById('omrDebugCanvas');
    if (debugContainer) debugContainer.classList.add('hidden');

    try {
        const img = new Image();
        // Gunakan JPG hasil konversi jika source-nya PDF
        const finalSource = STATE.scannedMimeType === 'application/pdf' ? STATE.scannedImageAsJpg : STATE.scannedImage;
        img.src = 'data:image/jpeg;base64,' + finalSource;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Gagal memuat gambar untuk pemindaian."));
        });

        const W = 1000;
        const H = (img.height / img.width) * W;

        // Prepare Debug Canvas
        let dctx = null;
        if (debugCanvas) {
            debugCanvas.width = W;
            debugCanvas.height = H;
            dctx = debugCanvas.getContext('2d');
            dctx.drawImage(img, 0, 0, W, H);
        }

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, W, H);

        const imageData = ctx.getImageData(0, 0, W, H);
        const data = imageData.data;

        // 1. Thresholding to find black markers
        const findMarker = (startX, startY, endX, endY, label = "") => {
            let best = null;
            let maxDark = 0;
            const step = 4;

            // Draw search area in debug
            if (dctx) {
                dctx.strokeStyle = 'rgba(67, 56, 202, 0.3)';
                dctx.lineWidth = 2;
                dctx.strokeRect(startX, startY, endX - startX, endY - startY);
            }

            for (let y = Math.floor(startY); y < Math.floor(endY); y += step) {
                for (let x = Math.floor(startX); x < Math.floor(endX); x += step) {
                    const idx = (y * W + x) * 4;
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    if (brightness < 85) {
                        let count = 0;
                        for (let dy = -5; dy <= 5; dy += 2) {
                            for (let dx = -5; dx <= 5; dx += 2) {
                                const nx = x + dx;
                                const ny = y + dy;
                                if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                                    const nIdx = (ny * W + nx) * 4;
                                    if (data[nIdx] < 120) count++;
                                }
                            }
                        }
                        if (count > maxDark) {
                            maxDark = count;
                            best = { x, y };
                        }
                    }
                }
            }

            if (best && dctx) {
                dctx.strokeStyle = '#2563eb'; // Blue for detected markers
                dctx.lineWidth = 3;
                dctx.strokeRect(best.x - 10, best.y - 10, 20, 20);
                dctx.fillStyle = '#2563eb';
                dctx.font = 'bold 12px Arial';
                dctx.fillText(label, best.x - 10, best.y - 15);
            }

            return best;
        };

        const m1 = findMarker(0, 0, W / 4, H / 4, "TL"); // Top-left
        const m2 = findMarker(3 * W / 4, 0, W, H / 4, "TR"); // Top-right
        const m3 = findMarker(0, 3 * H / 4, W / 4, H, "BL"); // Bottom-left
        const m4 = findMarker(3 * W / 4, 3 * H / 4, W, H, "BR"); // Bottom-right

        if (!m1 || !m2 || !m3 || !m4) {
            if (debugContainer) debugContainer.classList.remove('hidden');
            el.aiResultContent.innerHTML = `
                <div class="p-20 text-center">
                    <ion-icon name="alert-circle-outline" style="font-size: 3rem; color: var(--danger);"></ion-icon>
                    <h3 class="mt-10">Mata Penanda Tidak Ditemukan</h3>
                    <p class="text-muted mt-5">Sistem gagal mendeteksi 4 kotak hitung di sudut Si-Koreksi. Lihat preview di bawah untuk memastikan semua kotak hitam di sudut kertas terlihat jelas dan tidak tertutup/terpotong.</p>
                    <button class="btn secondary mt-15 mx-auto" onclick="document.getElementById('aiModal').classList.add('hidden')">Coba Lagi</button>
                </div>
            `;
            el.aiModal.classList.remove('hidden');
            throw new Error("Gagal mendeteksi penanda sudut (Kotak Hitam).");
        }

        // 2. Map coordinates
        const innerX = m1.x;
        const innerY = m1.y;
        const innerW = m2.x - m1.x;
        const innerH = m3.y - m1.y;

        // 3. Detect Bubbles
        const length = parseInt(document.getElementById('wsKeyLength').value) || 10;
        const format = document.getElementById('wsKeyFormat').value || 'ABCD';
        const options = format.split('');
        const cols = 4;
        const rows = Math.ceil(length / cols);

        // Grid offsets adjusted for better accuracy
        const gridStartY = innerY + (innerH * 0.48);
        const gridHeight = innerH * 0.40;
        const gridStartX = innerX + (innerW * 0.05);
        const gridWidth = innerW * 0.90;

        const results = [];
        let totalBenar = 0;
        const keyMap = {};
        activeKey.sequence.split(',').forEach(item => {
            const p = item.split(':');
            if (p.length === 2) keyMap[p[0].trim()] = p[1].trim();
        });

        for (let i = 1; i <= length; i++) {
            const colIdx = Math.floor((i - 1) / rows);
            const rowIdx = (i - 1) % rows;

            const bX = gridStartX + (colIdx * (gridWidth / cols));
            const bY = gridStartY + (rowIdx * (gridHeight / rows));

            let detectedOpt = "?";
            let maxDarkness = 0;

            options.forEach((opt, optIdx) => {
                const optX = bX + 35 + (optIdx * 25);
                const optY = bY + 10;

                let darkSum = 0;
                let totalPixels = 0;
                const r = 6;
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const px = Math.round(optX + dx);
                        const py = Math.round(optY + dy);
                        if (px >= 0 && px < W && py >= 0 && py < H) {
                            const idx = (py * W + px) * 4;
                            const br = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                            if (br < 140) darkSum += (255 - br);
                            totalPixels++;
                        }
                    }
                }
                const score = darkSum / totalPixels;

                // Debug bubble locations
                if (dctx) {
                    dctx.beginPath();
                    dctx.arc(optX, optY, 3, 0, Math.PI * 2);
                    dctx.fillStyle = score > 40 ? '#10b981' : '#ef4444'; // Green if dark enough, red otherwise
                    dctx.fill();
                }

                if (score > 40 && score > maxDarkness) {
                    maxDarkness = score;
                    detectedOpt = opt;
                }
            });

            const status = detectedOpt === keyMap[i] ? "benar" : "salah";
            if (status === "benar") totalBenar++;
            results.push({ no: i, deteksi: detectedOpt, status });
        }

        const finalResult = {
            nama: "Siswa (Mode Offline)",
            nisn: "000000",
            skor: ((totalBenar / length) * 100).toFixed(1),
            benar: totalBenar,
            salah: length - totalBenar,
            jawaban: results,
            mapel: el.setupMapel.value,
            kelas: el.setupKelas.value,
            tanggal: new Date().toLocaleDateString('id-ID'),
            kategori: STATE.kategoriAktif
        };

        STATE.tempResult = finalResult;

        // Show everything
        if (debugContainer) debugContainer.classList.remove('hidden');
        showAIPreview(finalResult, null, false, true); // autoSaveNow=true untuk mode offline juga

    } catch (err) {
        console.error("OMR Error:", err);
        // Only alert if we didn't show the custom error modal UI
        if (el.aiResultContent && !el.aiResultContent.innerHTML.includes('Mata Penanda Tidak Ditemukan')) {
            alert("Eror OMR Lokal: " + err.message);
        }
    } finally {
        if (overlay) overlay.classList.add('hidden');
    }
};

async function confirmAndSave() {
    try {
        const id = Date.now().toString();
        const dataToSave = { 
            id: id,
            ...STATE.tempResult, 
            tanggal: new Date().toLocaleDateString('id-ID'),
            timestamp: Date.now()
        };

        // SAVE LOCALLY
        saveToRekap(dataToSave);

        alert('Hasil berhasil disimpan di laptop!');
        resetWsScanner();
        el.aiModal.classList.add('hidden');
    } catch (e) {
        alert('Gagal simpan: ' + e.message);
    }
}

// --- RESULTS ---
async function loadRecentActivity() {
    if (!el.recentExams) return;
    const recent = STATE.allHasilOMR.slice(0, 5);
    if (recent.length === 0) {
        el.recentExams.innerHTML = '<p class="text-muted text-center p-20">Belum ada data penilaian. Scan Si-Koreksi untuk memulai.</p>';
        return;
    }
    el.recentExams.innerHTML = recent.map(data => {
        return `
                <div class="list-item-pro mb-10">
                    <div class="item-icon-circle"><ion-icon name="checkmark-circle"></ion-icon></div>
                    <div class="item-details">
                        <h4>${data.nama}</h4>
                        <p>${data.mapel} • Skor: ${data.skor}</p>
                    </div>
                </div>`;
        }).join('');
}

async function showClassDetail(className, mapelName) {
    STATE.activeDetailKelas = className;
    STATE.activeDetailMapel = mapelName;
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;

    if (el.currentClassTitle) el.currentClassTitle.innerText = `${className} - ${mapelName}`;
    document.getElementById('resultsClassList').classList.add('hidden');
    document.getElementById('resultsClassDetail').classList.remove('hidden');

    const body = document.getElementById('resultsListBody');
    if (!body) return;
    body.innerHTML = '';

    const filtered = STATE.allHasilOMR.filter(h => h.kelas === className && h.mapel === mapelName && h.kategori === STATE.kategoriAktif);

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="padding: 30px; text-align: center; color: var(--text-muted); font-style: italic;">Belum ada data untuk kategori ini.</td></tr>`;
        return;
    }

    // Group by Urutan
    const groups = {};
    filtered.forEach(h => {
        const u = h.urutan || '1';
        if (!groups[u]) groups[u] = [];
        groups[u].push(h);
    });

    // Sort urutan keys
    const sortedUrutans = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));

    let html = '';
    sortedUrutans.forEach(u => {
        html += `
            <tr style="background: rgba(0,0,0,0.03);">
                <td colspan="5" style="padding: 10px 20px; font-weight: bold; color: var(--primary);">
                    <ion-icon name="folder-open-outline" style="margin-right: 5px;"></ion-icon> 
                    ${dict['group-sequence-prefix']} ${u}
                </td>
            </tr>
        `;
        groups[u].forEach(data => {
            const nimDisplay = data.nim || data.nisn || '-';
            html += `
                <tr style="border-bottom: 1px solid var(--border);" class="hover-row">
                    <td style="padding: 12px 20px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="avatar-sm">${data.nama ? data.nama[0].toUpperCase() : '?'}</div>
                            <div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-weight: 500;" id="name-label-${data.id}">${data.nama || '-'}</span>
                                    <button onclick="event.stopPropagation(); editStudentName('${data.id}')"
                                        title="Edit Nama"
                                        style="background:none; border:none; cursor:pointer; padding:2px 4px; border-radius:6px; color:var(--primary); opacity:0.7; transition:opacity 0.2s;"
                                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                                        <ion-icon name="pencil-outline" style="font-size:0.85rem; vertical-align:middle;"></ion-icon>
                                    </button>
                                </div>
                                <div style="display:flex; align-items:center; gap:4px; margin-top:2px;">
                                    <span style="font-size: 11px; color: var(--text-muted);" id="nim-label-${data.id}">${nimDisplay}</span>
                                    <button onclick="event.stopPropagation(); editStudentNIM('${data.id}')"
                                        title="Edit NIM/NISN"
                                        style="background:none; border:none; cursor:pointer; padding:1px 3px; border-radius:5px; color:var(--text-muted); opacity:0.6; transition:opacity 0.2s;"
                                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                                        <ion-icon name="pencil-outline" style="font-size:0.7rem; vertical-align:middle;"></ion-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 12px 20px; color: var(--text-muted);" onclick="viewRecordDetail('${data.id}')" class="cursor-pointer">${data.mapel}</td>
                    <td style="padding: 12px 20px;" onclick="viewRecordDetail('${data.id}')" class="cursor-pointer">
                        <span class="badge-sm ${data.skor >= 70 ? 'success' : 'warning'}">${data.skor}</span>
                    </td>
                    <td style="padding: 12px 20px; color: var(--text-muted); font-size: 0.85rem;" onclick="viewRecordDetail('${data.id}')" class="cursor-pointer">${data.tanggal || '-'}</td>
                    <td style="padding: 12px 20px; text-align: right;">
                        <button class="btn-icon-plain danger" onclick="event.stopPropagation(); deleteResult('${data.id}')" title="Hapus">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </td>
                </tr>
            `;
        });


    });
    body.innerHTML = html;
}

/**
 * Edit nama siswa langsung dari tabel rekap nilai.
 * Membuka mini-input mengambang di bawah ikon pensil.
 */
window.editStudentName = function(recordId) {
    // Hapus popup sebelumnya jika ada
    const existingPopup = document.getElementById('editNamePopup');
    if (existingPopup) existingPopup.remove();

    const record = STATE.allHasilOMR.find(r => r.id === recordId);
    if (!record) return;

    const labelEl = document.getElementById(`name-label-${recordId}`);
    if (!labelEl) return;

    // Buat popup mini di bawah label nama
    const popup = document.createElement('div');
    popup.id = 'editNamePopup';
    popup.style.cssText = `
        position: fixed; z-index: 9999;
        background: var(--bg-card);
        border: 1.5px solid var(--primary);
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        min-width: 280px;
        animation: fadeInDown 0.15s ease;
    `;

    popup.innerHTML = `
        <p style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            <ion-icon name="pencil-outline" style="vertical-align:middle; margin-right:4px; color:var(--primary);"></ion-icon>
            Edit Nama Siswa
        </p>
        <input id="editNameInput" type="text" value="${record.nama || ''}"
            style="width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
                   font-size: 0.9rem; outline: none; background: var(--bg-side); color: var(--text-primary);
                   box-sizing: border-box;"
            placeholder="Nama siswa..."
        >
        <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button id="editNameSaveBtn"
                style="flex:1; padding: 8px; background: var(--primary); color: white; border: none;
                       border-radius: 9px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                Simpan
            </button>
            <button onclick="document.getElementById('editNamePopup').remove()"
                style="flex:1; padding: 8px; background: var(--bg-hover); color: var(--text-secondary);
                       border: 1.5px solid #e2e8f0; border-radius: 9px; cursor: pointer; font-size: 0.85rem;">
                Batal
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    // Posisikan popup di dekat label nama
    const rect = labelEl.getBoundingClientRect();
    const popupH = 140;
    let top = rect.bottom + 6;
    if (top + popupH > window.innerHeight) top = rect.top - popupH - 6;
    popup.style.top  = `${top}px`;
    popup.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;

    // Fokus input
    const input = document.getElementById('editNameInput');
    input.focus();
    input.select();

    // Simpan saat Enter
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('editNameSaveBtn').click();
        if (e.key === 'Escape') popup.remove();
    });

    // Aksi simpan
    document.getElementById('editNameSaveBtn').addEventListener('click', () => {
        const newName = input.value.trim();
        if (!newName) return input.focus();

        // Update STATE
        const idx = STATE.allHasilOMR.findIndex(r => r.id === recordId);
        if (idx !== -1) STATE.allHasilOMR[idx].nama = newName;

        // Simpan localStorage
        localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));

        // Update tampilan label langsung (tanpa re-render seluruh tabel)
        labelEl.innerText = newName;

        // Update avatar initial
        const avatarEl = labelEl.closest('td')?.querySelector('.avatar-sm');
        if (avatarEl) avatarEl.innerText = newName[0].toUpperCase();

        popup.remove();
    });

    // Tutup popup jika klik di luar
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 100);
};


/**
 * Edit NIM siswa langsung dari tabel rekap nilai.
 * Membuka mini-input mengambang.
 */
window.editStudentNIM = function(recordId) {
    // Hapus popup sebelumnya jika ada
    const existingPopup = document.getElementById('editNIMPopup');
    if (existingPopup) existingPopup.remove();

    const record = STATE.allHasilOMR.find(r => r.id === recordId);
    if (!record) return;

    const labelEl = document.getElementById(`nim-label-${recordId}`);
    if (!labelEl) return;

    // Buat popup mini di bawah label NIM
    const popup = document.createElement('div');
    popup.id = 'editNIMPopup';
    popup.style.cssText = `
        position: fixed; z-index: 9999;
        background: var(--bg-card);
        border: 1.5px solid var(--primary);
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        min-width: 250px;
        animation: fadeInDown 0.15s ease;
    `;

    popup.innerHTML = `
        <p style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            <ion-icon name="pencil-outline" style="vertical-align:middle; margin-right:4px; color:var(--primary);"></ion-icon>
            Edit NIM/NISN
        </p>
        <input id="editNIMInput" type="text" value="${record.nim || record.nisn || ''}"
            style="width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
                   font-size: 0.9rem; outline: none; background: var(--bg-side); color: var(--text-primary);
                   box-sizing: border-box;"
            placeholder="NIM/NISN siswa..."
        >
        <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button id="editNIMSaveBtn"
                style="flex:1; padding: 8px; background: var(--primary); color: white; border: none;
                       border-radius: 9px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                Simpan
            </button>
            <button onclick="document.getElementById('editNIMPopup').remove()"
                style="flex:1; padding: 8px; background: var(--bg-hover); color: var(--text-secondary);
                       border: 1.5px solid #e2e8f0; border-radius: 9px; cursor: pointer; font-size: 0.85rem;">
                Batal
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    // Posisikan popup di dekat label NIM
    const rect = labelEl.getBoundingClientRect();
    const popupH = 140;
    let top = rect.bottom + 6;
    if (top + popupH > window.innerHeight) top = rect.top - popupH - 6;
    popup.style.top  = `${top}px`;
    popup.style.left = `${Math.min(rect.left, window.innerWidth - 270)}px`;

    // Fokus input
    const input = document.getElementById('editNIMInput');
    input.focus();
    input.select();

    // Simpan saat Enter
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('editNIMSaveBtn').click();
        if (e.key === 'Escape') popup.remove();
    });

    // Aksi simpan
    document.getElementById('editNIMSaveBtn').addEventListener('click', () => {
        const newNIM = input.value.trim();
        // Jangan blokir bila valuenya kosong, bisa jadi memang dihapus. Tapi biarkan saja update kosong.
        
        // Update STATE
        const idx = STATE.allHasilOMR.findIndex(r => r.id === recordId);
        if (idx !== -1) {
            STATE.allHasilOMR[idx].nim = newNIM;
            // Sinkronkan nisn dengan nim jika ada di rekap.
            if(STATE.allHasilOMR[idx].nisn !== undefined) STATE.allHasilOMR[idx].nisn = newNIM;
        }

        // Simpan localStorage
        localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));

        // Update tampilan label langsung (tanpa re-render seluruh tabel)
        labelEl.innerText = newNIM || '-';

        popup.remove();
    });

    // Tutup popup jika klik di luar
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 100);
};


async function deleteResult(docId) {
    const lang = localStorage.getItem('prefLang') || 'id';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    if (!confirm(dict['alert-delete-confirm'])) return;

    // DELETE LOCALLY
    STATE.allHasilOMR = STATE.allHasilOMR.filter(h => h.id !== docId);
    localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));
    
    showClassDetail(STATE.activeDetailKelas, STATE.activeDetailMapel);
    alert('Berhasil menghapus data dari laptop!');
}

window.viewRecordDetail = function (id) {
    const record = STATE.allHasilOMR.find(r => r.id === id);
    if (record) {
        showAIPreview(record, null, true);
    }
}

async function loadFullResults() {
    // Data is already loaded in STATE from localStorage during init
    let uniqueGroups = new Set();
    STATE.allHasilOMR.forEach(data => {
        if (data.kelas && data.mapel) {
            uniqueGroups.add(`${data.kelas}|${data.mapel}`);
        }
    });

    if (!STATE.activeDetailKelas) {
        showClassGrid(Array.from(uniqueGroups));
    } else {
        showClassDetail(STATE.activeDetailKelas, STATE.activeDetailMapel);
    }
}

function showClassGrid(groups) {
    document.getElementById('resultsClassDetail').classList.add('hidden');
    document.getElementById('resultsClassList').classList.remove('hidden');

    const grid = document.getElementById('classGridContainer');
    if (!grid) return;
    grid.innerHTML = '';

    if (groups.length === 0) {
        // Ambil dari Bank Soal jika belum ada hasil scan, pastikan formatnya benar
        let allSaved = Array.from(new Set(STATE.bankSoal
            .filter(b => b.kelas && b.mapel)
            .map(b => `${b.kelas}|${b.mapel}`)
        ));
        
        if (allSaved.length > 0) {
            groups = allSaved;
        } else {
            grid.innerHTML = `<div class="card p-30 text-center" style="grid-column:1/-1;">
                <ion-icon name="folder-open-outline" style="font-size:48px; color: var(--text-secondary); opacity:0.4;"></ion-icon>
                <p style="margin-top:12px; color: var(--text-secondary);">Belum ada data nilai atau kunci jawaban.<br>Scan Si-Koreksi atau buat kunci jawaban untuk memulai.</p>
            </div>`;
            return;
        }
    }

    // Hitung jumlah siswa per kelas
    const students = JSON.parse(localStorage.getItem(userKey('student_data'))) || {};

    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';
    grid.style.gap = '10px';

    groups.forEach((group, idx) => {
        const [cls, mapel] = group.split('|');
        const colors = ['#4338ca','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#ec4899'];
        const color = colors[idx % colors.length];
        const count = (students[cls] || []).length;
        const scanCount = STATE.allHasilOMR.filter(h => h.kelas === cls && h.mapel === mapel).length;

        const card = document.createElement('div');
        card.className = 'card cursor-pointer';
        card.style.cssText = `
            display: flex; align-items: center; gap: 16px;
            padding: 16px 20px; border-left: 5px solid ${color};
            transition: transform 0.15s, box-shadow 0.15s;
            border-radius: 12px;
        `;
        card.onmouseover = () => { card.style.transform = 'translateX(4px)'; card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; };
        card.onmouseout  = () => { card.style.transform = 'translateX(0)';   card.style.boxShadow = ''; };

        card.innerHTML = `
            <div style="width:42px; height:42px; border-radius:10px; background:${color}22; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <ion-icon name="book" style="font-size:20px; color:${color};"></ion-icon>
            </div>
            <div style="flex:1; min-width:0;">
                <div style="font-weight:700; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cls} - ${mapel}</div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${count} Siswa &bull; ${scanCount} Nilai Terkoreksi</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                <button onclick="event.stopPropagation(); deleteClassGroup('${cls}', '${mapel}')" 
                    style="background: #fee2e2; border: none; color: #dc2626; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Hapus Rekap">
                    <ion-icon name="trash-outline" style="font-size: 18px;"></ion-icon>
                </button>
                <div style="display:flex; align-items:center; gap:4px; color:${color}; font-size:13px; font-weight:600;">
                    Buka <ion-icon name="chevron-forward-outline"></ion-icon>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            STATE.activeDetailKelas = cls;
            STATE.activeDetailMapel = mapel;
            showClassDetail(cls, mapel);
        });

        grid.appendChild(card);
    });
}

// Hapus satu grup (Kelas + Mapel) dari rekap dan kunci jawaban
window.deleteClassGroup = function(cls, mapel) {
    if (!confirm(`Hapus seluruh data rekap nilai & kunci jawaban untuk ${cls} - ${mapel}?\n\nData yang sudah dihapus tidak dapat dikembalikan.`)) return;
    
    // 1. Hapus dari hasil scan
    STATE.allHasilOMR = STATE.allHasilOMR.filter(h => !(h.kelas === cls && h.mapel === mapel));
    localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));

    // 2. Hapus dari bank soal (kunci jawaban) supaya tidak muncul lagi di grid
    STATE.bankSoal = STATE.bankSoal.filter(b => !(b.kelas === cls && b.mapel === mapel));
    localStorage.setItem(userKey('bank_soal'), JSON.stringify(STATE.bankSoal));
    
    // 3. Reset state jika yang dihapus sedang aktif
    if (STATE.activeDetailKelas === cls && STATE.activeDetailMapel === mapel) {
        STATE.activeDetailKelas = null;
        STATE.activeDetailMapel = null;
    }

    // Refresh semua tampilan terkait
    loadFullResults();
    if (typeof populateClassDropdowns === 'function') populateClassDropdowns();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    
    alert(`Data ${cls} - ${mapel} berhasil dihapus sepenuhnya.`);
};




// ============================================================
// MANAJEMEN KELAS & SISWA
// ============================================================

// Ambil daftar kelas dari localStorage
function getClasses() {
    return JSON.parse(localStorage.getItem(userKey('class_list'))) || [];
}

// Simpan daftar kelas ke localStorage
function saveClasses(classes) {
    localStorage.setItem(userKey('class_list'), JSON.stringify(classes));
}

// Populate semua dropdown kelas di seluruh aplikasi
function populateClassDropdowns() {
    const classes = getClasses();
    const selectors = ['setupKelas', 'studentClassSelect', 'addStudentClass', 'filterKelas'];
    
    selectors.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const selected = el.value;
        const isSetup = (id === 'setupKelas');
        el.innerHTML = `<option value="">${isSetup ? '-- Pilih Kelas --' : '-- Pilih Kelas --'}</option>`;
        classes.forEach(cls => {
            const opt = document.createElement('option');
            opt.value = cls;
            opt.textContent = cls;
            if (cls === selected) opt.selected = true;
            el.appendChild(opt);
        });
    });
}

// Render chip/badge kelas di panel manajemen kelas
function renderClassChips() {
    const classes = getClasses();
    const container = document.getElementById('classChipsContainer');
    const hint = document.getElementById('noClassesHint');
    if (!container) return;

    const chips = container.querySelectorAll('.class-chip');
    chips.forEach(c => c.remove());

    if (hint) hint.style.display = classes.length === 0 ? 'block' : 'none';

    classes.forEach(cls => {
        const chip = document.createElement('div');
        chip.className = 'class-chip';
        chip.style = 'display: inline-flex; align-items: center; gap: 6px; background: var(--primary); color: white; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 500;';
        chip.innerHTML = `
            <span>${cls}</span>
            <button onclick="deleteClass('${cls}')" style="background: none; border: none; color: white; cursor: pointer; padding: 0; line-height: 1; display: flex;">
                <ion-icon name="close-circle" style="font-size: 16px;"></ion-icon>
            </button>`;
        container.appendChild(chip);
    });
}

// Tambah kelas baru
window.addClass = function() {
    const input = document.getElementById('newClassName');
    const name = input.value.trim();
    if (!name) return alert('Masukkan nama kelas terlebih dahulu!');
    
    const classes = getClasses();
    if (classes.includes(name)) return alert('Kelas dengan nama ini sudah ada!');
    
    classes.push(name);
    saveClasses(classes);
    input.value = '';
    renderClassChips();
    populateClassDropdowns();
    updateDashboardStats(); // Sinkron stat bar
};

// Hapus kelas
window.deleteClass = function(cls) {
    if (!confirm(`Hapus kelas "${cls}"? Data siswa di kelas ini juga akan dihapus.`)) return;
    
    let classes = getClasses();
    classes = classes.filter(c => c !== cls);
    saveClasses(classes);
    
    // Hapus siswa di kelas tersebut juga
    if (STATE.students[cls]) {
        delete STATE.students[cls];
        localStorage.setItem(userKey('student_data'), JSON.stringify(STATE.students));
    }

    // Hapus hasil nilai di kelas tersebut juga (Permintaan user: hapus manajemen kelas maka rekap hancur)
    STATE.allHasilOMR = STATE.allHasilOMR.filter(h => h.kelas !== cls);
    localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));
    
    renderClassChips();
    populateClassDropdowns();
    loadStudentList();
    updateDashboardStats(); // Sinkron stat bar
};

// Inisialisasi view Data Siswa
window.initStudentsView = function() {
    renderClassChips();
    populateClassDropdowns();
    loadStudentList();
};

// Load daftar siswa dari kelas yang dipilih
window.loadStudentList = function() {
    const classSelect = document.getElementById('studentClassSelect');
    const body = document.getElementById('studentListBody');
    const title = document.getElementById('studentListTitle');
    const counter = document.getElementById('studentCount');
    if (!classSelect || !body) return;

    const cls = classSelect.value;

    if (!cls) {
        body.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-20" style="font-style:italic;">Pilih kelas untuk melihat daftar siswa.</td></tr>';
        if (counter) counter.textContent = '0 Siswa';
        if (title) title.textContent = 'Daftar Siswa';
        return;
    }

    if (title) title.textContent = `Daftar Siswa — ${cls}`;
    const students = STATE.students[cls] || [];
    if (counter) counter.textContent = `${students.length} Siswa`;

    if (students.length === 0) {
        body.innerHTML = `<tr><td colspan="4" class="text-center text-muted p-20" style="font-style:italic;">Belum ada siswa di kelas ini. Klik "Tambah Siswa" atau "Impor Siswa".</td></tr>`;
        return;
    }

    body.innerHTML = students.map((s, i) => `
        <tr>
            <td style="padding: 10px 15px; color: var(--text-secondary);">${i + 1}</td>
            <td style="padding: 10px 15px; font-weight: 500;">${s.name}</td>
            <td style="padding: 10px 15px; color: var(--text-secondary);">${s.id || '-'}</td>
            <td style="padding: 10px 15px; text-align: center;">
                <button class="btn-icon-plain danger" onclick="deleteStudentItem('${cls}', ${i})" title="Hapus">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </td>
        </tr>
    `).join('');
};

// Buka modal impor bulk
window.openBulkImportModal = function() {
    document.getElementById('studentImportModal').classList.remove('hidden');
};

// Proses import bulk siswa
window.processBulkImport = function() {
    const classSelect = document.getElementById('studentClassSelect');
    const cls = classSelect?.value;
    if (!cls) return alert('Pilih kelas terlebih dahulu sebelum mengimpor!');

    const raw = document.getElementById('bulkStudentInput').value.trim();
    if (!raw) return alert('Masukkan daftar siswa!');

    const lines = raw.split('\n').filter(l => l.trim());
    const parsed = lines.map(line => {
        const parts = line.split(';');
        return { name: parts[0].trim(), id: parts[1] ? parts[1].trim() : '' };
    }).filter(s => s.name);

    if (!STATE.students[cls]) STATE.students[cls] = [];
    STATE.students[cls].push(...parsed);
    localStorage.setItem(userKey('student_data'), JSON.stringify(STATE.students));
    
    document.getElementById('studentImportModal').classList.add('hidden');
    document.getElementById('bulkStudentInput').value = '';
    loadStudentList();
    updateDashboardStats(); // Sinkron stat bar
    alert(`✅ Berhasil mengimpor ${parsed.length} siswa ke kelas ${cls}!`);
};

// Buka modal tambah siswa satuan
window.openAddStudentModal = function() {
    const cls = document.getElementById('studentClassSelect')?.value || '';
    document.getElementById('addStudentName').value = '';
    document.getElementById('addStudentNISN').value = '';
    populateClassDropdowns();
    if (cls) document.getElementById('addStudentClass').value = cls;
    document.getElementById('addStudentModal').classList.remove('hidden');
};

// Simpan siswa satu per satu
window.saveSingleStudent = function() {
    const cls = document.getElementById('addStudentClass').value;
    const name = document.getElementById('addStudentName').value.trim();
    const nisn = document.getElementById('addStudentNISN').value.trim();

    if (!cls) return alert('Pilih kelas terlebih dahulu!');
    if (!name) return alert('Nama siswa tidak boleh kosong!');

    if (!STATE.students[cls]) STATE.students[cls] = [];
    STATE.students[cls].push({ name, id: nisn });
    localStorage.setItem(userKey('student_data'), JSON.stringify(STATE.students));

    // Update dropdown kelas di panel siswa agar sesuai dengan kelas yang baru ditambah
    document.getElementById('studentClassSelect').value = cls;
    document.getElementById('addStudentModal').classList.add('hidden');
    loadStudentList();
    updateDashboardStats(); // Sinkron stat bar
};

// Hapus siswa satuan
window.deleteStudentItem = function(cls, index) {
    if (!confirm('Hapus siswa ini?')) return;
    STATE.students[cls].splice(index, 1);
    localStorage.setItem(userKey('student_data'), JSON.stringify(STATE.students));
    loadStudentList();
    updateDashboardStats(); // Sinkron stat bar
};

function initStatsChart() {
    const ctx = document.getElementById('classChart')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, { type: 'line', data: { labels: ['A', 'B', 'C'], datasets: [{ data: [10, 20, 15] }] } });
}

window.deleteKey = function (id) {
    STATE.bankSoal = STATE.bankSoal.filter(k => k.id != id);
    localStorage.setItem(userKey('bank_soal'), JSON.stringify(STATE.bankSoal));
    renderBankSoal();
};

function exportToExcel() {
    const table = document.getElementById('resultsTable');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, "Rekap_Nilai.xlsx");
}

window.handleLogout = function () {
    if (confirm('Keluar dari aplikasi? Sesi Anda akan ditutup.')) {
        localStorage.removeItem('user_session');
        location.reload();
    }
}

window.resetAppCache = function() {
    if (confirm('Lanjutkan? INI AKAN MENGHAPUS SEMUA DATA: NAMA SISWA, DATA KELAS, DAN DATA NILAI DARI LAPTOP ANDA.\n\nData tidak bisa dikembalikan setelah dihancurkan.')) {
        if (confirm('APAKAH ANDA YAKIN? Data Kelas, Siswa, dan Nilai akan hilang secara permanen!')) {
            localStorage.removeItem(userKey('all_results'));
            localStorage.removeItem(userKey('student_data'));
            localStorage.removeItem(userKey('class_list'));
            localStorage.removeItem(userKey('bank_soal'));
            
            alert('Semua cache dan data berhasil dihapus. Aplikasi akan dimuat ulang.');
            location.reload();
        }
    }
}

// =========================================================
// --- AUTH SYSTEM: GOOGLE SIGN-IN (FIREBASE AUTH) ---
// =========================================================

/**
 * Ambil storage key yang di-prefix UID agar data setiap guru terpisah.
 */
function userKey(key) {
    const uid = STATE.user && STATE.user.uid ? STATE.user.uid : 'guest';
    return `${uid}_${key}`;
}

/**
 * Load semua data user dari localStorage berdasarkan UID-nya.
 */
function loadUserData() {
    STATE.bankSoal      = JSON.parse(localStorage.getItem(userKey('bank_soal'))) || [];
    STATE.allHasilOMR   = JSON.parse(localStorage.getItem(userKey('all_results'))) || [];
    STATE.students       = JSON.parse(localStorage.getItem(userKey('student_data'))) || {};
    
    // Segarkan UI yang bergantung pada data pengguna / storage per-user
    if (typeof populateClassDropdowns === 'function') populateClassDropdowns();
    if (typeof renderClassChips === 'function') renderClassChips();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    
    console.log('[Auth] Data pengguna dimuat untuk:', STATE.user?.email);
}

/**
 * Simpan hasil rekap ke localStorage dengan prefix UID.
 */
window.saveToRekap = function saveToRekap(data) {
    const threshold = 10000;
    const now = Date.now();

    const nama     = data.nama     || "Siswa (Hasil AI)";
    const kelas    = data.kelas    || "";
    const mapel    = data.mapel    || "";
    const kategori = data.kategori || "uh";

    const duplicateIdx = STATE.allHasilOMR.findIndex(item =>
        item.nama === nama &&
        item.kelas === kelas &&
        item.mapel === mapel &&
        item.kategori === kategori &&
        Math.abs((item.timestamp || 0) - now) < threshold
    );

    if (duplicateIdx !== -1) {
        const oldId = STATE.allHasilOMR[duplicateIdx].id;
        STATE.allHasilOMR[duplicateIdx] = { ...data, id: oldId, timestamp: now };
    } else {
        STATE.allHasilOMR.unshift({ ...data, timestamp: now });
    }

    localStorage.setItem(userKey('all_results'), JSON.stringify(STATE.allHasilOMR));
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
}

/**
 * Inisialisasi observer Firebase Auth untuk login Google.
 */
function initAuthObserver() {
    const overlay = document.getElementById('authOverlay');

    auth.onAuthStateChanged(function(firebaseUser) {
        showAuthLoading(false);

        if (firebaseUser) {
            // === LOGGED IN ===
            STATE.user = {
                uid:         firebaseUser.uid,
                email:       firebaseUser.email,
                displayName: firebaseUser.displayName || 'Guru',
                photoURL:    firebaseUser.photoURL || null,
                isLoggedIn:  true
            };

            // Load data milik user ini
            loadUserData();

            // Sembunyikan overlay
            if (overlay) overlay.classList.add('hidden');

            // Muat data & profil milik user ini (bersih, bebas cache user lain)
            loadUserData();
            loadProfileAndSettings();   // load profil dari localStorage dengan prefix UID
            syncProfileDisplay();       // tampilkan foto + nama Google ke sidebar

            console.log('[Auth] Berhasil login sebagai:', firebaseUser.email);


        } else {
            // === LOGGED OUT ===
            STATE.user = null;
            if (overlay) {
                overlay.classList.remove('hidden');
                // Reset UI login
                const loginContent = document.getElementById('loginContent');
                if (loginContent) loginContent.classList.remove('hidden');
            }
        }
    });
}

/**
 * Login dengan Google Popup.
 */
window.handleGoogleLogin = async function() {
    showAuthLoading(true, 'Membuka jendela login Google...');
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        await auth.signInWithPopup(provider);
        // onAuthStateChanged akan otomatis memproses hasilnya
    } catch (err) {
        showAuthLoading(false);
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
            alert('Login gagal: ' + err.message);
        }
    }
};

/**
 * Masuk sebagai tamu (tanpa akun, data tidak tersimpan per akun).
 */
window.enterAsGuest = function() {
    showAuthLoading(true, 'Masuk sebagai tamu...');
    // Set user tamu di STATE
    STATE.user = { uid: 'guest', email: 'tamu@si-koresi.local', displayName: 'Tamu', isLoggedIn: true };
    loadUserData();

    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.add('hidden');
    showAuthLoading(false);

    const nameEl = document.querySelector('.user-info strong');
    if (nameEl) nameEl.innerText = 'Tamu';
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
};

/**
 * Logout dari akun Google.
 */
window.handleLogout = async function() {
    if (!confirm('Keluar dari aplikasi? Anda perlu login ulang dengan Google untuk mengakses data Anda.')) return;

    if (STATE.user && STATE.user.uid !== 'guest') {
        try {
            await auth.signOut();
        } catch(e) {
            console.error(e);
        }
    } else {
        STATE.user = null;
        const overlay = document.getElementById('authOverlay');
        if (overlay) overlay.classList.remove('hidden');
    }
};

function showAuthLoading(show, text = 'Menghubungkan dengan Google...') {
    const loading = document.getElementById('authLoading');
    const loginContent = document.getElementById('loginContent');
    if (loading)     loading.classList.toggle('hidden', !show);
    if (loginContent) loginContent.classList.toggle('hidden', show);
    const textEl = document.getElementById('authLoadingText');
    if (textEl) textEl.innerText = text;
}

// Stub agar tidak error jika ada kode lama yang masih memanggil fungsi ini
window.handleCodeLogin   = () => {};
window.startRegistration = () => {};
window.toggleAuthMode    = () => {};

