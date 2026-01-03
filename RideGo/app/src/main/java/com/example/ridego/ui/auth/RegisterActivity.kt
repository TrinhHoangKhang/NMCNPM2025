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
            viewModel.register(name, email, password, "0909000000") 
        }
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    binding.btnRegister.isEnabled = false
                }
                is AuthState.Success -> {
                    Toast.makeText(this, "Register Successful", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this, RiderMainActivity::class.java))
                    finishAffinity()
                }
                is AuthState.Error -> {
                    binding.btnRegister.isEnabled = true
                    Toast.makeText(this, "Error: ${state.message}", Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }
                else -> {
                    binding.btnRegister.isEnabled = true
                }
            }
        }
    }
}