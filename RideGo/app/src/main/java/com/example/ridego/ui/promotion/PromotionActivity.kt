package com.example.ridego.ui.promotion

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityPromotionBinding
import com.example.ridego.data.model.Promotion
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class PromotionActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPromotionBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPromotionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
        setupTabs()
        fetchDiscounts()
        
        binding.btnApplyCode.setOnClickListener {
            val code = binding.etPromoCode.text.toString().trim()
            if (code.isNotEmpty()) {
                claimDiscount(code)
            }
        }
    }

    private lateinit var adapter: PromotionAdapter
    private var allPromotions: List<Promotion> = emptyList()

    private fun setupRecyclerView() {
        adapter = PromotionAdapter(emptyList())
        binding.rvPromotions.layoutManager = LinearLayoutManager(this)
        binding.rvPromotions.adapter = adapter
        
        adapter.setOnUseClickListener { promo ->
            Toast.makeText(this, "Dùng mã: ${promo.code}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun fetchDiscounts() {
        Log.d("API_PROMO", "Fetching discounts...")
        com.example.ridego.data.api.RetrofitClient.instance.getDiscounts().enqueue(object : Callback<List<Promotion>> {
            override fun onResponse(call: Call<List<Promotion>>, response: Response<List<Promotion>>) {
                if (response.isSuccessful) {
                    allPromotions = response.body() ?: emptyList()
                    Log.d("API_PROMO", "Success: ${allPromotions.size} promos found")
                    updateList(allPromotions)
                } else {
                    val error = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("API_PROMO", "Error ${response.code()}: $error")
                    Toast.makeText(this@PromotionActivity, "Lỗi tải: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Promotion>>, t: Throwable) {
                Log.e("API_PROMO", "Failure: ${t.message}")
                Toast.makeText(this@PromotionActivity, "Không thể kết nối Server: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun claimDiscount(code: String) {
        val request = com.example.ridego.data.model.ClaimDiscountRequest(code)
        com.example.ridego.data.api.RetrofitClient.instance.claimDiscount(request).enqueue(object : Callback<com.example.ridego.data.model.ClaimDiscountResponse> {
            override fun onResponse(call: Call<com.example.ridego.data.model.ClaimDiscountResponse>, response: Response<com.example.ridego.data.model.ClaimDiscountResponse>) {
                if (response.isSuccessful) {
                    val body = response.body()
                    Toast.makeText(this@PromotionActivity, body?.message ?: "Nhận voucher thành công!", Toast.LENGTH_LONG).show()
                    binding.etPromoCode.text.clear()
                    fetchDiscounts() // Refresh list
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e("API_PROMO", "Claim failed: $errorBody")
                    Toast.makeText(this@PromotionActivity, "Thất bại: $errorBody", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<com.example.ridego.data.model.ClaimDiscountResponse>, t: Throwable) {
                Toast.makeText(this@PromotionActivity, "Lỗi: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun updateList(list: List<Promotion>) {
        binding.rvPromotions.adapter = PromotionAdapter(list).apply {
            setOnUseClickListener { promo ->
                 Toast.makeText(this@PromotionActivity, "Dùng mã: ${promo.code}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupTabs() {
        binding.tabAll.setOnClickListener {
            updateTabUI(binding.tabAll)
            updateList(allPromotions)
        }
        binding.tabActive.setOnClickListener {
            updateTabUI(binding.tabActive)
            updateList(allPromotions.filter { !it.isUsed })
        }
        binding.tabUsed.setOnClickListener {
            updateTabUI(binding.tabUsed)
            updateList(allPromotions.filter { it.isUsed })
        }
    }

    private fun updateTabUI(selectedTab: android.widget.TextView) {
        val tabs = listOf(binding.tabAll, binding.tabActive, binding.tabUsed)
        tabs.forEach { tab ->
            if (tab == selectedTab) {
                tab.setBackgroundResource(com.example.ridego.R.drawable.bg_button_gradient)
                tab.setTextColor(android.graphics.Color.WHITE)
                tab.setTypeface(null, android.graphics.Typeface.BOLD)
            } else {
                tab.setBackground(null)
                tab.setTextColor(android.graphics.Color.GRAY)
                tab.setTypeface(null, android.graphics.Typeface.NORMAL)
            }
        }
    }
}