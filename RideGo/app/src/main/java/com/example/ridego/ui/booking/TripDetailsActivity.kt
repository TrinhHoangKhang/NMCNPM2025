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
        val request = com.example.ridego.data.model.CancelTripRequest(tripId)
        
        binding.btnCancelTrip.isEnabled = false
        binding.btnCancelTrip.text = "Đang hủy..."

        RetrofitClient.instance.cancelTrip(request).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@TripDetailsActivity, "Đã hủy chuyến đi", Toast.LENGTH_SHORT).show()
                    updateStatusUI("CANCELLED")
                    finish() 
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
                            
                            // BUG FIX: Update status UI immediately based on fetched data
                            trip.status?.let { updateStatusUI(it) }
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
        val btnChat = binding.root.findViewById<android.view.View>(R.id.btnChat)
        val btnCall = binding.root.findViewById<android.view.View>(R.id.btnCall)

        when(status) {
            "REQUESTED" -> {
                binding.tvTripStatus.text = "Đang tìm tài xế..."
                binding.tvTripStatus.setTextColor(Color.parseColor("#FF9800"))
                binding.btnCancelTrip.visibility = android.view.View.VISIBLE
                btnChat?.visibility = android.view.View.VISIBLE
                btnCall?.visibility = android.view.View.VISIBLE
            }
            "ACCEPTED" -> {
                binding.tvTripStatus.text = "Tài xế đang đến"
                binding.tvTripStatus.setTextColor(Color.parseColor("#4CAF50")) // Green
                binding.btnCancelTrip.visibility = android.view.View.VISIBLE
                btnChat?.visibility = android.view.View.VISIBLE
                btnCall?.visibility = android.view.View.VISIBLE
            }
            "IN_PROGRESS" -> {
                 binding.tvTripStatus.text = "Đang trong chuyến đi"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#2196F3")) // Blue
                 binding.btnCancelTrip.visibility = android.view.View.GONE // Cannot cancel during trip usually
                 btnChat?.visibility = android.view.View.VISIBLE
                 btnCall?.visibility = android.view.View.VISIBLE
            }
            "ARRIVED" -> {
                 binding.tvTripStatus.text = "Đã đến nơi - Vui lòng thanh toán"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#FF9800")) // Orange
                 binding.btnCancelTrip.visibility = android.view.View.GONE
                 btnChat?.visibility = android.view.View.VISIBLE
                 btnCall?.visibility = android.view.View.VISIBLE
            }
            "PAYMENT_PROCESSING" -> {
                 binding.tvTripStatus.text = "Đang xử lý thanh toán..."
                 binding.tvTripStatus.setTextColor(Color.parseColor("#FF9800"))
                 binding.btnCancelTrip.visibility = android.view.View.GONE
                 btnChat?.visibility = android.view.View.VISIBLE
            }
            "COMPLETED" -> {
                 binding.tvTripStatus.text = "Chuyến đi hoàn tất"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#4CAF50"))
                 binding.btnCancelTrip.visibility = android.view.View.GONE
                 binding.btnRateTrip.visibility = android.view.View.VISIBLE
                 binding.btnRateTrip.setOnClickListener { showRatingDialog() }
                 
                 val btnGetBill = binding.root.findViewById<android.view.View>(R.id.btnGetBill)
                 btnGetBill?.visibility = android.view.View.VISIBLE
                 btnGetBill?.setOnClickListener { showBillDialog() }

                 btnChat?.visibility = android.view.View.GONE
                 btnCall?.visibility = android.view.View.GONE
                 
                 // Check if we should auto-show rating (e.g. valid timestamp or flag). 
                 // For now, simple call is fine, but maybe verify if not already rated?
                 // Current API rateTrip doesn't block re-rating in UI, backend might.
                 // We'll rely on user click mostly, or auto-show ONCE if we tracked it.
                 // The 'trip_completed' event calls this, so it auto-shows on real-time completion.
                 // On re-open (fetchTripDetails), it will just show button. That's good behavior.
            }
            "CANCELLED" -> {
                 binding.tvTripStatus.text = "Đã hủy"
                 binding.tvTripStatus.setTextColor(Color.RED)
                 binding.btnCancelTrip.visibility = android.view.View.GONE
                 binding.btnRateTrip.visibility = android.view.View.VISIBLE
                 binding.btnRateTrip.setOnClickListener { showRatingDialog() }
                 
                 val btnGetBill = binding.root.findViewById<android.view.View>(R.id.btnGetBill)
                 btnGetBill?.visibility = android.view.View.VISIBLE
                 btnGetBill?.setOnClickListener { showBillDialog() }

                 btnChat?.visibility = android.view.View.GONE
                 btnCall?.visibility = android.view.View.GONE
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
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE))) 
        } else {
            driverMarker?.position = pos
        }
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
        } catch (e: Exception) {}
    }

    private fun fetchAndShowQR() {
        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setMessage("Đang tạo mã QR...")
            .setCancelable(false)
            .create()
        dialog.show()

        RetrofitClient.instance.getPaymentQR(tripId).enqueue(object : Callback<com.example.ridego.data.model.PaymentQRResponse> {
            override fun onResponse(call: Call<com.example.ridego.data.model.PaymentQRResponse>, response: Response<com.example.ridego.data.model.PaymentQRResponse>) {
                dialog.dismiss()
                if (response.isSuccessful && response.body() != null) {
                    val qrData = response.body()!!
                    showQRDialog(qrData.qrUrl, qrData.amount)
                } else {
                    Toast.makeText(this@TripDetailsActivity, "Lỗi tạo QR: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<com.example.ridego.data.model.PaymentQRResponse>, t: Throwable) {
                dialog.dismiss()
                Toast.makeText(this@TripDetailsActivity, "Lỗi mạng: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun showQRDialog(qrUrl: String, amount: Double) {
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        val inflater = layoutInflater
        val dialogLayout = inflater.inflate(R.layout.dialog_payment_qr, null)
        val imgQR = dialogLayout.findViewById<android.widget.ImageView>(R.id.imgQR)
        val tvAmount = dialogLayout.findViewById<android.widget.TextView>(R.id.tvAmount)

        val formatter = DecimalFormat("#,###")
        tvAmount.text = "Số tiền: ${formatter.format(amount)}đ"

        com.bumptech.glide.Glide.with(this)
            .load(qrUrl)
            .placeholder(android.R.drawable.ic_menu_gallery)
            .into(imgQR)

        builder.setView(dialogLayout)
            .setTitle("Quét mã để thanh toán")
            .setPositiveButton("Đã chuyển khoản") { _, _ ->
                submitPayment("WALLET")
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun showRatingDialog() {
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        val inflater = layoutInflater
        val dialogLayout = inflater.inflate(R.layout.dialog_rating, null)
        
        val rbDriver = dialogLayout.findViewById<android.widget.RatingBar>(R.id.rbDriver)
        val rbTrip = dialogLayout.findViewById<android.widget.RatingBar>(R.id.rbTrip)
        val etComment = dialogLayout.findViewById<android.widget.EditText>(R.id.etComment)

        builder.setView(dialogLayout)
            .setTitle("Đánh giá chuyến đi")
            .setPositiveButton("Gửi đánh giá") { _, _ ->
                val driverRating = rbDriver.rating
                val tripRating = rbTrip.rating
                val comment = etComment.text.toString()
                submitRating(driverRating, tripRating, comment)
            }
            .setNegativeButton("Để sau", null)
            .show()
    }

    private fun submitRating(driverRating: Float, tripRating: Float, comment: String) {
        val request = com.example.ridego.data.model.RateTripRequest(driverRating, tripRating, comment)
        RetrofitClient.instance.rateTrip(tripId, request).enqueue(object : Callback<com.example.ridego.data.model.RateTripResponse> {
             override fun onResponse(call: Call<com.example.ridego.data.model.RateTripResponse>, response: Response<com.example.ridego.data.model.RateTripResponse>) {
                 if (response.isSuccessful) {
                     Toast.makeText(this@TripDetailsActivity, "Cảm ơn đánh giá của bạn!", Toast.LENGTH_SHORT).show()
                     binding.btnRateTrip.isEnabled = false
                     binding.btnRateTrip.text = "Đã đánh giá"
                 } else {
                     Toast.makeText(this@TripDetailsActivity, "Lỗi đánh giá: ${response.code()}", Toast.LENGTH_SHORT).show()
                 }
             }
             override fun onFailure(call: Call<com.example.ridego.data.model.RateTripResponse>, t: Throwable) {}
        })
    }
    private fun showBillDialog() {
        // Need currentTrip data. We fetch it in fetchTripDetails.
        // Let's store currentTrip globally or fetch again? 
        // Better store it.
        // For now, let's just use the data we have on UI or fetch fresh.
        // Actually, fetching fresh ensures accuracy.
        RetrofitClient.instance.getTripDetails(tripId).enqueue(object : Callback<TripResponse> {
            override fun onResponse(call: Call<TripResponse>, response: Response<TripResponse>) {
                if(response.isSuccessful) {
                    val trip = response.body()?.data
                    if(trip != null) {
                         val dialogView = layoutInflater.inflate(R.layout.dialog_bill_detail, null)
                         val dialog = androidx.appcompat.app.AlertDialog.Builder(this@TripDetailsActivity)
                            .setView(dialogView)
                            .create()
                         dialog.window?.setBackgroundDrawable(android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT))

                         val tvBaseFare = dialogView.findViewById<android.widget.TextView>(R.id.tvBaseFare)
                         val tvDiscount = dialogView.findViewById<android.widget.TextView>(R.id.tvDiscount)
                         val tvPlatformFee = dialogView.findViewById<android.widget.TextView>(R.id.tvPlatformFee)
                         val tvTotalFare = dialogView.findViewById<android.widget.TextView>(R.id.tvTotalFare)
                         val btnClose = dialogView.findViewById<android.widget.Button>(R.id.btnCloseBill)

                         val formatter = DecimalFormat("#,###")
                         val total = trip.fare
                         val discount = trip.discountAmount ?: 0.0
                         
                         tvBaseFare.text = "${formatter.format(total + discount)}đ"
                         tvDiscount.text = "-${formatter.format(discount)}đ"
                         tvPlatformFee.text = "Đã bao gồm"
                         tvTotalFare.text = "${formatter.format(total)}đ"

                         btnClose.setOnClickListener { dialog.dismiss() }
                         dialog.show()
                    }
                }
            }
            override fun onFailure(call: Call<TripResponse>, t: Throwable) {}
        })
    }
}
