package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Patterns  // Thêm import này để check email format
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityAddEmailBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.google.firebase.auth.FirebaseAuth

class AddEmailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddEmailBinding
    private val viewModel: AuthViewModel by viewModels { AuthViewModelFactory(AuthRepository()) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddEmailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEvents()
        observeViewModel()
    }

    private fun setupEvents() {
        binding.btnAddEmail.setOnClickListener {
            val email = binding.edtEmail.text.toString().trim()
            val password = binding.edtPassword.text.toString().trim()

            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {  // Sửa: Check email hợp lệ
                Toast.makeText(this, "Email không hợp lệ", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password.length < 6) {
                Toast.makeText(this, "Mật khẩu phải ít nhất 6 ký tự", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnAddEmail.isEnabled = false
            viewModel.linkEmail(email, password)
        }

        // Nút bỏ qua - vào thẳng màn hình chính
        binding.tvSkip.setOnClickListener {
            navigateToHome()
        }
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this) { state ->
            binding.btnAddEmail.isEnabled = true

            when (state) {
                is AuthState.Loading -> {
                    // Có thể show progress
                }

                is AuthState.Success -> {
                    Toast.makeText(this, "Liên kết email thành công!", Toast.LENGTH_SHORT).show()
                    sendEmailVerification()  // Sửa: Gửi email verify sau link
                }

                is AuthState.Error -> {
                    val message = when {
                        state.message?.contains("email address is already in use") == true -> "Email này đã được sử dụng cho tài khoản khác. Vui lòng dùng email khác."
                        state.message?.contains("invalid") == true -> "Thông tin không hợp lệ, vui lòng kiểm tra lại."
                        else -> "Lỗi: ${state.message}"
                    }
                    Toast.makeText(this, message, Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }

                else -> {}
            }
        }
    }

    private fun sendEmailVerification() {
        FirebaseAuth.getInstance().currentUser?.sendEmailVerification()
            ?.addOnSuccessListener {
                Toast.makeText(
                    this,
                    "Đã gửi email xác thực đến địa chỉ của bạn. Vui lòng kiểm tra và xác thực trước khi đăng nhập bằng email.",
                    Toast.LENGTH_LONG
                ).show()
                navigateToHome()
            }
            ?.addOnFailureListener {
                Toast.makeText(this, "Lỗi gửi email xác thực: ${it.message}", Toast.LENGTH_LONG)
                    .show()
                navigateToHome()
            }
    }

    private fun navigateToHome() {
        val intent = Intent(this, RiderMainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}