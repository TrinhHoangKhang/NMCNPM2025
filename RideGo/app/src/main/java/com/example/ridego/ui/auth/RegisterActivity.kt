package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityRegisterBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: AuthViewModel by viewModels()

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
            // Phone is likely not in the register layout based on previous view? 
            // Previous view showed edtName, edtEmail, edtPassword.
            // API requires phone. I'll pass a dummy or change UI.
            // Let's pass "0000000000" for now or update UI.
            // Ideally UI should have phone input.
            
            if (email.isEmpty() || password.length < 6) {
                Toast.makeText(this, "Invalid input", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            showLoading(true)
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
        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    showLoading(true)
                }
                is AuthState.Success -> {
                    showLoading(false)
                    viewModel.resetState()
                }
                is AuthState.EmailVerificationNeeded -> {
                    showLoading(false)
                    val i = Intent(this, EmailVerificationActivity::class.java)
                    i.putExtra("email", state.email)
                    startActivity(i)
                    finish()
                    viewModel.resetState()
                }
                is AuthState.EmailVerificationNeeded -> {
                    showLoading(false)
                    val i = Intent(this, EmailVerificationActivity::class.java)
                    i.putExtra("email", state.email)
                    startActivity(i)
                    finish()
                    viewModel.resetState()
                }
                is AuthState.Error -> {
                    showLoading(false)
                    Toast.makeText(this, "Lỗi: ${state.message}", Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }
                else -> {
                    showLoading(false)
                }
            }
        }
    }

    private fun showLoading(isLoading: Boolean) {
        binding.progressBarRegister.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        binding.btnRegister.isEnabled = !isLoading
        binding.btnRegister.text = if (isLoading) "" else "Đăng ký"
    }

}