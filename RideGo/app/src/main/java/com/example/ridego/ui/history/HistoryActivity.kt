package com.example.ridego.ui.history

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityHistoryBinding
import com.example.ridego.data.model.RideHistory
import com.example.ridego.data.api.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class HistoryActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHistoryBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
        fetchHistory()
    }

    private fun setupRecyclerView() {
        binding.rvHistory.layoutManager = LinearLayoutManager(this)
        binding.rvHistory.adapter = HistoryAdapter(emptyList()) {}
    }

    private fun fetchHistory() {
        RetrofitClient.instance.getTripHistory().enqueue(object : Callback<List<RideHistory>> {
            override fun onResponse(call: Call<List<RideHistory>>, response: Response<List<RideHistory>>) {
                if (response.isSuccessful) {
                    val list = response.body() ?: emptyList()
                    val sortedList = list.sortedByDescending { it.createdAt }
                    binding.rvHistory.adapter = HistoryAdapter(sortedList) { trip ->
                         val intent = android.content.Intent(this@HistoryActivity, com.example.ridego.ui.booking.TripDetailsActivity::class.java)
                         intent.putExtra("TRIP_ID", trip.id)
                         startActivity(intent)
                    }
                } else {
                    Toast.makeText(this@HistoryActivity, "Lỗi tải lịch sử: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<RideHistory>>, t: Throwable) {
                Log.e("HISTORY", "Error: ${t.message}")
                Toast.makeText(this@HistoryActivity, "Lỗi kết nối", Toast.LENGTH_SHORT).show()
            }
        })
    }
}