package com.example.ridego.data

import android.os.Build

object Config {
    // --- NGROK TUNNEL CONFIGURATION ---
    // Ngrok terminates TLS on 443; don't append :3000 to the public host.
    private const val NGROK_URL = "https://52250268f092.ngrok-free.app/"

    // --- LOCAL IP CONFIGURATION (for development) ---
    private const val YOUR_PC_IP = "192.168.1.5"
    private const val LOCAL_PORT = "3000"

    // Logic tự động chọn URL
    val BASE_URL: String
        get() {
            return if (isEmulator()) {
                "http://10.0.2.2:$LOCAL_PORT/"
            } else {
                "https://superingenious-outdated-lilia.ngrok-free.dev"
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