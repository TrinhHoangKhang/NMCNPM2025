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
        binding.rvHistory.adapter = HistoryAdapter(emptyList(), {}, {}, {})
    }

    private fun fetchHistory() {
        RetrofitClient.instance.getTripHistory().enqueue(object : Callback<List<RideHistory>> {
            override fun onResponse(call: Call<List<RideHistory>>, response: Response<List<RideHistory>>) {
                if (response.isSuccessful) {
                    val list = response.body() ?: emptyList()
                    val sortedList = list.sortedByDescending { it.createdAt }
                    binding.rvHistory.adapter = HistoryAdapter(sortedList, 
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