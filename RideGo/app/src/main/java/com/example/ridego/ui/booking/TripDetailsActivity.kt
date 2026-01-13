package com.example.ridego.ui.booking

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityTripDetailsBinding
import com.example.ridego.data.api.RetrofitClient
import com.example.ridego.data.model.TripResponse
import com.example.ridego.data.socket.SocketManager
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.DecimalFormat

class TripDetailsActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var binding: ActivityTripDetailsBinding
    private var mMap: GoogleMap? = null
    private var tripId: String = ""
    private var currentDriverId: String = ""
    private var driverMarker: Marker? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTripDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        tripId = intent.getStringExtra("TRIP_ID") ?: ""
        if (tripId.isEmpty()) {
            Toast.makeText(this, "Lỗi: Không tìm thấy ID chuyến đi", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        val mapFragment = supportFragmentManager.findFragmentById(R.id.mapFragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        setupUI()
        fetchTripDetails()
        setupSocketListeners()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() } // Or navigate to Home
        
        binding.btnCancelTrip.setOnClickListener {
             // Abort Trip Logic
             androidx.appcompat.app.AlertDialog.Builder(this)
                 .setTitle("Hủy chuyến đi?")
                 .setMessage("Bạn có chắc chắn muốn hủy chuyến đi này không?")
                 .setPositiveButton("Hủy chuyến") { _, _ ->
                     performCancelTrip()
                 }
                 .setNegativeButton("Quay lại", null)
                 .show()
        }

        // Setup Chat Button
        binding.root.findViewById<android.widget.ImageView>(R.id.btnChat)?.setOnClickListener {
            if (tripId.isNotEmpty()) {
                // We need driverId. 
                // Option 1: Store it in a variable when fetched.
                // Option 2: Rely on what we have.
                // Let's assume we fetch details and have access to driverId.
                // Since 'tripId' is available, let's pass that? 
                // ChatActivity expects PARTNER_ID (Driver's UID).
                // We need to fetch trip details first or store it.
                // Let's modify fetchTripDetails to store driverId in a class-level var.
                if (currentDriverId.isNotEmpty()) {
                     val intent = Intent(this, com.example.ridego.ui.chat.ChatActivity::class.java)
                     intent.putExtra("PARTNER_ID", currentDriverId)
                     startActivity(intent)
                } else {
                    Toast.makeText(this, "Chưa có thông tin tài xế", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun performCancelTrip() {
        // Use default reason or let user type? Keeping it simple "Rider aborted"
        val request = com.example.ridego.data.model.CancelTripRequest(tripId, "Rider aborted trip")
        
        binding.btnCancelTrip.isEnabled = false
        binding.btnCancelTrip.text = "Đang hủy..."

        RetrofitClient.instance.cancelTrip(request).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@TripDetailsActivity, "Đã hủy chuyến đi", Toast.LENGTH_SHORT).show()
                    updateStatusUI("CANCELLED")
                    finish() // Close details or stay? User said "abort trip right away", likely wants to exit or see cancelled state.
                    // finish() is safer to return to home.
                } else {
                    binding.btnCancelTrip.isEnabled = true
                    binding.btnCancelTrip.text = "Hủy chuyến"
                    Toast.makeText(this@TripDetailsActivity, "Hủy thất bại: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<TripResponse>, t: Throwable) {
                binding.btnCancelTrip.isEnabled = true
                binding.btnCancelTrip.text = "Hủy chuyến"
                Toast.makeText(this@TripDetailsActivity, "Lỗi mạng: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun fetchTripDetails() {
        RetrofitClient.instance.getTripDetails(tripId).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    val trip = response.body()?.data
                    if (trip != null) {
                        runOnUiThread {
                            // Update Driver Info
                            if (!trip.driverId.isNullOrEmpty()) {
                                currentDriverId = trip.driverId
                                // In a real app, we might need to fetch driver details (name, vehicle) 
                                // if they are not fully populated in the trip object.
                                // Assuming simplest case: server populates some info or we just show ID for now
                                // Actually, checking backend Trip model, it has 'driverId', not full object usually.
                                // But let's check what UI needs.
                                
                                // For now, bind what we have. If backend doesn't populate, we might need another API call.
                                // But let's assume we can get some info.
                                // If trip response doesn't have driver name, we might display "Tài xế" placeholder.
                                
                                binding.tvDriverName.text = "Tài xế đang đến" // Placeholder if name missing
                                binding.tvVehicleInfo.text = "• ${trip.vehicleType}"
                            }

                            // Update Locations
                            binding.tvPickup.text = trip.pickupLocation?.address ?: "Điểm đón"
                            binding.tvDropoff.text = trip.dropoffLocation?.address ?: "Điểm đến"
                            
                            val formatter = DecimalFormat("#,###")
                            binding.tvPrice.text = "${formatter.format(trip.fare)}đ"
                            
                            // Map bounds
                            val pickup = LatLng(trip.pickupLocation?.lat ?: 0.0, trip.pickupLocation?.lng ?: 0.0)
                            val dropoff = LatLng(trip.dropoffLocation?.lat ?: 0.0, trip.dropoffLocation?.lng ?: 0.0)
                            
                            if (pickup.latitude != 0.0 && dropoff.latitude != 0.0) {
                                updateMap(pickup, dropoff)
                            }
                        }
                    }
                }
            }
            override fun onFailure(call: Call<TripResponse>, t: Throwable) {}
        })
    }

    private fun setupSocketListeners() {
        SocketManager.connect()
        
        // Listen for Driver Location Updates
        SocketManager.on("driver_location_update") { data ->
            runOnUiThread {
                val lat = data.optDouble("lat")
                val lng = data.optDouble("lng")
                updateDriverMarker(lat, lng)
            }
        }
        
        // Listen for Trip Status Updates (Arrived, In Progress, Completed)
        SocketManager.on("trip_status_update") { data ->
             runOnUiThread {
                 val status = data.optString("status")
                 updateStatusUI(status)
             }
        }

        // NEW: Listen for Payment Requirement
        SocketManager.on("payment_required") { data ->
            // data: { tripId, amount, status: 'ARRIVED' }
            runOnUiThread {
                val amount = data.optDouble("amount")
                showPaymentDialog(amount)
                updateStatusUI("ARRIVED")
            }
        }

        // NEW: Listen for Payment Confirmation from Driver (redundant with trip_status_update but good for feedback)
        SocketManager.on("trip_completed") { data ->
            runOnUiThread {
                updateStatusUI("COMPLETED")
            }
        }
    }
    
    private fun showPaymentDialog(amount: Double) {
        val formatter = DecimalFormat("#,###")
        val amountStr = formatter.format(amount) + "đ"

        if (isFinishing || isDestroyed) return
        
        // Prevent stacking dialogs
        if (binding.tvTripStatus.text.toString().contains("Đang xử lý")) return

        val options = arrayOf("Tiền mặt (Cash)", "Ví điện tử (Wallet)")
        
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Thanh toán: $amountStr")
            .setCancelable(false)
            .setSingleChoiceItems(options, 0, null)
            .setPositiveButton("Thanh toán") { dialog, which ->
                val listView = (dialog as androidx.appcompat.app.AlertDialog).listView
                val selectedPosition = listView.checkedItemPosition
                val method = if (selectedPosition == 1) "WALLET" else "CASH"
                
                if (method == "WALLET") {
                    fetchAndShowQR()
                } else {
                    submitPayment("CASH")
                }
            }
            .setNegativeButton("Hỗ trợ") { _, _ -> 
                Toast.makeText(this, "Vui lòng liên hệ tổng đài", Toast.LENGTH_SHORT).show()
                // Keep dialog open/reopen logic if strict
            }
            .show()
    }

    private fun submitPayment(method: String) {
        val request = com.example.ridego.data.model.PaymentRequest(method)
        RetrofitClient.instance.submitPayment(tripId, request).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    val status = if (method == "CASH") "Chờ tài xế xác nhận tiền mặt..." else "Đang xử lý ví..."
                    binding.tvTripStatus.text = status
                    binding.tvTripStatus.setTextColor(Color.YELLOW)
                    Toast.makeText(this@TripDetailsActivity, "Đã gửi thanh toán: $method", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@TripDetailsActivity, "Lỗi thanh toán: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<TripResponse>, t: Throwable) {
                Toast.makeText(this@TripDetailsActivity, "Lỗi mạng: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun updateStatusUI(status: String) {
        when(status) {
            "REQUESTED" -> {
                binding.tvTripStatus.text = "Đang tìm tài xế..."
                binding.tvTripStatus.setTextColor(Color.parseColor("#FF9800"))
                binding.btnCancelTrip.visibility = android.view.View.VISIBLE
            }
            "ACCEPTED" -> {
                binding.tvTripStatus.text = "Tài xế đang đến"
                binding.tvTripStatus.setTextColor(Color.parseColor("#4CAF50")) // Green
                binding.btnCancelTrip.visibility = android.view.View.VISIBLE
            }
            "IN_PROGRESS" -> {
                 binding.tvTripStatus.text = "Đang trong chuyến đi"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#2196F3")) // Blue
                 binding.btnCancelTrip.visibility = android.view.View.VISIBLE
            }
            "ARRIVED" -> {
                 binding.tvTripStatus.text = "Đã đến nơi - Vui lòng thanh toán"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#FF9800")) // Orange
                 binding.btnCancelTrip.visibility = android.view.View.GONE
                 // Optionally re-trigger dialog if missed
            }
            "PAYMENT_PROCESSING" -> {
                 binding.tvTripStatus.text = "Đang xử lý thanh toán..."
                 binding.tvTripStatus.setTextColor(Color.parseColor("#FF9800"))
                 binding.btnCancelTrip.visibility = android.view.View.GONE
            }
            "COMPLETED" -> {
                 binding.tvTripStatus.text = "Chuyến đi hoàn tất"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#4CAF50"))
                 binding.btnCancelTrip.visibility = android.view.View.GONE
            }
            "CANCELLED" -> {
                 binding.tvTripStatus.text = "Đã hủy"
                 binding.tvTripStatus.setTextColor(Color.RED)
                 binding.btnCancelTrip.visibility = android.view.View.GONE
            }
        }
    }

    private fun updateDriverMarker(lat: Double, lng: Double) {
        if (mMap == null) return
        val pos = LatLng(lat, lng)
        if (driverMarker == null) {
            driverMarker = mMap?.addMarker(MarkerOptions()
                .position(pos)
                .title("Tài xế")
                .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_car_logo))) // Assuming icon exists or use default
        } else {
            driverMarker?.position = pos
        }
        // mMAp?.animateCamera(CameraUpdateFactory.newLatLng(pos)) // Optional follow
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
    }
    
    private fun updateMap(pickup: LatLng, dropoff: LatLng) {
        mMap?.clear()
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
    }
}
