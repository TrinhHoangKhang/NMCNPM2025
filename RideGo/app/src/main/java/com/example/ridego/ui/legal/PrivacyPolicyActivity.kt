package com.example.ridego.ui.legal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityPrivacyPolicyBinding

class PrivacyPolicyActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPrivacyPolicyBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPrivacyPolicyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Nút quay lại
        binding.btnBack.setOnClickListener {
            finish()
        }
    }
}
