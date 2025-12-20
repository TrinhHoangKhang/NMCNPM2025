package com.example.ridego.ui.rider.main

import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityRiderMainBinding

class RiderMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRiderMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRiderMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // ... Các code setup BottomNav cũ giữ nguyên ...

        // Kiểm tra và hiển thị luồng xin vị trí (Giả lập là lần đầu tiên)
        showLocationPermissionDialog()
    }

    // --- BƯỚC 1: DIALOG XIN QUYỀN VỊ TRÍ ---
    private fun showLocationPermissionDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_location_permission)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        // Hiển thị dialog ở giữa màn hình, có margin 2 bên
        val params = dialog.window?.attributes
        params?.gravity = Gravity.CENTER
        // params?.horizontalMargin = 0.1f // Nếu cần thụt lề thêm

        dialog.setCancelable(false) // Bắt buộc user phải chọn

        // Xử lý sự kiện nút bấm
        val btnWhileUsing = dialog.findViewById<TextView>(R.id.btnAllowWhileUsing)
        val btnAllowOnce = dialog.findViewById<TextView>(R.id.btnAllowOnce)
        val btnDeny = dialog.findViewById<TextView>(R.id.btnDeny)

        btnWhileUsing.setOnClickListener {
            dialog.dismiss()
            // TODO: Ở đây gọi lệnh xin quyền hệ thống thực tế (ActivityCompat.requestPermissions...)
            // Sau khi xin xong thì hiện tiếp Dialog 2
            showPickupLocationDialog()
        }

        btnAllowOnce.setOnClickListener {
            dialog.dismiss()
            showPickupLocationDialog()
        }

        btnDeny.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "Bạn cần cấp quyền để đặt xe!", Toast.LENGTH_SHORT).show()
        }

        dialog.show()
    }

    // --- BƯỚC 2: DIALOG XÁC NHẬN ĐIỂM ĐÓN ---
    private fun showPickupLocationDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_confirm_pickup)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        // Tạo hiệu ứng dim mờ phía sau
        dialog.window?.setDimAmount(0.6f)

        dialog.setCancelable(false)

        val btnEnter = dialog.findViewById<TextView>(R.id.btnEnterLocation)
        val btnConfirm = dialog.findViewById<TextView>(R.id.btnConfirmLocation)

        // Nút Nhập vị trí
        btnEnter.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "Mở màn hình tìm kiếm...", Toast.LENGTH_SHORT).show()
            // Code mở màn hình Search
        }

        // Nút Tiếp tục (Lấy GPS hiện tại)
        btnConfirm.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "Đang định vị bạn...", Toast.LENGTH_SHORT).show()
            // Code update vị trí lên bản đồ
        }

        dialog.show()
    }
}