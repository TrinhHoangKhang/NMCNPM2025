package com.example.ridego.ui.history

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityHistoryBinding
import com.example.ridego.model.RideHistory

class HistoryActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHistoryBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        // Dữ liệu giả lập giống ảnh mẫu
        val list = listOf(
            RideHistory("RideGo Car", "45.000đ", "Hoàn thành", "123 Nguyễn Huệ, Q.1", "456 Lê Lợi, Q.3", "15/11/2024", "14:30", "8.5 km", "25 phút", "Nguyễn Văn B", 4.8f, true),
            RideHistory("RideGo Bike", "25.000đ", "Hoàn thành", "789 Trần Hưng Đạo, Q.5", "321 Võ Văn Tần, Q.3", "14/11/2024", "09:15", "5.2 km", "15 phút", "Trần Thị C", 4.9f, false),
            RideHistory("RideGo Premium", "65.000đ", "Hoàn thành", "555 Hai Bà Trưng, Q.1", "888 Lý Thường Kiệt, Q.10", "12/11/2024", "18:45", "12.3 km", "35 phút", "Lê Văn D", 4.7f, true)
        )

        binding.rvHistory.layoutManager = LinearLayoutManager(this)
        binding.rvHistory.adapter = HistoryAdapter(list)
    }
}