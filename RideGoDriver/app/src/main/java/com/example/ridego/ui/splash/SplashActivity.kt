package com.example.ridego.ui.splash

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivitySplashBinding
import com.example.ridego.ui.onboarding.OnboardingActivity

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding
    private val viewModel: SplashViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setup ViewBinding
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Quan sát dữ liệu từ ViewModel
        viewModel.navigateToNextScreen.observe(this) { shouldNavigate ->
            if (shouldNavigate) {
                // Tạm thời comment lại vì chưa có LoginActivity
                val intent = Intent(this, OnboardingActivity::class.java)
                startActivity(intent)
                finish()
            }
        }

        // Bắt đầu load
        viewModel.startLoading()
    }
}