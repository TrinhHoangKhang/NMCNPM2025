package com.example.ridego.ui.booking

import android.graphics.Color
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityFindingDriverBinding
import com.example.ridego.data.socket.SocketManager
import com.example.ridego.data.model.CancelTripRequest
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.*
import java.text.DecimalFormat

class FindingDriverActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var binding: ActivityFindingDriverBinding
    private var mMap: GoogleMap? = null

    // Dữ liệu chuyến đi
    private var tripId: String = ""
    private var pickupLat = 0.0
    private var pickupLng = 0.0
    private var dropoffLat = 0.0
    private var dropoffLng = 0.0
    private var encodedPolyline = "" // Đường đi để vẽ lại

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFindingDriverBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 1. Nhận dữ liệu từ BookingActivity
        getDataFromIntent()
        setupUI()

        // 2. Setup Map
        val mapFragment = supportFragmentManager.findFragmentById(com.example.ridego.R.id.mapFragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        // 3. LẮNG NGHE SOCKET (QUAN TRỌNG NHẤT)
        setupSocketListener()
    }

    private fun getDataFromIntent() {
        val intent = intent
        tripId = intent.getStringExtra("TRIP_ID") ?: ""
        pickupLat = intent.getDoubleExtra("PICKUP_LAT", 0.0)
        pickupLng = intent.getDoubleExtra("PICKUP_LNG", 0.0)
        dropoffLat = intent.getDoubleExtra("DROPOFF_LAT", 0.0)
        dropoffLng = intent.getDoubleExtra("DROPOFF_LNG", 0.0)
        encodedPolyline = intent.getStringExtra("POLYLINE") ?: ""

        // Hiển thị text
        binding.tvPickupAddress.text = intent.getStringExtra("PICKUP_ADDRESS")
        binding.tvDropoffAddress.text = intent.getStringExtra("DROPOFF_ADDRESS")
        binding.tvVehicleType.text = intent.getStringExtra("VEHICLE_TYPE")
        binding.tvDistance.text = "${intent.getDoubleExtra("DISTANCE", 0.0)} km"

        val price = intent.getDoubleExtra("PRICE", 0.0)
        val formatter = DecimalFormat("#,###")
        binding.tvPrice.text = "${formatter.format(price)}đ"
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener {
            // Có thể thêm logic hủy chuyến ở đây nếu muốn
            finish()
        }
        binding.btnReport.setOnClickListener {
            if (tripId.isEmpty()) {
                Toast.makeText(this, "Không tìm thấy ID chuyến đi!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnReport.isEnabled = false
            binding.btnReport.text = "Đang hủy..."

            val request = CancelTripRequest(tripId)
            com.example.ridego.data.api.RetrofitClient.instance.cancelTrip(request).enqueue(object : retrofit2.Callback<com.example.ridego.data.model.TripResponse> {
                override fun onResponse(call: retrofit2.Call<com.example.ridego.data.model.TripResponse>, response: retrofit2.Response<com.example.ridego.data.model.TripResponse>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@FindingDriverActivity, "Hủy chuyến thành công!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        binding.btnReport.isEnabled = true
                        binding.btnReport.text = "Hủy chuyến"
                        Toast.makeText(this@FindingDriverActivity, "Hủy thất bại: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: retrofit2.Call<com.example.ridego.data.model.TripResponse>, t: Throwable) {
                    binding.btnReport.isEnabled = true
                    binding.btnReport.text = "Hủy chuyến"
                    Toast.makeText(this@FindingDriverActivity, "Lỗi mạng: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }

    // --- PHẦN SERVER SOCKET ---
    private fun setupSocketListener() {
        // Đảm bảo socket đã kết nối
        SocketManager.connect()

        // Lắng nghe sự kiện "trip_accepted" (Tài xế nhận chuyến)
        SocketManager.onTripAccepted { data ->
            runOnUiThread {
                val driverId = data.optString("driverId")
                Toast.makeText(this, "Tài xế đã nhận chuyến! ID: $driverId", Toast.LENGTH_LONG).show()

                // CHUYỂN SANG MÀN HÌNH THEO DÕI TÀI XẾ (TrackingActivity)
                // val intent = Intent(this, TrackingActivity::class.java)
                // intent.putExtra("TRIP_ID", tripId)
                // intent.putExtra("DRIVER_ID", driverId)
                // startActivity(intent)
                // finish()
            }
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap

        // Vẽ lại 2 điểm
        val pickup = LatLng(pickupLat, pickupLng)
        val dropoff = LatLng(dropoffLat, dropoffLng)

        mMap?.addMarker(MarkerOptions().position(pickup).icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)))
        mMap?.addMarker(MarkerOptions().position(dropoff).icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED)))

        // Vẽ đường nét đứt (Dashed Line) giống thiết kế
        if (encodedPolyline.isNotEmpty()) {
            val path = decodePoly(encodedPolyline)

            // Tạo kiểu nét đứt
            val pattern = listOf(Dash(30f), Gap(20f)) // Dash: Nét gạch, Gap: Khoảng trống

            val polylineOptions = PolylineOptions()
                .addAll(path)
                .color(Color.parseColor("#7B1FA2")) // Màu tím
                .width(12f)
                .pattern(pattern) // Áp dụng nét đứt
                .geodesic(true)

            mMap?.addPolyline(polylineOptions)

            // Zoom camera
            val bounds = LatLngBounds.Builder().include(pickup).include(dropoff).build()
            mMap?.moveCamera(CameraUpdateFactory.newLatLngBounds(bounds, 150))
        }
    }

    // Hàm giải mã Polyline (Copy lại từ file cũ)
    private fun decodePoly(encoded: String): List<LatLng> {
        val poly = ArrayList<LatLng>()
        var index = 0
        val len = encoded.length
        var lat = 0
        var lng = 0
        while (index < len) {
            var b: Int
            var shift = 0
            var result = 0
            do {
                b = encoded[index++].code - 63
                result = result or (b and 0x1f shl shift)
                shift += 5
            } while (b >= 0x20)
            val dlat = if (result and 1 != 0) (result shr 1).inv() else result shr 1
            lat += dlat
            var shift2 = 0
            var result2 = 0
            do {
                b = encoded[index++].code - 63
                result2 = result2 or (b and 0x1f shl shift2)
                shift2 += 5
            } while (b >= 0x20)
            val dlng = if (result2 and 1 != 0) (result2 shr 1).inv() else result2 shr 1
            lng += dlng
            val p = LatLng(lat.toDouble() / 1E5, lng.toDouble() / 1E5)
            poly.add(p)
        }
        return poly
    }

    override fun onDestroy() {
        super.onDestroy()
        // Không ngắt Socket ở đây vì cần giữ kết nối
    }
}