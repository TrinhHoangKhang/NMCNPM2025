package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityLoginBinding
import com.example.ridego.ui.rider.main.RiderMainActivity // Màn hình Home (Sẽ tạo sau)

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEvents()
    }

    private fun setupEvents() {
        // 1. Nút Tiếp tục (Xử lý Đăng ký/Đăng nhập SĐT)
        binding.btnContinue.setOnClickListener {
            val phoneNumber = binding.edtPhoneNumber.text.toString()
            if (phoneNumber.isNotEmpty()) {
                // TODO: Gọi API kiểm tra SĐT hoặc gửi OTP
                Toast.makeText(this, "Đang xử lý SĐT: $phoneNumber", Toast.LENGTH_SHORT).show()

                // Giả lập đăng nhập thành công -> Vào Home
                navigateToHome()
            } else {
                Toast.makeText(this, "Vui lòng nhập số điện thoại", Toast.LENGTH_SHORT).show()
            }
        }

        // 2. Nút Google
        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, "Chức năng đăng nhập Google đang phát triển", Toast.LENGTH_SHORT).show()
            // Logic Firebase Google Auth sẽ viết ở đây sau này
        }

        // 3. Nút Bỏ qua -> Vào thẳng Home
        binding.tvSkipLogin.setOnClickListener {
            navigateToHome()
        }
    }

    private fun navigateToHome() {
        // Vì chưa có màn hình Home, mình sẽ hiển thị thông báo
        Toast.makeText(this, "Chuyển đến màn hình Home!", Toast.LENGTH_SHORT).show()

        // KHI NÀO CÓ HOME ACTIVITY, BỎ COMMENT DÒNG DƯỚI:
        val intent = Intent(this, RiderMainActivity::class.java)
        startActivity(intent)
        finishAffinity() // Xóa hết stack để không back lại được màn Login
    }
}