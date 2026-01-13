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

        // API SERVER: Mong đợi origin và destination là chuỗi "lat,lng"
        val request = RouteRequest(
            origin = "$pickupLat,$pickupLng",
            destination = "$dropoffLat,$dropoffLng",
            vehicleType = selectedVehicleType
        )

        RetrofitClient.instance.calculateRoute(request).enqueue(object : Callback<RouteResponse> {
            override fun onResponse(call: Call<RouteResponse>, response: Response<RouteResponse>) {
                binding.btnConfirmBooking.isEnabled = true
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()!!.data
                    if (data != null) {
                        currentDistanceKm = data.distance.value / 1000.0
                        currentPolylineString = data.geometry?.coordinates ?: ""

                        val durationText = data.duration.text
                        binding.tvDurationBike.text = "$durationText • 1 người"
                        binding.tvDurationCar.text = "$durationText • 4 người"
                        binding.tvDurationPremium.text = "$durationText • 7 người"

                        if (currentPolylineString.isNotEmpty()) {
                            drawRoute(currentPolylineString)
                        }
                        calculatePriceLocally()
                    }
                }
            }
            override fun onFailure(call: Call<RouteResponse>, t: Throwable) {
                binding.btnConfirmBooking.isEnabled = true
                Toast.makeText(this@BookingActivity, "Lỗi kết nối", Toast.LENGTH_SHORT).show()
            }
        })
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
        val pricePremium = 50000.0 + (currentDistanceKm * 20000.0)

        binding.tvPriceBike.text = "${formatter.format(priceBike)}đ"
        binding.tvPriceCar.text = "${formatter.format(priceCar)}đ"
        binding.tvPricePremium.text = "${formatter.format(pricePremium)}đ"

        finalPrice = when (selectedVehicleType) {
            "RideGo Bike" -> priceBike
            "RideGo Car" -> priceCar
            else -> pricePremium
        }
        binding.btnConfirmBooking.text = "Đặt xe • ${formatter.format(finalPrice)}đ"
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
            fare = finalPrice
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