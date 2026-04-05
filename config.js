/**
 * CONFIG.JS - Konfigurasi API SI-KORESI
 * Project Firebase: Si-Koreksi
 */

function getProxyKey() {
    const custom = localStorage.getItem('setGroqKey');
    if (custom && custom.trim() !== "") return custom;
    // JANGAN PERNAH menyimpan API Key Groq master secara hard-code jika di-upload ke public web!
    // Biarkan kosong, aplikasi akan meminta pengguna memasukkan API Key-nya sendiri demi keamanan.
    return "";
}

window.CONFIG = {
    // KONFIGURASI FIREBASE - PROJECT Si-Koreksi (Aman untuk public client-side)
    FIREBASE: {
        apiKey:            "AIzaSyAka537Y-1SKicuEp1g33KpHfnHRbjsoxM",
        authDomain:        "si-koreksi.firebaseapp.com",
        projectId:         "si-koreksi",
        storageBucket:     "si-koreksi.firebasestorage.app",
        messagingSenderId: "845619209411",
        appId:             "1:845619209411:web:aa9d0da6b6f906cfad6e76",
        measurementId:     "G-JRSTBRWEZN"
    },

    // Pengaturan AI (Sistem akan membaca dari localStorage pengguna)
    GROQ_API_KEY: getProxyKey()
};

