package com.example.ridego.ui.auth

import android.os.Bundle
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityForgotPasswordBinding
import com.google.firebase.auth.FirebaseAuth

class ForgotPasswordActivity : AppCompatActivity() {

    private lateinit var binding: ActivityForgotPasswordBinding
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityForgotPasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)

        auth = FirebaseAuth.getInstance()

        setupEvents()
    }

    private fun setupEvents() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnSendResetEmail.setOnClickListener {
            val email = binding.edtEmail.text.toString().trim()

            if (email.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập email", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(this, "Email không hợp lệ", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            sendPasswordResetEmail(email)
        }
    }

    private fun sendPasswordResetEmail(email: String) {
        binding.btnSendResetEmail.isEnabled = false
        binding.btnSendResetEmail.text = "Đang gửi..."

        auth.sendPasswordResetEmail(email)
            .addOnCompleteListener { task ->
                binding.btnSendResetEmail.isEnabled = true
                binding.btnSendResetEmail.text = "Gửi email khôi phục"

                if (task.isSuccessful) {
                    Toast.makeText(
                        this,
                        "Email khôi phục mật khẩu đã được gửi đến $email. Vui lòng kiểm tra hộp thư của bạn.",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                } else {
                    val errorMessage = when (task.exception?.message) {
                        "There is no user record corresponding to this identifier. The user may have been deleted." ->
                            "Email này chưa được đăng ký"
                        else -> "Gửi email thất bại: ${task.exception?.message}"
                    }
                    Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show()
                }
            }
    }
}
