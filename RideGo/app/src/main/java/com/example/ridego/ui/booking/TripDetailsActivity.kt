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
            // TODO: Implement cancel logic or reuse from FindingDriverActivity
            Toast.makeText(this, "Tính năng hủy đang phát triển", Toast.LENGTH_SHORT).show()
        }
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
    }
    
    private fun updateStatusUI(status: String) {
        when(status) {
            "ACCEPTED" -> {
                binding.tvTripStatus.text = "Tài xế đang đến"
                binding.tvTripStatus.setTextColor(Color.parseColor("#4CAF50")) // Green
            }
            "IN_PROGRESS" -> {
                 binding.tvTripStatus.text = "Đang trong chuyến đi"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#2196F3")) // Blue
            }
            "COMPLETED" -> {
                 binding.tvTripStatus.text = "Chuyến đi hoàn tất"
                 binding.tvTripStatus.setTextColor(Color.parseColor("#4CAF50"))
                 Toast.makeText(this, "Chuyến đi đã hoàn thành!", Toast.LENGTH_LONG).show()
                 // Show rating dialog or finish
            }
            "CANCELLED" -> {
                 binding.tvTripStatus.text = "Đã hủy"
                 binding.tvTripStatus.setTextColor(Color.RED)
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
