package com.example.ridego.ui.splash

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivitySplashBinding
import com.example.ridego.ui.onboarding.OnboardingActivity
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.google.firebase.auth.FirebaseAuth

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding
    private val viewModel: SplashViewModel by viewModels()
    private val auth = FirebaseAuth.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setup ViewBinding
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Quan sát dữ liệu từ ViewModel
        viewModel.navigateToNextScreen.observe(this) { shouldNavigate ->
            if (shouldNavigate) {
                // Kiểm tra đăng nhập tự động
                checkAutoLogin()
            }
        }

        // Bắt đầu load
        viewModel.startLoading()
    }
    
    private fun checkAutoLogin() {
        val currentUser = auth.currentUser
        if (currentUser != null) {
            // Đã đăng nhập -> vào app luôn
            val intent = Intent(this, RiderMainActivity::class.java)
            startActivity(intent)
            finish()
        } else {
            // Chưa đăng nhập -> vào onboarding
            val intent = Intent(this, OnboardingActivity::class.java)
            startActivity(intent)
            finish()
        }
    }
}