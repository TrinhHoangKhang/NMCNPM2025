package com.example.ridego.ui.history

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.databinding.ItemTripHistoryBinding
import com.example.ridego.model.RideHistory

class HistoryAdapter(private val historyList: List<RideHistory>) :
    RecyclerView.Adapter<HistoryAdapter.HistoryViewHolder>() {

    inner class HistoryViewHolder(val binding: ItemTripHistoryBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val binding = ItemTripHistoryBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return HistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        val item = historyList[position]
        holder.binding.apply {
            tvServiceName.text = item.serviceName
            tvPrice.text = item.price
            tvStatus.text = item.status
            tvPickup.text = item.pickupAddress
            tvDropoff.text = item.dropoffAddress
            tvDateTime.text = "${item.date} • ${item.time}"
            tvDistance.text = "${item.distance} • ${item.duration}"
            tvDriverName.text = item.driverName

            // Xử lý icon xe
            // Bạn cần có 2 icon: ic_car_logo và ic_motor_bike (tự thêm vào drawable)
            // if (item.isCar) imgServiceIcon.setImageResource(R.drawable.ic_car_logo)
            // else imgServiceIcon.setImageResource(R.drawable.ic_motor_bike)
        }
    }

    override fun getItemCount(): Int = historyList.size
}