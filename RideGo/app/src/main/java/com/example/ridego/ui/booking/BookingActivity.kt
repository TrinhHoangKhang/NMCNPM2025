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
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import java.text.DecimalFormat

class BookingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBookingBinding
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    // 1. Biến lưu dữ liệu chuyến đi
    private var pickupLat = 0.0
    private var pickupLng = 0.0
    private var dropoffLat = 0.0
    private var dropoffLng = 0.0
    private var pickupAddress = ""
    private var dropoffAddress = ""

    // 2. Biến tính toán
    private var currentDistanceKm = 0.0
    private var selectedVehicleType = "RideGo Bike" // Mặc định là xe máy
    private var finalPrice = 0.0

    // --- QUAN TRỌNG: DÁN KEY MỚI (CỦA PROJECT RIDEGO CÓ BILLING) VÀO ĐÂY ---
    private val GOOGLE_API_KEY = "AIzaSyDm438HYBoKLDIFaS1gvsMyGplxYDEeaQQ"

    // Mã Request Code để nhận kết quả từ Map
    private val REQUEST_PICKUP = 100
    private val REQUEST_DROPOFF = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Hứng dữ liệu từ màn hình Home gửi sang
        val initialAddress = intent.getStringExtra("PICKUP_ADDRESS")
        val initialLat = intent.getDoubleExtra("PICKUP_LAT", 0.0)
        val initialLng = intent.getDoubleExtra("PICKUP_LNG", 0.0)

        if (initialAddress != null && initialLat != 0.0) {
            // Lưu vào biến logic
            pickupAddress = initialAddress
            pickupLat = initialLat
            pickupLng = initialLng

            // Cập nhật lên giao diện ngay lập tức
            binding.tvPickupAddress.text = pickupAddress
            binding.tvPickupAddress.setTextColor(Color.BLACK)
        }

        setupUI()
        updateVehicleSelectionUI() // Cập nhật giao diện chọn xe ban đầu
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        // --- BẤM VÀO ĐIỂM ĐÓN -> MỞ MAP (Mode 1) ---
        binding.layoutPickup.setOnClickListener {
            val intent = Intent(this, SetLocationActivity::class.java)
            // SỬA QUAN TRỌNG: Để false để nó biết trả kết quả về
            intent.putExtra("IS_BOOKING_FLOW", false)
            intent.putExtra("LOCATION_TYPE", 1) // 1 = Điểm đón
            startActivityForResult(intent, REQUEST_PICKUP)
        }

        // --- BẤM VÀO ĐIỂM ĐẾN -> MỞ MAP (Mode 2) ---
        binding.layoutDropoff.setOnClickListener {
            val intent = Intent(this, SetLocationActivity::class.java)
            // SỬA QUAN TRỌNG: Để false
            intent.putExtra("IS_BOOKING_FLOW", false)
            intent.putExtra("LOCATION_TYPE", 2) // 2 = Điểm đến
            startActivityForResult(intent, REQUEST_DROPOFF)
        }

        // --- CHỌN LOẠI XE ---
        binding.layoutBike.setOnClickListener {
            selectedVehicleType = "RideGo Bike"
            updateVehicleSelectionUI()
            calculatePrice()
        }
        binding.layoutCar.setOnClickListener {
            selectedVehicleType = "RideGo Car"
            updateVehicleSelectionUI()
            calculatePrice()
        }
        binding.layoutPremium.setOnClickListener {
            selectedVehicleType = "RideGo Premium"
            updateVehicleSelectionUI()
            calculatePrice()
        }

        // --- NÚT ĐẶT XE ---
        binding.btnConfirmBooking.setOnClickListener {
            createBookingInFirebase()
        }
    }

    // --- NHẬN KẾT QUẢ TỪ BẢN ĐỒ ---
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK && data != null) {
            val address = data.getStringExtra("SELECTED_ADDRESS") ?: ""
            val lat = data.getDoubleExtra("SELECTED_LAT", 0.0)
            val lng = data.getDoubleExtra("SELECTED_LNG", 0.0)

            if (requestCode == REQUEST_PICKUP) {
                binding.tvPickupAddress.text = address
                pickupAddress = address
                pickupLat = lat
                pickupLng = lng
            } else if (requestCode == REQUEST_DROPOFF) {
                binding.tvDropoffAddress.text = address
                dropoffAddress = address
                dropoffLat = lat
                dropoffLng = lng
            }

            // Nếu đã có cả 2 điểm -> Gọi Google API tính đường
            if (pickupLat != 0.0 && dropoffLat != 0.0) {
                calculateRouteFromGoogle(pickupLat, pickupLng, dropoffLat, dropoffLng)
            }
        }
    }

    // --- GỌI GOOGLE DIRECTIONS API (PHIÊN BẢN CHECK LỖI) ---
    private fun calculateRouteFromGoogle(startLat: Double, startLng: Double, endLat: Double, endLng: Double) {
        val url = "https://maps.googleapis.com/maps/api/directions/json?origin=$startLat,$startLng&destination=$endLat,$endLng&key=$GOOGLE_API_KEY"

        binding.tvDistance.text = "Đang tính..."

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val jsonStr = URL(url).readText()
                val json = JSONObject(jsonStr)

                // Kiểm tra trạng thái trả về
                val status = json.getString("status")

                if (status == "OK") {
                    // --- THÀNH CÔNG ---
                    val routes = json.getJSONArray("routes")
                    if (routes.length() > 0) {
                        val legs = routes.getJSONObject(0).getJSONArray("legs").getJSONObject(0)
                        val distanceMeters = legs.getJSONObject("distance").getInt("value")
                        val durationText = legs.getJSONObject("duration").getString("text")

                        currentDistanceKm = distanceMeters / 1000.0

                        withContext(Dispatchers.Main) {
                            binding.tvDistance.text = "${String.format("%.1f", currentDistanceKm)} km • $durationText"
                            calculatePrice() // Tính tiền
                        }
                    }
                } else {
                    // --- CÓ LỖI TỪ GOOGLE (VÍ DỤ: BILLING, KEY SAI) ---
                    val errorMsg = if (json.has("error_message")) json.getString("error_message") else ""
                    withContext(Dispatchers.Main) {
                        binding.tvDistance.text = "Lỗi: $status"
                        Toast.makeText(this@BookingActivity, "Google Error: $status\n$errorMsg", Toast.LENGTH_LONG).show()
                        Log.e("RIDEGO_API", "Error: $status - $errorMsg")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    binding.tvDistance.text = "Lỗi mạng"
                    Toast.makeText(this@BookingActivity, "Lỗi kết nối: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // --- THUẬT TOÁN TÍNH TIỀN ---
    private fun calculatePrice() {
        if (currentDistanceKm == 0.0) return

        var baseFare = 0.0
        var pricePerKm = 0.0

        // Bảng giá
        when (selectedVehicleType) {
            "RideGo Bike" -> {
                baseFare = 12000.0
                pricePerKm = 5000.0
            }
            "RideGo Car" -> {
                baseFare = 25000.0
                pricePerKm = 12000.0
            }
            "RideGo Premium" -> {
                baseFare = 50000.0
                pricePerKm = 20000.0
            }
        }

        // Công thức: Giá gốc + (Số Km * Giá mỗi km)
        finalPrice = baseFare + (currentDistanceKm * pricePerKm)

        // Cập nhật UI
        val formatter = DecimalFormat("#,###")
        binding.tvTotalPrice.text = "${formatter.format(finalPrice)}đ"
        binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(finalPrice)}đ"

        // Cập nhật giá ước tính cho từng loại xe
        binding.tvPriceBike.text = "${formatter.format(12000 + currentDistanceKm * 5000)}đ"
        binding.tvPriceCar.text = "${formatter.format(25000 + currentDistanceKm * 12000)}đ"
        binding.tvPricePremium.text = "${formatter.format(50000 + currentDistanceKm * 20000)}đ"
    }

    // --- ĐẨY LÊN FIREBASE ---
    private fun createBookingInFirebase() {
        val user = auth.currentUser
        if (user == null) return

        if (pickupLat == 0.0 || dropoffLat == 0.0) {
            Toast.makeText(this, "Vui lòng chọn đủ điểm đón và điểm đến!", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnConfirmBooking.isEnabled = false
        binding.btnConfirmBooking.text = "Đang tìm tài xế..."

        val tripData = hashMapOf(
            "riderId" to user.uid,
            "driverId" to "", // Chưa có tài xế
            "status" to "SEARCHING", // Trạng thái tìm xe
            "createdAt" to FieldValue.serverTimestamp(),
            "pickup" to hashMapOf(
                "address" to pickupAddress,
                "lat" to pickupLat,
                "lng" to pickupLng
            ),
            "dropoff" to hashMapOf(
                "address" to dropoffAddress,
                "lat" to dropoffLat,
                "lng" to dropoffLng
            ),
            "vehicleType" to selectedVehicleType,
            "distance" to currentDistanceKm,
            "fare" to finalPrice,
            "paymentMethod" to "CASH",
            "note" to binding.edtNote.text.toString()
        )

        db.collection("trips").add(tripData)
            .addOnSuccessListener {
                Toast.makeText(this, "Đã gửi yêu cầu!", Toast.LENGTH_SHORT).show()
                // Chuyển màn hình ở đây
                // val intent = Intent(this, FindingDriverActivity::class.java)
                // intent.putExtra("TRIP_ID", it.id)
                // startActivity(intent)
            }
            .addOnFailureListener {
                binding.btnConfirmBooking.isEnabled = true
                binding.btnConfirmBooking.text = "Thử lại"
                Toast.makeText(this, "Lỗi: ${it.message}", Toast.LENGTH_SHORT).show()
            }
    }

    // Hàm phụ: Đổi màu nền
    private fun updateVehicleSelectionUI() {
        // Reset về mặc định
        binding.layoutBike.setBackgroundResource(R.drawable.bg_booking_card)
        binding.layoutCar.setBackgroundResource(R.drawable.bg_booking_card)
        binding.layoutPremium.setBackgroundResource(R.drawable.bg_booking_card)

        // Highlight
        when (selectedVehicleType) {
            "RideGo Bike" -> binding.layoutBike.setBackgroundColor(Color.parseColor("#E3F2FD"))
            "RideGo Car" -> binding.layoutCar.setBackgroundColor(Color.parseColor("#E3F2FD"))
            "RideGo Premium" -> binding.layoutPremium.setBackgroundColor(Color.parseColor("#E3F2FD"))
        }
    }
}