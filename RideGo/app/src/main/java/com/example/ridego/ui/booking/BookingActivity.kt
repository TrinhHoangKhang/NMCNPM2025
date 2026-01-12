package com.example.ridego.ui.booking

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityBookingBinding
import com.example.ridego.ui.rider.location.SetLocationActivity
import com.example.ridego.data.api.RetrofitClient
import com.example.ridego.data.model.*
import com.example.ridego.data.socket.SocketManager
import com.google.firebase.auth.FirebaseAuth
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.DecimalFormat

class BookingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBookingBinding
    private val auth = FirebaseAuth.getInstance()

    // Biến lưu dữ liệu chuyến đi
    private var pickupLat = 0.0
    private var pickupLng = 0.0
    private var dropoffLat = 0.0
    private var dropoffLng = 0.0
    private var pickupAddress = ""
    private var dropoffAddress = ""
    private var currentDistanceKm = 0.0
    private var selectedVehicleType = "RideGo Bike"
    private var finalPrice = 0.0

    private val REQUEST_PICKUP = 100
    private val REQUEST_DROPOFF = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 1. KẾT NỐI SOCKET NGAY KHI VÀO MÀN HÌNH
        SocketManager.connect()
        setupSocketListeners()

        // Nhận dữ liệu từ màn hình tìm kiếm (nếu có)
        val initialAddress = intent.getStringExtra("PICKUP_ADDRESS")
        val initialLat = intent.getDoubleExtra("PICKUP_LAT", 0.0)
        val initialLng = intent.getDoubleExtra("PICKUP_LNG", 0.0)

        // Nhận điểm đến (nếu từ màn hình SearchDestination chuyển qua)
        val dropName = intent.getStringExtra("DROPOFF_NAME")
        val dropAddr = intent.getStringExtra("DROPOFF_ADDRESS")
        val dropLat = intent.getDoubleExtra("DROPOFF_LAT", 0.0)
        val dropLng = intent.getDoubleExtra("DROPOFF_LNG", 0.0)

        if (initialAddress != null && initialLat != 0.0) {
            pickupAddress = initialAddress
            pickupLat = initialLat
            pickupLng = initialLng
            binding.tvPickupAddress.text = pickupAddress
        }

        if (dropLat != 0.0 && dropLng != 0.0) {
            dropoffLat = dropLat
            dropoffLng = dropLng
            dropoffAddress = dropName ?: dropAddr ?: "Điểm đến đã chọn"
            binding.tvDropoffAddress.text = dropoffAddress

            // Nếu có đủ 2 điểm -> Gọi Server tính tiền ngay
            calculateRouteViaServer()
        }

        setupUI()
        updateVehicleSelectionUI()
    }

    private fun setupSocketListeners() {
        // Lắng nghe sự kiện: Tài xế nhận chuyến
        SocketManager.onTripAccepted { data ->
            runOnUiThread {
                // Server báo về: { "driverId": "...", "tripId": "..." }
                val driverId = data.optString("driverId")
                Toast.makeText(this, "Tài xế đã nhận chuyến! ID: $driverId", Toast.LENGTH_LONG).show()

                // TODO: Chuyển sang màn hình "Đang đón" (TripStatusActivity)
                // val intent = Intent(this, TripStatusActivity::class.java)
                // startActivity(intent)
                finish()
            }
        }
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        // Chọn điểm đón
        binding.layoutPickup.setOnClickListener {
            openMap(REQUEST_PICKUP, 1)
        }

        // Chọn điểm đến
        binding.layoutDropoff.setOnClickListener {
            openMap(REQUEST_DROPOFF, 2)
        }

        // Chọn loại xe
        val vehicleListener = { type: String ->
            selectedVehicleType = type
            updateVehicleSelectionUI()
            // Tính lại giá nếu đã có khoảng cách
            if (currentDistanceKm > 0) calculatePriceLocally()
        }
        binding.layoutBike.setOnClickListener { vehicleListener("RideGo Bike") }
        binding.layoutCar.setOnClickListener { vehicleListener("RideGo Car") }
        binding.layoutPremium.setOnClickListener { vehicleListener("RideGo Premium") }

        // Nút ĐẶT XE -> Gọi Server
        binding.btnConfirmBooking.setOnClickListener {
            createBookingViaServer()
        }
    }

    private fun openMap(requestCode: Int, type: Int) {
        val intent = Intent(this, SetLocationActivity::class.java)
        intent.putExtra("IS_BOOKING_FLOW", false)
        intent.putExtra("LOCATION_TYPE", type)
        startActivityForResult(intent, requestCode)
    }

    // --- GỌI API TÍNH ĐƯỜNG (Thay thế Google API cũ) ---
    private fun calculateRouteViaServer() {
        if (pickupLat == 0.0 || dropoffLat == 0.0) return

        binding.tvDistance.text = "Đang tính toán..."

        // Chuẩn bị dữ liệu: "lat,lng"
        val request = RouteRequest(
            origin = "$pickupLat,$pickupLng",
            destination = "$dropoffLat,$dropoffLng"
        )

        // Gọi Retrofit
        RetrofitClient.instance.calculateRoute(request).enqueue(object : Callback<RouteResponse> {
            override fun onResponse(call: Call<RouteResponse>, response: Response<RouteResponse>) {
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()!!.data
                    if (data != null) {
                        // Server trả về: { distance: { text: "15 km", value: 15000 } }
                        currentDistanceKm = data.distance.value / 1000.0
                        val duration = data.duration.text

                        binding.tvDistance.text = "${data.distance.text} • $duration"
                        calculatePriceLocally() // Tính giá hiển thị
                    }
                } else {
                    binding.tvDistance.text = "Không tìm thấy đường"
                }
            }

            override fun onFailure(call: Call<RouteResponse>, t: Throwable) {
                binding.tvDistance.text = "Lỗi kết nối Server"
                Log.e("API_ERROR", t.message.toString())
            }
        })
    }

    // Tính giá tạm thời trên App (để hiển thị nhanh)
    // Giá chính thức sẽ do Server chốt khi tạo Booking
    private fun calculatePriceLocally() {
        var baseFare = 0.0
        var pricePerKm = 0.0
        when (selectedVehicleType) {
            "RideGo Bike" -> { baseFare = 12000.0; pricePerKm = 5000.0 }
            "RideGo Car" -> { baseFare = 25000.0; pricePerKm = 12000.0 }
            "RideGo Premium" -> { baseFare = 50000.0; pricePerKm = 20000.0 }
        }
        finalPrice = baseFare + (currentDistanceKm * pricePerKm)

        val formatter = DecimalFormat("#,###")
        binding.tvTotalPrice.text = "${formatter.format(finalPrice)}đ"
        binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(finalPrice)}đ"

        // Update các dòng xe khác
        binding.tvPriceBike.text = "${formatter.format(12000 + currentDistanceKm * 5000)}đ"
        binding.tvPriceCar.text = "${formatter.format(25000 + currentDistanceKm * 12000)}đ"
        binding.tvPricePremium.text = "${formatter.format(50000 + currentDistanceKm * 20000)}đ"
    }

    // --- GỌI API ĐẶT XE (Thay thế Firebase Direct Write) ---
    private fun createBookingViaServer() {
        val user = auth.currentUser
        if (user == null) {
            Toast.makeText(this, "Vui lòng đăng nhập lại!", Toast.LENGTH_SHORT).show()
            return
        }
        if (pickupLat == 0.0 || dropoffLat == 0.0) {
            Toast.makeText(this, "Chưa chọn đủ địa điểm!", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnConfirmBooking.text = "Đang tìm tài xế..."
        binding.btnConfirmBooking.isEnabled = false

        // Đóng gói dữ liệu gửi lên Server
        val bookingRequest = TripRequest(
            riderId = user.uid,
            pickup = LocationData(pickupAddress, pickupLat, pickupLng),
            dropoff = LocationData(dropoffAddress, dropoffLat, dropoffLng),
            vehicleType = selectedVehicleType,
            distance = currentDistanceKm,
            fare = finalPrice
        )

        // Gọi API
        RetrofitClient.instance.createTrip(bookingRequest).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    // Đặt thành công -> Chờ Socket báo tin
                    Toast.makeText(this@BookingActivity, "Đang tìm tài xế gần bạn...", Toast.LENGTH_LONG).show()
                    // Không finish() ngay, đợi Socket hoặc timeout
                } else {
                    binding.btnConfirmBooking.isEnabled = true
                    binding.btnConfirmBooking.text = "Thử lại"
                    Toast.makeText(this@BookingActivity, "Lỗi đặt xe: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<TripResponse>, t: Throwable) {
                binding.btnConfirmBooking.isEnabled = true
                binding.btnConfirmBooking.text = "Thử lại"
                Toast.makeText(this@BookingActivity, "Lỗi mạng: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK && data != null) {
            val address = data.getStringExtra("SELECTED_ADDRESS") ?: ""
            val lat = data.getDoubleExtra("SELECTED_LAT", 0.0)
            val lng = data.getDoubleExtra("SELECTED_LNG", 0.0)

            if (requestCode == REQUEST_PICKUP) {
                pickupAddress = address
                pickupLat = lat
                pickupLng = lng
                binding.tvPickupAddress.text = address
            } else if (requestCode == REQUEST_DROPOFF) {
                dropoffAddress = address
                dropoffLat = lat
                dropoffLng = lng
                binding.tvDropoffAddress.text = address
            }
            // Gọi lại Server tính đường nếu đủ 2 điểm
            calculateRouteViaServer()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        SocketManager.disconnect() // Ngắt kết nối khi thoát
    }

    private fun updateVehicleSelectionUI() {
        binding.layoutBike.setBackgroundResource(R.drawable.bg_booking_card)
        binding.layoutCar.setBackgroundResource(R.drawable.bg_booking_card)
        binding.layoutPremium.setBackgroundResource(R.drawable.bg_booking_card)

        when (selectedVehicleType) {
            "RideGo Bike" -> binding.layoutBike.setBackgroundColor(Color.parseColor("#E3F2FD"))
            "RideGo Car" -> binding.layoutCar.setBackgroundColor(Color.parseColor("#E3F2FD"))
            "RideGo Premium" -> binding.layoutPremium.setBackgroundColor(Color.parseColor("#E3F2FD"))
        }
    }
}