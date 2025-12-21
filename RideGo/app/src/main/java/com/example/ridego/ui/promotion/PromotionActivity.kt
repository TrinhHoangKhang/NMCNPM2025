package com.example.ridego.ui.promotion

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityPromotionBinding
import com.example.ridego.data.model.Promotion

class PromotionActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPromotionBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPromotionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
        setupTabs()
    }

    private fun setupRecyclerView() {
        val list = listOf(
            Promotion("Giảm 50% cho chuyến đầu", "Giảm tối đa 50k", "NEWUSER50", "31/12/2024", "Giảm\n50%"),
            Promotion("Giảm 30% cuối tuần", "Áp dụng t7, cn", "WEEKEND30", "30/11/2024", "Giảm\n30%"),
            Promotion("Hoàn tiền 20.000đ", "Đơn từ 100k", "CASHBACK20", "25/12/2024", "Hoàn\n20k"),
            Promotion("Flash Sale - Giảm 50k", "Đơn từ 150k", "FLASH50", "15/11/2024", "Giảm\n50k")
        )
        binding.rvPromotions.layoutManager = LinearLayoutManager(this)
        binding.rvPromotions.adapter = PromotionAdapter(list)
    }

    private fun setupTabs() {
        // Demo logic đổi màu tab
        binding.tabAll.setOnClickListener {
            // Reset màu các tab khác về xám
            // Set màu tabAll thành Gradient
            // Load list Tất cả
        }
        // Tương tự cho tabActive và tabUsed
    }
}