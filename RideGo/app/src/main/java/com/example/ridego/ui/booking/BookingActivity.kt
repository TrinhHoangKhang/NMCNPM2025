package com.example.ridego.ui.booking

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityBookingBinding

class BookingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityBookingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        binding.btnConfirmBooking.setOnClickListener {
            // Xử lý đặt xe thành công
            Toast.makeText(this, "Đang tìm tài xế...", Toast.LENGTH_LONG).show()
            // Có thể mở màn hình "Đang tìm xe" tại đây
        }
    }
}