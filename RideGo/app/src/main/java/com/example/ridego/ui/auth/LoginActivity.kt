package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityLoginBinding
import com.example.ridego.ui.rider.main.RiderMainActivity

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Tuyệt đối KHÔNG thêm dòng WindowCompat.setDecorFitsSystemWindows ở đây
        // Để file XML tự xử lý khoảng cách an toàn.

        setupEvents()
    }

    private fun setupEvents() {
        // 1. Nút Tiếp tục
        binding.btnContinue.setOnClickListener {
            val phoneNumber = binding.edtPhoneNumber.text.toString()
            if (phoneNumber.isNotEmpty()) {
                // Giả lập đăng nhập thành công -> Vào Home
                navigateToHome()
            } else {
                Toast.makeText(this, "Vui lòng nhập số điện thoại", Toast.LENGTH_SHORT).show()
            }
        }

        // 2. Nút Google
        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, "Chức năng đăng nhập Google đang phát triển", Toast.LENGTH_SHORT).show()
        }

        // 3. Nút Bỏ qua -> Vào thẳng Home
        binding.tvSkipLogin.setOnClickListener {
            navigateToHome()
        }
    }

    private fun navigateToHome() {
        // ĐÃ MỞ KHÓA CODE CHUYỂN MÀN HÌNH:
        val intent = Intent(this, RiderMainActivity::class.java)
        startActivity(intent)
        finishAffinity() // Đóng Login lại để user không bấm Back quay lại được
    }
}