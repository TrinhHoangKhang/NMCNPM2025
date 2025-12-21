package com.example.ridego.ui.rider.main

import android.app.Dialog
import android.content.Intent
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
import com.example.ridego.ui.history.HistoryActivity
import com.example.ridego.ui.rider.location.SetLocationActivity
import com.example.ridego.ui.promotion.PromotionActivity


class RiderMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRiderMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRiderMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 1. Cấu hình thanh điều hướng thủ công (Manual Bottom Nav)
        setupManualBottomNav()

        // 2. Chạy luồng xin quyền vị trí ngay khi vào App
        showLocationPermissionDialog()
    }

    // --- XỬ LÝ SỰ KIỆN CLICK CHO THANH ĐIỀU HƯỚNG MỚI ---
    private fun setupManualBottomNav() {
        // Nút Trang chủ (btnHome)
        binding.btnHome.setOnClickListener {
            // Đang ở Home rồi thì có thể reload hoặc không làm gì
            Toast.makeText(this, "Đang ở Trang chủ", Toast.LENGTH_SHORT).show()
        }

        // Nút Hoạt động (btnActivity) -> MỞ MÀN HÌNH LỊCH SỬ
        binding.btnActivity.setOnClickListener {
            val intent = Intent(this, HistoryActivity::class.java)
            startActivity(intent)
        }

        // Nút Ưu đãi (btnPromotion)
        binding.btnPromotion.setOnClickListener {
            val intent = Intent(this, PromotionActivity::class.java) // Đảm bảo đã import PromotionActivity
            startActivity(intent)
        }

        // Nút Tài khoản (btnAccount)
        binding.btnAccount.setOnClickListener {
            Toast.makeText(this, "Tính năng Tài khoản đang phát triển", Toast.LENGTH_SHORT).show()
        }

        // Nút Đặt xe to ở giữa (fabBooking)
        binding.fabBooking.setOnClickListener {
            Toast.makeText(this, "Bạn hãy chọn điểm đến trên bản đồ", Toast.LENGTH_SHORT).show()
            // Có thể mở nhanh màn hình đặt xe tại đây nếu muốn
        }
    }

    // --- BƯỚC 1: DIALOG XIN QUYỀN VỊ TRÍ ---
    private fun showLocationPermissionDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_location_permission)

        // Làm trong suốt nền dialog để thấy bo góc
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val params = dialog.window?.attributes
        params?.gravity = Gravity.CENTER

        dialog.setCancelable(false) // Bắt buộc user phải chọn

        // Ánh xạ các nút trong Dialog
        val btnWhileUsing = dialog.findViewById<TextView>(R.id.btnAllowWhileUsing)
        val btnAllowOnce = dialog.findViewById<TextView>(R.id.btnAllowOnce)
        val btnDeny = dialog.findViewById<TextView>(R.id.btnDeny)

        // Xử lý sự kiện
        btnWhileUsing.setOnClickListener {
            dialog.dismiss()
            // Sau khi đồng ý -> Hiện tiếp Dialog chọn điểm đón
            showPickupLocationDialog()
        }

        btnAllowOnce.setOnClickListener {
            dialog.dismiss()
            showPickupLocationDialog()
        }

        btnDeny.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "Bạn cần cấp quyền để sử dụng RideGo!", Toast.LENGTH_SHORT).show()
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
        dialog.window?.setDimAmount(0.6f) // Làm tối màn hình phía sau
        dialog.setCancelable(false)

        val btnEnter = dialog.findViewById<TextView>(R.id.btnEnterLocation)
        val btnConfirm = dialog.findViewById<TextView>(R.id.btnConfirmLocation)

        // Nút "Nhập vị trí"
        btnEnter.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "Mở màn hình tìm kiếm...", Toast.LENGTH_SHORT).show()
        }

        // Nút "Tiếp tục" -> MỞ MÀN HÌNH BẢN ĐỒ (SetLocationActivity)
        btnConfirm.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, SetLocationActivity::class.java)
            startActivity(intent)
        }

        dialog.show()
    }
}