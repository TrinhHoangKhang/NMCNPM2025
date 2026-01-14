package com.example.ridego.ui.history

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.databinding.ItemTripHistoryBinding
import com.example.ridego.data.model.RideHistory
import java.text.DecimalFormat

class HistoryAdapter(
    private val list: List<RideHistory>,
    private val onItemClick: (RideHistory) -> Unit,
    private val onReorderClick: (RideHistory) -> Unit,
    private val onGetBillClick: (RideHistory) -> Unit
) : RecyclerView.Adapter<HistoryAdapter.HistoryViewHolder>() {

    inner class HistoryViewHolder(val binding: ItemTripHistoryBinding) :
        RecyclerView.ViewHolder(binding.root) {
        init {
            binding.root.setOnClickListener {
                onItemClick(list[adapterPosition])
            }
            // Bind Action Buttons
            binding.root.findViewById<android.widget.Button>(com.example.ridego.R.id.btnReorder).setOnClickListener {
                onReorderClick(list[adapterPosition])
            }
            binding.root.findViewById<android.widget.Button>(com.example.ridego.R.id.btnGetBill).setOnClickListener {
                 onGetBillClick(list[adapterPosition])
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val binding = ItemTripHistoryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return HistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        val item = list[position]
        holder.binding.apply {
            // Service Name mapping
            val serviceName = when (item.vehicleType) {
                "MOTORBIKE", "BIKE" -> "RideGo Bike"
                "4 SEAT", "CAR", "4_SEATS" -> "RideGo Car"
                "7 SEAT", "PREMIUM", "7_SEATS" -> "RideGo Premium"
                else -> "RideGo Service"
            }
            tvServiceName.text = serviceName

            // Price formatting
            val formatter = DecimalFormat("#,###")
            tvPrice.text = "${formatter.format(item.fare)}đ"

            // Status mapping
            tvStatus.text = when (item.status) {
                "COMPLETED" -> "Hoàn thành"
                "CANCELLED" -> "Đã hủy"
                "IN_PROGRESS" -> "Đang đi"
                "ACCEPTED" -> "Tài xế nhận"
                "REQUESTED" -> "Đang tìm"
                else -> item.status
            }
            
            // Color for status
            if (item.status == "CANCELLED") {
                tvStatus.setTextColor(android.graphics.Color.RED)
                tvStatus.setBackgroundResource(com.example.ridego.R.drawable.bg_status_cancelled)
            } else {
                tvStatus.setTextColor(android.graphics.Color.parseColor("#4CAF50"))
                tvStatus.setBackgroundResource(com.example.ridego.R.drawable.bg_status_completed)
            }

            // Locations
            tvPickup.text = item.pickupLocation?.address ?: "Không xác định"
            tvDropoff.text = item.dropoffLocation?.address ?: "Không xác định"

            // Date Time parsing (assuming createdAt is ISO string)
            try {
                // Simple parsing for display, can be improved with DateFormatter
                val parts = item.createdAt.split("T")
                val datePart = parts[0]
                val timePart = parts.getOrNull(1)?.take(5) ?: ""
                tvDateTime.text = "$datePart • $timePart"
            } catch (e: Exception) {
                tvDateTime.text = item.createdAt
            }

            // Distance
            tvDistance.text = "${String.format("%.1f", item.distance / 1000.0)} km"

            // Driver Info
            if (!item.driverName.isNullOrEmpty()) {
                tvDriverName.text = item.driverName
                layoutDriver.visibility = android.view.View.VISIBLE
            } else {
                layoutDriver.visibility = android.view.View.GONE
            }
            
            // Icon
            if (serviceName.contains("Bike")) {
                imgServiceIcon.setImageResource(com.example.ridego.R.drawable.ic_motorcycle)
            } else {
                imgServiceIcon.setImageResource(com.example.ridego.R.drawable.ic_car_logo)
            }
        }
    }

    override fun getItemCount() = list.size
}
