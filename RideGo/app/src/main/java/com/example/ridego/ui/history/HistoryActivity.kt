package com.example.ridego.ui.history

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityHistoryBinding
import com.example.ridego.model.RideHistory
import com.example.ridego.data.api.RetrofitClient
import com.example.ridego.data.model.TripHistoryResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Locale

class HistoryActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHistoryBinding
    private val TAG = "HistoryActivity"
    private var originalList: List<RideHistory> = emptyList()
    private var currentFilter = "ALL" // ALL, COMPLETED, CANCELLED
    private var currentSort = "TIME_DESC" // TIME_DESC, TIME_ASC, PRICE_DESC, PRICE_ASC, DISTANCE_DESC, DISTANCE_ASC

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
        setupFilters()
        setupSort()
        fetchHistory()
    }

    private fun setupFilters() {
        binding.filterAll.setOnClickListener { updateFilter("ALL") }
        binding.filterCompleted.setOnClickListener { updateFilter("COMPLETED") }
        binding.filterCancelled.setOnClickListener { updateFilter("CANCELLED") }
    }
    
    private fun updateFilter(filter: String) {
        currentFilter = filter
        updateFilterUI()
        applyFilterAndSort()
    }
    
    private fun updateFilterUI() {
        val selectedBg = com.example.ridego.R.drawable.bg_purple_rounded
        val unselectedBg = com.example.ridego.R.drawable.bg_white_rounded_border
        val selectedColor = android.graphics.Color.WHITE
        val unselectedColor = android.graphics.Color.parseColor("#757575")

        binding.filterAll.setBackgroundResource(if (currentFilter == "ALL") selectedBg else unselectedBg)
        binding.filterAll.setTextColor(if (currentFilter == "ALL") selectedColor else unselectedColor)
        
        binding.filterCompleted.setBackgroundResource(if (currentFilter == "COMPLETED") selectedBg else unselectedBg)
        binding.filterCompleted.setTextColor(if (currentFilter == "COMPLETED") selectedColor else unselectedColor)
        
        binding.filterCancelled.setBackgroundResource(if (currentFilter == "CANCELLED") selectedBg else unselectedBg)
        binding.filterCancelled.setTextColor(if (currentFilter == "CANCELLED") selectedColor else unselectedColor)
    }

    private fun setupSort() {
        binding.btnSort.setOnClickListener {
            showSortDialog()
        }
    }

    private fun showSortDialog() {
        val options = arrayOf(
            "Mới nhất", "Cũ nhất",
            "Giá cao nhất", "Giá thấp nhất", 
            "Xa nhất", "Gần nhất"
        )
        // Map index to internal sort key
        val sortKeys = arrayOf(
            "TIME_DESC", "TIME_ASC",
            "PRICE_DESC", "PRICE_ASC",
            "DISTANCE_DESC", "DISTANCE_ASC"
        )
        
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Sắp xếp theo")
            .setItems(options) { _, which ->
                currentSort = sortKeys[which]
                applyFilterAndSort()
            }
            .show()
    }

    private fun applyFilterAndSort() {
        var list = originalList
        
        // Filter
        if (currentFilter != "ALL") {
            list = list.filter { it.status == currentFilter }
        }
        
        // Sort
        list = when(currentSort) {
            "TIME_DESC" -> list.sortedByDescending { it.createdAt }
            "TIME_ASC" -> list.sortedBy { it.createdAt }
            "PRICE_DESC" -> list.sortedByDescending { it.fare }
            "PRICE_ASC" -> list.sortedBy { it.fare }
            "DISTANCE_DESC" -> list.sortedByDescending { it.distance }
            "DISTANCE_ASC" -> list.sortedBy { it.distance }
            else -> list.sortedByDescending { it.createdAt }
        }
        
        updateAdapter(list)
    }

    private fun updateAdapter(list: List<RideHistory>) {
        binding.rvHistory.adapter = HistoryAdapter(list, 
            onItemClick = { trip ->
                 val intent = android.content.Intent(this@HistoryActivity, com.example.ridego.ui.booking.TripDetailsActivity::class.java)
                 intent.putExtra("TRIP_ID", trip.id)
                 startActivity(intent)
            },
            onReorderClick = { trip ->
                val intent = android.content.Intent(this@HistoryActivity, com.example.ridego.ui.booking.BookingActivity::class.java)
                intent.putExtra("IS_BOOKING_FLOW", true)
                intent.putExtra("PICKUP_ADDRESS", trip.pickupLocation?.address)
                intent.putExtra("PICKUP_LAT", trip.pickupLocation?.lat)
                intent.putExtra("PICKUP_LNG", trip.pickupLocation?.lng)
                intent.putExtra("DROPOFF_ADDRESS", trip.dropoffLocation?.address)
                intent.putExtra("DROPOFF_LAT", trip.dropoffLocation?.lat)
                intent.putExtra("DROPOFF_LNG", trip.dropoffLocation?.lng)
                            
                val vehicleType = when (trip.vehicleType) {
                    "MOTORBIKE", "BIKE" -> "RideGo Bike"
                    "4 SEAT", "CAR", "4_SEATS" -> "RideGo Car"
                    "7 SEAT", "PREMIUM", "7_SEATS" -> "RideGo Premium"
                    else -> "RideGo Bike"
                }
                intent.putExtra("VEHICLE_TYPE", vehicleType)
                startActivity(intent)
            },
            onGetBillClick = { trip ->
                showBillDialog(trip)
            }
        )
    }

    private fun setupRecyclerView() {
        binding.rvHistory.layoutManager = LinearLayoutManager(this)
        binding.rvHistory.adapter = HistoryAdapter(emptyList(), {}, {}, {})
    }

    private fun fetchHistory() {
        RetrofitClient.instance.getTripHistory().enqueue(object : Callback<List<RideHistory>> {
            override fun onResponse(call: Call<List<RideHistory>>, response: Response<List<RideHistory>>) {
                if (response.isSuccessful) {
                    originalList = response.body() ?: emptyList()
                    applyFilterAndSort()
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

    private fun showBillDialog(trip: RideHistory) {
        val dialogView = layoutInflater.inflate(com.example.ridego.R.layout.dialog_bill_detail, null)
        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawable(android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT))

        val tvBaseFare = dialogView.findViewById<android.widget.TextView>(com.example.ridego.R.id.tvBaseFare)
        val tvDiscount = dialogView.findViewById<android.widget.TextView>(com.example.ridego.R.id.tvDiscount)
        val tvPlatformFee = dialogView.findViewById<android.widget.TextView>(com.example.ridego.R.id.tvPlatformFee)
        val tvTotalFare = dialogView.findViewById<android.widget.TextView>(com.example.ridego.R.id.tvTotalFare)
        val btnClose = dialogView.findViewById<android.widget.Button>(com.example.ridego.R.id.btnCloseBill)

        val formatter = java.text.DecimalFormat("#,###")
        
        val total = trip.fare
        val discount = trip.discountAmount ?: 0.0
        
        tvBaseFare.text = "${formatter.format(total + discount)}đ"
        tvDiscount.text = "-${formatter.format(discount)}đ"
        tvPlatformFee.text = "Đã bao gồm"
        tvTotalFare.text = "${formatter.format(total)}đ"

        btnClose.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }
}