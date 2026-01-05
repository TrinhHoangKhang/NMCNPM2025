package com.example.ridego.ui.booking

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.data.model.Location
import com.example.ridego.databinding.ActivityBookingBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class BookingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityBookingBinding
    private val viewModel: BookingViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        binding.btnConfirmBooking.setOnClickListener {
            val pickupLat = intent.getDoubleExtra("PICKUP_LAT", 0.0)
            val pickupLng = intent.getDoubleExtra("PICKUP_LNG", 0.0)
            val pickupAddr = intent.getStringExtra("PICKUP_ADDRESS") ?: "Unknown"

            // Dummy dropoff for demo as UI might not have it yet
            // In a real app, we'd get this from input or map
            val dropoffLat = 10.7769
            val dropoffLng = 106.7009
            val dropoffAddr = "Ben Thanh Market"

            val pickup = Location(pickupLat, pickupLng, pickupAddr)
            val dropoff = Location(dropoffLat, dropoffLng, dropoffAddr)

            viewModel.bookRide(pickup, dropoff, "Bike", 50000.0)
        }
    }

    private fun observeViewModel() {
        viewModel.bookingState.observe(this) { state ->
            when (state) {
                is BookingState.Loading -> {
                     binding.btnConfirmBooking.isEnabled = false
                     binding.btnConfirmBooking.text = "Booking..."
                }
                is BookingState.BookingSuccess -> {
                    Toast.makeText(this, "Booking Placed! Waiting for driver...", Toast.LENGTH_LONG).show()
                    binding.btnConfirmBooking.text = "Finding Driver..."
                }
                is BookingState.TripUpdate -> {
                     Toast.makeText(this, "Trip Status: ${state.status}", Toast.LENGTH_SHORT).show()
                     if (state.status == "accepted") {
                         binding.btnConfirmBooking.text = "Driver Found!"
                     }
                }
                is BookingState.Error -> {
                    binding.btnConfirmBooking.isEnabled = true
                    binding.btnConfirmBooking.text = "Confirm Booking"
                    Toast.makeText(this, "Error: ${state.message}", Toast.LENGTH_LONG).show()
                }
                else -> {}
            }
        }
    }
}