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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        loadTripHistory()
    }

    private fun loadTripHistory() {
        binding.rvHistory.visibility = View.GONE
        // Show loading if you have a progress bar: binding.progressBar?.visibility = View.VISIBLE

        RetrofitClient.instance.getTripHistory().enqueue(object : Callback<List<TripHistoryResponse>> {
            override fun onResponse(
                call: Call<List<TripHistoryResponse>>,
                response: Response<List<TripHistoryResponse>>
            ) {
                // binding.progressBar?.visibility = View.GONE
                
                if (response.isSuccessful && response.body() != null) {
                    val trips = response.body()!!
                    Log.d(TAG, "Loaded ${trips.size} trips")
                    
                    if (trips.isEmpty()) {
                        Toast.makeText(this@HistoryActivity, "Bạn chưa có chuyến đi nào", Toast.LENGTH_SHORT).show()
                        binding.rvHistory.visibility = View.VISIBLE
                        return
                    }
                    
                    val historyList = trips
                        .filter { it.status == "COMPLETED" }
                        .map { convertToRideHistory(it) }
                    
                    setupRecyclerView(historyList)
                    binding.rvHistory.visibility = View.VISIBLE
                } else {
                    Log.e(TAG, "Error loading trips: ${response.code()}")
                    Toast.makeText(this@HistoryActivity, "Lỗi tải dữ liệu: ${response.code()}", Toast.LENGTH_SHORT).show()
                    binding.rvHistory.visibility = View.VISIBLE
                }
            }

            override fun onFailure(call: Call<List<TripHistoryResponse>>, t: Throwable) {
                // binding.progressBar?.visibility = View.GONE
                Log.e(TAG, "Failed to load trips", t)
                Toast.makeText(this@HistoryActivity, "Lỗi kết nối: ${t.message}", Toast.LENGTH_SHORT).show()
                binding.rvHistory.visibility = View.VISIBLE
            }
        })
    }

    private fun convertToRideHistory(trip: TripHistoryResponse): RideHistory {
        // Get vehicle name
        val serviceName = when (trip.vehicleType) {
            "MOTORBIKE", "BIKE" -> "RideGo Bike"
            "4_SEATS" -> "RideGo Car"
            "7_SEATS" -> "RideGo Premium"
            else -> "RideGo"
        }
        
        // Format price
        val price = String.format("%,.0fđ", trip.fare)
        
        // Get addresses
        val pickupAddress = trip.pickup?.address ?: trip.pickupLocation?.address ?: "Không rõ điểm đón"
        val dropoffAddress = trip.destination?.address ?: trip.dropoffLocation?.address ?: "Không rõ điểm đến"
        
        // Parse date and time from completedAt or createdAt
        val dateTimeStr = trip.completedAt ?: trip.createdAt
        val (date, time) = parseDateTime(dateTimeStr)
        
        // Format distance and duration
        val distanceKm = String.format("%.1f km", trip.distance / 1000.0)
        val durationMin = String.format("%d phút", (trip.duration / 60).toInt())
        
        // Driver name (mock for now as it's not in the response)
        val driverName = "Tài xế"
        
        // Rating
        val rating = trip.ratingDriver ?: 0f
        
        // Is car?
        val isCar = trip.vehicleType in listOf("4_SEATS", "7_SEATS")
        
        return RideHistory(
            serviceName = serviceName,
            price = price,
            status = "Hoàn thành",
            pickupAddress = pickupAddress,
            dropoffAddress = dropoffAddress,
            date = date,
            time = time,
            distance = distanceKm,
            duration = durationMin,
            driverName = driverName,
            rating = rating,
            isCar = isCar
        )
    }

    private fun parseDateTime(isoString: String): Pair<String, String> {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            
            val date = inputFormat.parse(isoString)
            if (date != null) {
                Pair(dateFormat.format(date), timeFormat.format(date))
            } else {
                Pair("N/A", "N/A")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing date: $isoString", e)
            Pair("N/A", "N/A")
        }
    }

    private fun setupRecyclerView(list: List<RideHistory>) {
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