package com.example.ridego.ui.auth

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityRegisterBinding
import android.content.Intent
import com.example.ridego.ui.rider.main.RiderMainActivity



class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: AuthViewModel by viewModels {
        AuthViewModelFactory(AuthRepository())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEvents()
        observeViewModel()
    }

    private fun setupEvents() {
        binding.btnRegister.setOnClickListener {
            val name = binding.edtName.text.toString().trim()
            val email = binding.edtEmail.text.toString().trim()
            val password = binding.edtPassword.text.toString().trim()

            if (email.isEmpty() || password.length < 6) {
                Toast.makeText(this, "Email hoặc mật khẩu (>=6) không hợp lệ", Toast.LENGTH_SHORT)
                    .show()
                return@setOnClickListener
            }
            if (intent.getStringExtra("MODE") == "ADD_EMAIL_AFTER_PHONE") {
                viewModel.linkEmail(email, password)  // Link thay vì register
            } else {
                viewModel.register(name, email, password)  // Bình thường
            }
        }

        binding.tvLogin.setOnClickListener {
            finish()
        }
    }
    private fun observeViewModel() {
        viewModel.authState.observe(this, Observer { state ->
            when (state) {

                is AuthState.Loading -> {
                    binding.btnRegister.isEnabled = false
                }
                is AuthState.Success -> {
                    if (intent.getStringExtra("MODE") == "ADD_EMAIL_AFTER_PHONE") {
                        Toast.makeText(
                            this,
                            "Liên kết email thành công!",
                            Toast.LENGTH_SHORT
                        ).show()
                        startActivity(Intent(this, RiderMainActivity::class.java))
                        finishAffinity()
                    }
                    viewModel.resetState()
                }
                is AuthState.EmailVerificationNeeded -> {
                    val i = Intent(this, EmailVerificationActivity::class.java)
                    i.putExtra("email", state.email)
                    startActivity(i)
                    finish()
                    viewModel.resetState()
                }

                is AuthState.Error -> {
                    binding.btnRegister.isEnabled = true
                    Toast.makeText(this, "Lỗi: ${state.message}", Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }

                else -> {
                    binding.btnRegister.isEnabled = true
                }
            }
        })
    }

}