package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import androidx.lifecycle.lifecycleScope
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityEmailVerificationBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import kotlinx.coroutines.launch

class EmailVerificationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEmailVerificationBinding
    private val viewModel: AuthViewModel by viewModels {
        AuthViewModelFactory(AuthRepository())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEmailVerificationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val email = intent.getStringExtra("email") ?: ""
        binding.tvMessage.text =
            "Một email xác thực đã được gửi tới:\n$email\nVui lòng kiểm tra hộp thư và bấm 'Tôi đã xác thực' khi hoàn tất."

        binding.btnIVerified.setOnClickListener {
            viewModel.checkEmailVerified()
        }

        binding.btnResend.setOnClickListener {
            lifecycleScope.launch {
                val res = AuthRepository().sendEmailVerification()
                if (res.isSuccess) {
                    Toast.makeText(
                        this@EmailVerificationActivity,
                        "Email xác thực đã được gửi lại",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    Toast.makeText(
                        this@EmailVerificationActivity,
                        "Gửi lại thất bại: ${res.exceptionOrNull()?.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }

        viewModel.authState.observe(this, Observer { state ->
            when (state) {
                is AuthState.Loading -> {
                    // có thể show progress
                }

                is AuthState.EmailVerified -> {
                    showAddPhoneDialog()
                }

                is AuthState.Error -> {
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }

                else -> {}
            }
        })
    }
    private fun showAddPhoneDialog() {
        AlertDialog.Builder(this)
            .setTitle("Thêm số điện thoại?")
            .setMessage("Thêm số điện thoại để tăng bảo mật và đăng nhập nhanh hơn")
            .setCancelable(false)
            .setPositiveButton("Thêm ngay") { _, _ ->
                startActivity(Intent(this, AddPhoneActivity::class.java))
                finish()
            }
            .setNegativeButton("Bỏ qua") { _, _ ->
                startActivity(Intent(this, RiderMainActivity::class.java))
                finish()
            }
            .show()
    }
}
