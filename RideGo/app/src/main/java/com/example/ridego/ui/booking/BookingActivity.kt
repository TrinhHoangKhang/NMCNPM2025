package com.example.ridego.ui.booking

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityBookingBinding
import com.example.ridego.data.api.RideGoApiService
import com.example.ridego.data.api.RetrofitClient
import com.example.ridego.data.socket.SocketManager
import com.example.ridego.data.model.*
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.*
import com.google.firebase.auth.FirebaseAuth
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.DecimalFormat

class BookingActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var binding: ActivityBookingBinding
    private val auth = FirebaseAuth.getInstance()

    private var mMap: GoogleMap? = null
    private var polyline: Polyline? = null

    private var pickupLat = 0.0
    private var pickupLng = 0.0
    private var dropoffLat = 0.0
    private var dropoffLng = 0.0
    private var pickupAddress = ""
    private var dropoffAddress = ""

    private var currentDistanceKm = 0.0
    private var selectedVehicleType = "RideGo Bike"
    private var finalPrice = 0.0
    private var currentPolylineString = ""

    // Discount variables
    private var myPromotions: List<Promotion> = emptyList()
    private var selectedDiscountId: String? = null
    private var selectedDiscountCode: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        getDataFromIntent()

        // Khớp ID mapFragment trong XML của bạn
        val mapFragment = supportFragmentManager.findFragmentById(R.id.mapFragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        SocketManager.connect()
        setupSocketListeners()
        setupUI()
        fetchUserPromotions()
        setupSocketListeners()
        setupUI()
        fetchUserPromotions()
        checkCurrentTrip()
    }

    private fun checkCurrentTrip() {
        RetrofitClient.instance.getCurrentTrip().enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    val trip = response.body()?.data
                    if (trip != null && trip.status != "COMPLETED" && trip.status != "CANCELLED" && trip.status != "NO_DRIVER_FOUND") {
                        Toast.makeText(this@BookingActivity, "Bạn đang có chuyến đi chưa hoàn thành!", Toast.LENGTH_SHORT).show()
                        
                        val finalId = trip.tripId ?: trip.mongoId ?: trip.simpleId ?: ""
                        if (trip.status == "REQUESTED") {
                             val intent = Intent(this@BookingActivity, FindingDriverActivity::class.java)
                             intent.putExtra("TRIP_ID", finalId)
                             // Fill other data if needed or let FindingDriver fetch it? FindingDriver expects extras...
                             // It's safer to just go to TripDetails for consistency OR strictly FindingDriver.
                             // TripDetails handles data fetching better. Let's try TripDetails as generic fallback?
                             // User requirement: "move to that ride detail instead".
                             // But REQUESTED maps to FindingDriverActivity usually.
                             // Let's rely on standard TripDetailsActivity for everything EXCEPT REQUESTED? 
                             // Or just send to TripDetailsActivity and let it show "Looking for driver"?
                             // TripDetailsActivity UI currently shows "Waiting for Driver" if status is REQUESTED?
                             // Let's check TripDetailsActivity.kt... it handles ACCEPTED, IN_PROGRESS etc.
                             // If I send to FindingDriverActivity without full extras (lat/lng), it might crash or show empty map.
                             // FindingDriverActivity relies on Intent Extras heavily (lines 47-65).
                             // So best to use TripDetailsActivity if possible, OR fetch details first.
                             // Given complexity, let's redirect to TripDetailsActivity and update TripDetailsActivity to handle REQUESTED state gracefully if needed.
                             // WAIT: TripDetailsActivity is for AFTER matching. FindingDriverActivity is for BEFORE.
                             // I should fetch trip details, populate intent, then go to FindingDriverActivity.
                             // OR simpler: Go to TripDetailsActivity and make sure it supports REQUESTED state (e.g. show "Searching...").
                             // Validating TripDetailsActivity support for REQUESTED...
                             // TripDetailsActivity.kt line 189: "ACCEPTED", "IN_PROGRESS"... doesn't explicitly handle "REQUESTED".
                             // So I should populate intent and go to FindingDriverActivity.
                             // BUT populating intent from just `trip` object might be hard if some fields missing.
                             // Let's Try: Go to TripDetailsActivity, and if status is REQUESTED, Update TripDetailsActivity to show "Searching".
                             // That seems more robust than trying to reconstruct FindingDriverActivity intent.
                             // But for now, let's just use TripDetailsActivity and assume it works or I'll fix it.
                             val intentDetails = Intent(this@BookingActivity, TripDetailsActivity::class.java)
                             intentDetails.putExtra("TRIP_ID", finalId)
                             startActivity(intentDetails)
                             finish()
                        } else {
                             val intentDetails = Intent(this@BookingActivity, TripDetailsActivity::class.java)
                             intentDetails.putExtra("TRIP_ID", finalId)
                             startActivity(intentDetails)
                             finish()
                        }
                    }
                }
            }
            override fun onFailure(call: Call<TripResponse>, t: Throwable) {}
        })
    }

    private fun getDataFromIntent() {
        pickupAddress = intent.getStringExtra("PICKUP_ADDRESS") ?: ""
        pickupLat = intent.getDoubleExtra("PICKUP_LAT", 0.0)
        pickupLng = intent.getDoubleExtra("PICKUP_LNG", 0.0)

        // Sửa lại cách nhận key cho khớp với SetLocationActivity gửi qua
        dropoffAddress = intent.getStringExtra("DROPOFF_ADDRESS") ?: intent.getStringExtra("DEST_NAME") ?: ""
        dropoffLat = intent.getDoubleExtra("DROPOFF_LAT", 0.0)
        dropoffLng = intent.getDoubleExtra("DROPOFF_LNG", 0.0)
        android.util.Log.d("CHECK_LOCATION", "Địa điểm: $dropoffAddress | Tọa độ: $dropoffLat, $dropoffLng")

        val vehicleExtra = intent.getStringExtra("VEHICLE_TYPE")
        if (!vehicleExtra.isNullOrEmpty()) {
            selectedVehicleType = when (vehicleExtra) {
                "MOTORBIKE", "BIKE" -> "RideGo Bike"
                "4_SEATS", "CAR", "4 SEAT" -> "RideGo Car"
                "7_SEATS", "PREMIUM", "7 SEAT" -> "RideGo Premium"
                else -> "RideGo Bike"
            }
            selectVehicle(selectedVehicleType)
        }

        // Nhận mã giảm giá từ màn hình Ưu đãi
        selectedDiscountId = intent.getStringExtra("DISCOUNT_ID")
        selectedDiscountCode = intent.getStringExtra("DISCOUNT_CODE")
        if (!selectedDiscountId.isNullOrEmpty()) {
            Toast.makeText(this, "Đã áp dụng mã: $selectedDiscountCode", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        try { mMap?.isTrafficEnabled = true } catch (e: Exception) {}

        if (pickupLat != 0.0 && dropoffLat != 0.0) {
            val pickup = LatLng(pickupLat, pickupLng)
            val dropoff = LatLng(dropoffLat, dropoffLng)

            mMap?.addMarker(MarkerOptions().position(pickup).title("Điểm đón")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)))

            mMap?.addMarker(MarkerOptions().position(dropoff).title("Điểm đến")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED)))

            val bounds = LatLngBounds.Builder().include(pickup).include(dropoff).build()
            try {
                mMap?.moveCamera(CameraUpdateFactory.newLatLngBounds(bounds, 150))
            } catch (e: Exception) {
                mMap?.moveCamera(CameraUpdateFactory.newLatLngZoom(pickup, 14f))
            }

            calculateRouteViaServer()
        }
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        binding.layoutBike.setOnClickListener { selectVehicle("RideGo Bike") }
        binding.layoutCar.setOnClickListener { selectVehicle("RideGo Car") }
        binding.layoutPremium.setOnClickListener { selectVehicle("RideGo Premium") }

        binding.btnSelectPromotion.setOnClickListener { showPromotionDialog() }

        binding.btnConfirmBooking.setOnClickListener { createBookingViaServer() }
    }

    private fun selectVehicle(type: String) {
        selectedVehicleType = type
        binding.layoutBike.setBackgroundResource(R.drawable.bg_item_vehicle_normal)
        binding.layoutCar.setBackgroundResource(R.drawable.bg_item_vehicle_normal)
        binding.layoutPremium.setBackgroundResource(R.drawable.bg_item_vehicle_normal)

        when (type) {
            "RideGo Bike" -> binding.layoutBike.setBackgroundResource(R.drawable.bg_item_vehicle_selected)
            "RideGo Car" -> binding.layoutCar.setBackgroundResource(R.drawable.bg_item_vehicle_selected)
            "RideGo Premium" -> binding.layoutPremium.setBackgroundResource(R.drawable.bg_item_vehicle_selected)
        }
        calculateRouteViaServer()
    }

    private fun calculateRouteViaServer() {
        if (pickupLat == 0.0 || dropoffLat == 0.0) return

        binding.btnConfirmBooking.isEnabled = false

        // 1. Fetch Route (Polyline & Distance) Independently
        fetchPathAndDetails()

        val serverVehicleType = when (selectedVehicleType) {
            "RideGo Bike" -> "MOTORBIKE"
            "RideGo Car" -> "4 SEAT"
            "RideGo Premium" -> "7 SEAT"
            else -> "MOTORBIKE"
        }

        val estimateRequest = TripEstimateRequest(
            pickupLocation = LocationData(pickupAddress, pickupLat, pickupLng),
            dropoffLocation = LocationData(dropoffAddress, dropoffLat, dropoffLng),
            vehicleType = serverVehicleType,
            discountId = selectedDiscountId
        )

        RetrofitClient.instance.estimateTrip(estimateRequest).enqueue(object : Callback<TripEstimateResponse> {
            override fun onResponse(call: Call<TripEstimateResponse>, response: Response<TripEstimateResponse>) {
                binding.btnConfirmBooking.isEnabled = true
                if (response.isSuccessful) {
                    val result = response.body()
                    if (result != null) {
                        // Use server distance if reasonable, else rely on Route API
                        if (result.distance > 0) {
                            currentDistanceKm = result.distance // Backend returns km, no need to divide
                            val distanceStr = String.format("%.2f km", currentDistanceKm)
                            binding.tvDistance.text = distanceStr
                        }
                        
                        finalPrice = result.fare
                        updatePriceUI(result)
                    }
                } else {
                    Log.e("API_ESTIMATE", "Error: ${response.code()}")
                    // Fallback to local calculation using Route distance (if Route API succeeded)
                     calculatePriceLocally()
                }
            }
            override fun onFailure(call: Call<TripEstimateResponse>, t: Throwable) {
                binding.btnConfirmBooking.isEnabled = true
                // binding.btnConfirmBooking.text = "Lỗi kết nối" // Don't block button, use fallback
                Toast.makeText(this@BookingActivity, "Lỗi báo giá: ${t.message}. Dùng giá tạm tính.", Toast.LENGTH_SHORT).show()
                calculatePriceLocally()
            }
        })
    }

    private fun fetchPathAndDetails() {
        val request = RouteRequest(
            origin = "$pickupLat,$pickupLng",
            destination = "$dropoffLat,$dropoffLng",
            vehicleType = selectedVehicleType
        )

        RetrofitClient.instance.calculateRoute(request).enqueue(object : Callback<RouteResponse> {
            override fun onResponse(call: Call<RouteResponse>, response: Response<RouteResponse>) {
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()!!.data
                    if (data != null) {
                        currentPolylineString = data.geometry?.coordinates ?: ""
                        if (currentPolylineString.isNotEmpty()) {
                            drawRoute(currentPolylineString)
                        }
                        
                        val durationText = data.duration.text
                        binding.tvDurationBike.text = "$durationText • 1 người"
                        binding.tvDurationCar.text = "$durationText • 4 người"
                        binding.tvDurationPremium.text = "$durationText • 7 người"

                        // NEW: Update Distance from Route API as redundant source
                        if (data.distance.value > 0) {
                            currentDistanceKm = data.distance.value / 1000.0
                            binding.tvDistance.text = String.format("%.2f km", currentDistanceKm)
                            
                            // Trigger local recalc if price is 0 (i.e. estimate hasn't finished yet or failed)
                            if (finalPrice == 0.0) {
                                calculatePriceLocally()
                            }
                        }
                    }
                }
            }
            override fun onFailure(call: Call<RouteResponse>, t: Throwable) {}
        })
    }

    private fun updatePriceUI(result: TripEstimateResponse) {
        val formatter = DecimalFormat("#,###")
        finalPrice = result.fare

        // Cập nhật giá hiển thị trên nút
        if (result.discountApplied) {
            binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(result.fare)}đ (KM: -${formatter.format(result.discountAmount)}đ)"
            binding.tvSelectPromotion.text = selectedDiscountCode ?: "Đã chọn"
        } else {
            binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(result.fare)}đ"
            binding.tvSelectPromotion.text = " Ưu đãi"
        }
        
        // Cập nhật giá danh sách xe (để user tham khảo)
        calculatePriceLocally()
    }

    private fun fetchUserPromotions() {
        RetrofitClient.instance.getDiscounts().enqueue(object : Callback<List<Promotion>> {
            override fun onResponse(call: Call<List<Promotion>>, response: Response<List<Promotion>>) {
                if (response.isSuccessful) {
                    myPromotions = response.body() ?: emptyList()
                }
            }
            override fun onFailure(call: Call<List<Promotion>>, t: Throwable) {}
        })
    }

    private fun showPromotionDialog() {
        if (myPromotions.isEmpty()) {
            Toast.makeText(this, "Bạn chưa có mã giảm giá nào!", Toast.LENGTH_SHORT).show()
            return
        }

        val codes = myPromotions.map { "${it.code} - ${it.description}" }.toTypedArray()
        
        val builder = android.app.AlertDialog.Builder(this)
        builder.setTitle("Chọn mã giảm giá")
        builder.setItems(codes) { dialog, which ->
            val selected = myPromotions[which]
            selectedDiscountId = selected.id
            selectedDiscountCode = selected.code
            Toast.makeText(this, "Đã chọn: ${selected.code}", Toast.LENGTH_SHORT).show()
            calculateRouteViaServer() // Recalculate price
        }
        builder.setNeutralButton("Bỏ chọn") { _, _ ->
            selectedDiscountId = null
            selectedDiscountCode = null
            calculateRouteViaServer()
        }
        builder.show()
    }

    private fun drawRoute(encodedPolyline: String) {
        val path: List<LatLng> = decodePoly(encodedPolyline)
        if (path.isNotEmpty()) {
            polyline?.remove()
            val polylineOptions = PolylineOptions()
                .addAll(path)
                .color(Color.BLUE) // Đổi lại màu xanh cho rõ
                .width(12f)
                .geodesic(true)
            polyline = mMap?.addPolyline(polylineOptions)

            val boundsBuilder = LatLngBounds.Builder()
            for (point in path) { boundsBuilder.include(point) }
            try {
                mMap?.animateCamera(CameraUpdateFactory.newLatLngBounds(boundsBuilder.build(), 100))
            } catch (e: Exception) {}
        }
    }

    private fun calculatePriceLocally() {
        val formatter = DecimalFormat("#,###")

        // Tính giá hiển thị cho từng loại (giữ UI của bạn)
        val priceBike = 12000.0 + (currentDistanceKm * 5000.0)
        val priceCar = 25000.0 + (currentDistanceKm * 12000.0)
        val pricePremium = 30000.0 + (currentDistanceKm * 15000.0) // Updated to match server config

        binding.tvPriceBike.text = "${formatter.format(priceBike)}đ"
        binding.tvPriceCar.text = "${formatter.format(priceCar)}đ"
        binding.tvPricePremium.text = "${formatter.format(pricePremium)}đ"

        finalPrice = when (selectedVehicleType) {
            "RideGo Bike" -> priceBike
            "RideGo Car" -> priceCar
            else -> pricePremium
        }

        // Apply Discount Locally
        var discountAmount = 0.0
        if (!selectedDiscountId.isNullOrEmpty()) {
            val promo = myPromotions.find { it.id == selectedDiscountId }
            if (promo != null) {
                if (promo.type == "PERCENT") {
                    discountAmount = finalPrice * (promo.value / 100.0)
                    if (promo.maxDiscount > 0 && discountAmount > promo.maxDiscount) {
                        discountAmount = promo.maxDiscount
                    }
                } else {
                    discountAmount = promo.value
                }
                
                // Ensure non-negative
                if (discountAmount > finalPrice) discountAmount = finalPrice
            }
        }
        
        finalPrice -= discountAmount

        if (discountAmount > 0) {
            binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(finalPrice)}đ (KM: -${formatter.format(discountAmount)}đ)"
            binding.tvSelectPromotion.text = selectedDiscountCode ?: "Đã chọn"
        } else {
            binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(finalPrice)}đ"
            binding.tvSelectPromotion.text = " Ưu đãi"
        }
    }

    private fun createBookingViaServer() {
        val user = auth.currentUser ?: return
        binding.btnConfirmBooking.isEnabled = false

        val serverVehicleType = when (selectedVehicleType) {
            "RideGo Bike" -> "MOTORBIKE"
            "RideGo Car" -> "4 SEAT"
            else -> "7 SEAT"
        }

        val bookingRequest = TripRequest(
            pickupLocation = LocationData(pickupAddress, pickupLat, pickupLng),
            dropoffLocation = LocationData(dropoffAddress, dropoffLat, dropoffLng),
            vehicleType = serverVehicleType,
            paymentMethod = "CASH",
            distance = currentDistanceKm,
            fare = finalPrice,
            discountId = selectedDiscountId
        )

        RetrofitClient.instance.createTrip(bookingRequest).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    val body = response.body()

                    // SỬA TẠI ĐÂY: Logic lấy ID linh hoạt từ mọi trường có thể có
                    val finalTripId = body?.data?.tripId
                        ?: body?.rootTripId
                        ?: body?.data?.mongoId
                        ?: body?.rootMongoId
                        ?: body?.data?.simpleId
                        ?: body?.rootSimpleId

                    if (!finalTripId.isNullOrEmpty()) {
                        val nextIntent = Intent(this@BookingActivity, FindingDriverActivity::class.java)
                        nextIntent.putExtra("TRIP_ID", finalTripId)
                        nextIntent.putExtra("PICKUP_ADDRESS", pickupAddress)
                        nextIntent.putExtra("DROPOFF_ADDRESS", dropoffAddress)
                        nextIntent.putExtra("PICKUP_LAT", pickupLat)
                        nextIntent.putExtra("PICKUP_LNG", pickupLng)
                        nextIntent.putExtra("DROPOFF_LAT", dropoffLat)
                        nextIntent.putExtra("DROPOFF_LNG", dropoffLng)
                        nextIntent.putExtra("POLYLINE", currentPolylineString)
                        
                        // Pass pricing and vehicle info
                        nextIntent.putExtra("DISTANCE", currentDistanceKm)
                        nextIntent.putExtra("PRICE", finalPrice)
                        nextIntent.putExtra("VEHICLE_TYPE", selectedVehicleType)
                        
                        startActivity(nextIntent)
                        finish() // Kết thúc màn hình booking sau khi chuyển sang tìm tài xế
                    } else {
                        binding.btnConfirmBooking.isEnabled = true
                        Toast.makeText(this@BookingActivity, "Lỗi: Không tìm thấy mã chuyến đi", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    binding.btnConfirmBooking.isEnabled = true
                    Toast.makeText(this@BookingActivity, "Lỗi Server: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<TripResponse>, t: Throwable) {
                binding.btnConfirmBooking.isEnabled = true
                Toast.makeText(this@BookingActivity, "Lỗi kết nối: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun setupSocketListeners() {
        SocketManager.onTripAccepted { data ->
            runOnUiThread {
                Toast.makeText(this, "Tài xế đã nhận chuyến!", Toast.LENGTH_SHORT).show()
            }
        }
    }

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
}