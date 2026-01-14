package com.example.ridego.ui.profile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R
import com.example.ridego.model.DeviceSession
import com.example.ridego.databinding.ItemDeviceSessionBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class DeviceSessionAdapter(
    private val onLogoutClick: (DeviceSession) -> Unit
) : ListAdapter<DeviceSession, DeviceSessionAdapter.DeviceViewHolder>(DeviceDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DeviceViewHolder {
        val binding = ItemDeviceSessionBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return DeviceViewHolder(binding)
    }

    override fun onBindViewHolder(holder: DeviceViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class DeviceViewHolder(
        private val binding: ItemDeviceSessionBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(device: DeviceSession) {
            binding.apply {
                // Tên thiết bị
                tvDeviceName.text = if (device.deviceName.isNotEmpty()) {
                    device.deviceName
                } else if (device.deviceModel.isNotEmpty()) {
                    device.deviceModel
                } else {
                    "Thiết bị không xác định"
                }

                // Thông tin thiết bị
                val infoText = buildString {
                    if (device.deviceOs.isNotEmpty()) {
                        append(device.deviceOs)
                    }
                    if (device.appVersion.isNotEmpty()) {
                        if (isNotEmpty()) append(" • ")
                        append("RideGo v${device.appVersion}")
                    }
                }
                tvDeviceInfo.text = infoText
                tvDeviceInfo.visibility = if (infoText.isNotEmpty()) View.VISIBLE else View.GONE

                // Thời gian hoạt động gần nhất
                tvLastActive.text = formatLastActive(device.lastActive?.toDate())

                // Vị trí
                if (device.location.isNotEmpty()) {
                    tvLocation.text = "📍 ${device.location}"
                    tvLocation.visibility = View.VISIBLE
                } else {
                    tvLocation.visibility = View.GONE
                }

                // Icon thiết bị
                val iconRes = when {
                    device.deviceName.contains("tablet", ignoreCase = true) ||
                    device.deviceModel.contains("tab", ignoreCase = true) -> R.drawable.ic_device_tablet
                    else -> R.drawable.ic_device_phone
                }
                imgDeviceIcon.setImageResource(iconRes)

                // Nút đăng xuất
                btnLogout.setOnClickListener {
                    onLogoutClick(device)
                }
            }
        }

        private fun formatLastActive(date: Date?): String {
            if (date == null) return "Không xác định"

            val now = System.currentTimeMillis()
            val diffMs = now - date.time
            val diffMinutes = TimeUnit.MILLISECONDS.toMinutes(diffMs)
            val diffHours = TimeUnit.MILLISECONDS.toHours(diffMs)
            val diffDays = TimeUnit.MILLISECONDS.toDays(diffMs)

            return when {
                diffMinutes < 1 -> "Vừa xong"
                diffMinutes < 60 -> "Hoạt động $diffMinutes phút trước"
                diffHours < 24 -> "Hoạt động $diffHours giờ trước"
                diffDays < 7 -> "Hoạt động $diffDays ngày trước"
                else -> {
                    val sdf = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                    "Hoạt động lúc ${sdf.format(date)}"
                }
            }
        }
    }

    class DeviceDiffCallback : DiffUtil.ItemCallback<DeviceSession>() {
        override fun areItemsTheSame(oldItem: DeviceSession, newItem: DeviceSession): Boolean {
            return oldItem.sessionId == newItem.sessionId
        }

        override fun areContentsTheSame(oldItem: DeviceSession, newItem: DeviceSession): Boolean {
            return oldItem == newItem
        }
    }
}
