package com.example.ridego.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.example.ridego.R
import com.example.ridego.data.socket.SocketManager
import com.google.android.gms.location.*
import com.google.firebase.auth.FirebaseAuth

class DriverService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    // Biến lưu ID tài xế lấy từ Firebase
    private var currentDriverId: String? = null

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Lấy User ID hiện tại từ Firebase
        val user = FirebaseAuth.getInstance().currentUser
        if (user != null) {
            currentDriverId = user.uid
        } else {
            Log.e("DriverService", "Người dùng chưa đăng nhập, dừng Service.")
            stopSelf() // Tự hủy nếu không có user
            return
        }

        // Cấu hình lắng nghe vị trí
        createLocationCallback()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Nếu không lấy được ID, dừng ngay
        if (currentDriverId == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        // 1. Kết nối Socket (SocketManager mới đã tự xử lý Token bên trong)
        SocketManager.connect()

        // 2. Tạo Notification để Service chạy Foreground
        createNotificationChannel()
        val notification = createNotification()

        // Chạy Foreground (Hỗ trợ Android 14+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                1,
                notification,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
                } else {
                    0
                }
            )
        } else {
            startForeground(1, notification)
        }

        // 3. Bắt đầu lấy vị trí
        requestLocationUpdates()

        return START_STICKY // Tự khởi động lại nếu bị hệ thống kill
    }

    private fun requestLocationUpdates() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000) // 5 giây cập nhật
            .setMinUpdateDistanceMeters(10f) // Hoặc di chuyển 10m
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            Log.d("DriverService", "Đã bắt đầu theo dõi vị trí cho Driver: $currentDriverId")
        } catch (e: SecurityException) {
            Log.e("DriverService", "Thiếu quyền vị trí: ${e.message}")
        } catch (e: Exception) {
            Log.e("DriverService", "Lỗi request location: ${e.message}")
        }
    }

    private fun createLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                val driverId = currentDriverId ?: return // Kiểm tra null lần nữa cho chắc

                for (location in locationResult.locations) {
                    // Gửi log để debug
                    Log.d("DriverService", "📍 Gửi vị trí: ${location.latitude}, ${location.longitude}")

                    // Gửi lên Server qua Socket với ID thật
                    SocketManager.emitLocationUpdate(
                        driverId,
                        location.latitude,
                        location.longitude,
                        location.bearing
                    )
                }
            }
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, "DRIVER_CHANNEL")
            .setContentTitle("Tài xế RideGo")
            .setContentText("Đang trực tuyến và chia sẻ vị trí...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                "DRIVER_CHANNEL",
                "Driver Location Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Dừng lấy vị trí khi tắt Service
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            // Ngắt kết nối socket khi dừng service (tuỳ logic, thường là nên ngắt)
            SocketManager.disconnect()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        Log.d("DriverService", "Service đã dừng")
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}