package com.example.ridego.ui.rider.main

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityRiderMainBinding
class RiderMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRiderMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRiderMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBottomNav()
    }

    private fun setupBottomNav() {
        // Xử lý sự kiện click cho nút "Đặt xe" to ở giữa
        binding.fabBooking.setOnClickListener {
            Toast.makeText(this, "Mở màn hình đặt xe!", Toast.LENGTH_SHORT).show()
        }

        // Bạn có thể thêm xử lý click cho các tab khác ở đây nếu cần
    }
}