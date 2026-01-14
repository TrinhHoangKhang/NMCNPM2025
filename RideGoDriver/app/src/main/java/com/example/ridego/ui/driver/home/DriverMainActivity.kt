package com.example.ridego.ui.driver.home

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.location.Location
import android.os.Build
import android.os.Bundle
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.ridego.R
import com.example.ridego.data.socket.SocketManager
import com.example.ridego.service.DriverService
import com.google.android.gms.location.*
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class DriverMainActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var map: GoogleMap
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback // Để theo dõi vị trí realtime trên UI

    private var currentDialog: AlertDialog? = null
    private var currentMarker: Marker? = null // Biến lưu cái xe trên bản đồ
    private var driverVehicleType: String = "MOTORBIKE" // Lưu loại xe để vẽ icon

    private val currentUserId: String?
        get() = FirebaseAuth.getInstance().currentUser?.uid

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fine = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarse = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fine || coarse) {
            setupMap()
            goOnline()
        } else {
            Toast.makeText(this, "Cần quyền vị trí!", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO) // Tắt Dark Mode
        setContentView(R.layout.activity_main)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        setupDashboard()
        loadDriverVehicleType()

        // Khởi tạo callback vị trí cho UI
        createLocationCallback()

        findViewById<Button>(R.id.btnGoOnline).setOnClickListener {
            checkPermissionsAndGoOnline()
        }

        findViewById<Button>(R.id.btnGoOffline).setOnClickListener {
            goOffline()
        }

        val rootLayout = findViewById<View>(R.id.rootLayout)
        ViewCompat.setOnApplyWindowInsetsListener(rootLayout) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())

            // Chỉ định Padding cho view gốc:
            // Giữ nguyên padding trái/phải/trên, chỉ cộng thêm padding dưới đáy
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)

            insets
        }

        setupSocketListeners()
    }

    private fun setupMap() {
        val mapFragment = supportFragmentManager.findFragmentById(R.id.map) as? SupportMapFragment
        mapFragment?.getMapAsync(this)
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        // Tắt nút MyLocation mặc định của Google vì mình sẽ dùng Icon xe của mình
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            map.isMyLocationEnabled = false
            map.uiSettings.isMyLocationButtonEnabled = true
        }
    }

    // --- LOGIC VỊ TRÍ & MARKER (QUAN TRỌNG) ---

    private fun createLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    // Cập nhật vị trí xe trên bản đồ
                    updateCarMarker(location)
                }
            }
        }
    }

    private fun updateCarMarker(location: Location) {
        val latLng = LatLng(location.latitude, location.longitude)

        if (currentMarker == null) {
            // Nếu chưa có xe -> Tạo mới
            val markerOptions = MarkerOptions()
                .position(latLng)
                .icon(getBitmapDescriptorFromVector(this, getIconResId(driverVehicleType)))
                .anchor(0.5f, 0.5f) // Đặt tâm ảnh vào đúng tọa độ
                .rotation(location.bearing) // Xoay xe theo hướng đi

            currentMarker = map.addMarker(markerOptions)

            // Zoom camera vào xe lần đầu
            map.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 17f))
        } else {
            // Nếu đã có xe -> Chỉ di chuyển nó đến vị trí mới (mượt hơn xóa đi tạo lại)
            currentMarker?.position = latLng
            currentMarker?.rotation = location.bearing

            // Camera đi theo xe (nhưng cho phép người dùng vuốt đi chỗ khác)
            map.animateCamera(CameraUpdateFactory.newLatLng(latLng))
        }
    }

    // Hàm chuyển đổi Vector Icon (xml) thành Bitmap để vẽ lên Map
    private fun getBitmapDescriptorFromVector(context: Context, vectorResId: Int): BitmapDescriptor? {
        val vectorDrawable = ContextCompat.getDrawable(context, vectorResId) ?: return null

        // Tăng kích thước bitmap lên một chút cho nét
        val width = vectorDrawable.intrinsicWidth + 20
        val height = vectorDrawable.intrinsicHeight + 20

        vectorDrawable.setBounds(0, 0, vectorDrawable.intrinsicWidth, vectorDrawable.intrinsicHeight)

        val bitmap = Bitmap.createBitmap(vectorDrawable.intrinsicWidth, vectorDrawable.intrinsicHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        vectorDrawable.draw(canvas)

        return BitmapDescriptorFactory.fromBitmap(bitmap)
    }

    private fun getIconResId(type: String): Int {
        return when (type.uppercase()) {
            "MOTORBIKE" -> R.drawable.ic_motorcycle
            "4 SEAT" -> R.drawable.ic_car
            "7 SEAT" -> R.drawable.ic_car_sport
            else -> R.drawable.ic_car
        }
    }

    // --- LOGIC ONLINE/OFFLINE ---

    private fun checkPermissionsAndGoOnline() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION))
        } else {
            setupMap()
            goOnline()
        }
    }

    private fun goOnline() {
        // 1. Service & Socket
        val intent = Intent(this, DriverService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        SocketManager.connect()

        // 2. Bắt đầu lắng nghe vị trí để vẽ UI
        startLocationUpdates()

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    // Vẽ xe ngay, không cần chờ driver di chuyển
                    updateCarMarker(location)

                    // Zoom camera tới xe luôn cho mượt
                    val latLng = LatLng(location.latitude, location.longitude)
                    map.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 17f))
                }
            }
        }

        // 3. Update UI
        updateUIState(isOnline = true)
        Toast.makeText(this, "Đã trực tuyến!", Toast.LENGTH_SHORT).show()
    }

    private fun goOffline() {
        // 1. Stop Service & Socket
        val intent = Intent(this, DriverService::class.java)
        stopService(intent)
        SocketManager.disconnect()

        // 2. Dừng vẽ UI & Xóa xe
        stopLocationUpdates()
        currentMarker?.remove()
        currentMarker = null

        // 3. Update UI
        updateUIState(isOnline = false)
        Toast.makeText(this, "Đã ngoại tuyến.", Toast.LENGTH_SHORT).show()
    }

    private fun startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) return

        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 3000)
            .setMinUpdateDistanceMeters(5f)
            .build()

        fusedLocationClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
    }

    private fun stopLocationUpdates() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    private fun updateUIState(isOnline: Boolean) {
        val groupOffline = findViewById<View>(R.id.groupOffline)
        val groupOnline = findViewById<View>(R.id.groupOnline)
        val overlay = findViewById<View>(R.id.overlayOffline)

        if (isOnline) {
            groupOffline.visibility = View.GONE
            overlay.visibility = View.GONE
            groupOnline.visibility = View.VISIBLE
        } else {
            groupOnline.visibility = View.GONE
            overlay.visibility = View.VISIBLE
            groupOffline.visibility = View.VISIBLE
        }
    }

    // --- DATA & SOCKET ---

    private fun loadDriverVehicleType() {
        // Chỉ load để lưu vào biến, dùng khi vẽ Marker
        if (currentUserId == null) return
        FirebaseFirestore.getInstance().collection("drivers").document(currentUserId!!)
            .get()
            .addOnSuccessListener { document ->
                if (document.exists()) {
                    driverVehicleType = document.getString("vehicle.type")
                        ?: document.getString("vehicleType")
                                ?: "MOTORBIKE"

                    // Cập nhật icon ở màn hình chờ (Offline)
                    val imgOffline = findViewById<ImageView>(R.id.imgOfflineVehicle)
                    imgOffline.setImageResource(getIconResId(driverVehicleType))
                }
            }
    }

    private fun setupDashboard() {
        val cardWallet = findViewById<View>(R.id.cardWallet)
        cardWallet.findViewById<TextView>(R.id.tvTitle).text = "Ví"
        cardWallet.findViewById<TextView>(R.id.tvValue).text = "850k"
        cardWallet.findViewById<ImageView>(R.id.imgIcon).setImageResource(R.drawable.ic_wallet)

        val cardToday = findViewById<View>(R.id.cardToday)
        cardToday.findViewById<TextView>(R.id.tvTitle).text = "Hôm nay"
        cardToday.findViewById<TextView>(R.id.tvValue).text = "295k"
        cardToday.findViewById<ImageView>(R.id.imgIcon).setImageResource(R.drawable.ic_chart)

        val cardBonus = findViewById<View>(R.id.cardBonus)
        cardBonus.findViewById<TextView>(R.id.tvTitle).text = "Thưởng"
        cardBonus.findViewById<TextView>(R.id.tvValue).text = "450k"
        cardBonus.findViewById<ImageView>(R.id.imgIcon).setImageResource(R.drawable.ic_star)
    }

    private fun setupSocketListeners() {
        SocketManager.onNewRideRequest { requestJson ->
            runOnUiThread { showAcceptRideDialog(requestJson) }
        }
        SocketManager.onRideCanceled {
            runOnUiThread {
                currentDialog?.dismiss()
                Toast.makeText(this, "Khách đã hủy!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showAcceptRideDialog(data: JSONObject) {
        if (currentDialog?.isShowing == true) return
        try {
            val pickup = data.optString("pickupAddress", "Điểm đón")
            val dest = data.optString("destinationAddress", "Điểm đến")
            val price = data.optDouble("price", 0.0)
            val tripId = data.optString("tripId")

            val builder = AlertDialog.Builder(this)
                .setTitle("✨ CHUYẾN XE MỚI!")
                .setMessage("📍 Đón: $pickup\n🏁 Đến: $dest\n💰 Giá: ${String.format("%,.0fđ", price)}")
                .setPositiveButton("NHẬN") { _, _ -> SocketManager.emitAcceptRide(currentUserId!!, tripId) }
                .setNegativeButton("BỎ") { _, _ -> SocketManager.emitRejectRide(currentUserId!!, tripId) }
                .setCancelable(false)
            currentDialog = builder.create()
            currentDialog?.show()
        } catch (e: Exception) { e.printStackTrace() }
    }
}