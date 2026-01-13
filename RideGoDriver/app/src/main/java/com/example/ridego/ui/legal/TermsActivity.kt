package com.example.ridego.ui.legal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityTermsBinding

class TermsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityTermsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTermsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Nút quay lại
        binding.btnBack.setOnClickListener {
            finish()
        }
    }
}
