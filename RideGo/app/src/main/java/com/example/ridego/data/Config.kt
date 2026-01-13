package com.example.ridego.data

import android.os.Build

object Config {
    // --- CẤU HÌNH IP MÁY TÍNH CỦA BẠN (Dành cho máy thật) ---
    // Mở CMD gõ "ipconfig" (Win) hoặc Terminal gõ "ifconfig" (Mac) để lấy IP này
    private const val YOUR_PC_IP = "192.168.31.228" // <--- IP Windows (port forwarding sang WSL)

    // Cổng Server (Port)
    private const val PORT = "3001"

    // Logic tự động chọn URL
    val BASE_URL: String
        get() {
            return if (isEmulator()) {
                "http://10.0.2.2:$PORT/"
            } else {
                "http://$YOUR_PC_IP:$PORT/"
                       // "https://superingenious-outdated-lilia.ngrok-free.dev/"
            }
        }

    // Hàm kiểm tra xem có phải đang chạy trên máy ảo không
    private fun isEmulator(): Boolean {
        return (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.HARDWARE.contains("goldfish")
                || Build.HARDWARE.contains("ranchu")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("google") && Build.DEVICE.startsWith("generic"))
                || "google_sdk" == Build.PRODUCT
    }
}