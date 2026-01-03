package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityLoginBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val viewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEvents()
        observeViewModel()
        
        // Force show Email input for API login
        binding.layoutEmailInput.visibility = View.VISIBLE
        binding.layoutPhoneInput.visibility = View.GONE
        binding.btnContinue.visibility = View.GONE // Ensure the 'Continue' button for phone is hidden if present
        
        // Since we are forcing Email, maybe we should hide the toggle 'tvEmailLogin' or update its text.
        // For now, let's just make it work.
    }

    private fun setupEvents() {
        binding.btnLogin.setOnClickListener {
            val email = binding.edtEmail.text.toString().trim()
            val password = binding.edtPassword.text.toString().trim()
            if (email.isEmpty() || password.length < 6) {
                Toast.makeText(this, "Email or password invalid", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.login(email, password)
        }

        binding.tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.tvSkipLogin.setOnClickListener {
            // For dev/testing
             navigateToHome()
        }
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    // Show progress
                    binding.btnLogin.isEnabled = false
                }
                is AuthState.Success -> {
                    Toast.makeText(this, "Login Successful: ${state.user.name}", Toast.LENGTH_SHORT).show()
                    navigateToHome()
                }
                is AuthState.Error -> {
                    binding.btnLogin.isEnabled = true
                    Toast.makeText(this, "Error: ${state.message}", Toast.LENGTH_LONG).show()
                    viewModel.resetState() // Reset so we can try again
                }
                else -> {
                    binding.btnLogin.isEnabled = true
                }
            }
        }
    }

    private fun navigateToHome() {
        val intent = Intent(this, RiderMainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}