package com.example.ridego.ui.rider.main

import android.Manifest
import android.app.Activity
import android.app.Dialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.ridego.R
import com.example.ridego.databinding.ActivityRiderMainBinding
import com.example.ridego.ui.history.HistoryActivity
import com.example.ridego.ui.rider.location.SetLocationActivity
import com.example.ridego.ui.promotion.PromotionActivity
import com.example.ridego.ui.profile.ProfileActivity

class RiderMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRiderMainBinding

    // --- 1. BỘ XỬ LÝ KẾT QUẢ XIN QUYỀN (HỆ THỐNG ANDROID) ---
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val isGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true

        if (isGranted) {
            // Nếu người dùng đồng ý -> Hiện dialog hỏi điểm đón
            showPickupLocationDialog()
        } else {
            Toast.makeText(this, "Bạn cần cấp quyền vị trí để đặt xe!", Toast.LENGTH_LONG).show()
        }
    }

    // --- 2. BỘ LẮNG NGHE KẾT QUẢ TỪ BẢN ĐỒ (LUỒNG TÌM KIẾM) ---
    private val getContent = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val address = data?.getStringExtra("SELECTED_ADDRESS")
            Toast.makeText(this, "Đã chọn: $address", Toast.LENGTH_LONG).show()
            // Ở đây bạn có thể cập nhật TextView hiển thị vị trí trên Home nếu muốn
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRiderMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupManualBottomNav()

        // --- 3. KIỂM TRA QUYỀN NGAY KHI VÀO APP ---
        checkLocationPermission()
    }

    // --- HÀM KIỂM TRA & XIN QUYỀN THỰC TẾ ---
    private fun checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // Đã có quyền -> Hiện dialog điểm đón luôn
            showPickupLocationDialog()
        } else {
            // Chưa có -> Gọi hệ thống Android xin quyền
            requestPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun setupManualBottomNav() {
        binding.btnHome.setOnClickListener { Toast.makeText(this, "Đang ở Trang chủ", Toast.LENGTH_SHORT).show() }
        binding.btnActivity.setOnClickListener { startActivity(Intent(this, HistoryActivity::class.java)) }
        binding.btnPromotion.setOnClickListener { startActivity(Intent(this, PromotionActivity::class.java)) }
        binding.btnAccount.setOnClickListener { startActivity(Intent(this, ProfileActivity::class.java)) }

        // Nút Đặt xe (Fab)
        binding.fabBooking.setOnClickListener {
            // Kiểm tra quyền lại một lần nữa trước khi mở bản đồ
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                val intent = Intent(this, SetLocationActivity::class.java)
                intent.putExtra("IS_BOOKING_FLOW", true)
                startActivity(intent)
            } else {
                checkLocationPermission() // Xin lại nếu chưa có
            }
        }
    }

    // --- DIALOG XÁC NHẬN ĐIỂM ĐÓN (GIỮ NGUYÊN) ---
    private fun showPickupLocationDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_confirm_pickup)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.window?.setDimAmount(0.6f)
        dialog.setCancelable(true) // Cho phép tắt nếu user không muốn đặt ngay

        val btnEnter = dialog.findViewById<TextView>(R.id.btnEnterLocation)
        val btnConfirm = dialog.findViewById<TextView>(R.id.btnConfirmLocation)

        // Nút "Nhập vị trí" -> Luồng Tìm kiếm (Quay về)
        btnEnter.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", false)
            getContent.launch(intent)
        }

        // Nút "Tiếp tục" -> Luồng Đặt xe (Đi tiếp)
        btnConfirm.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", true)
            startActivity(intent)
        }

        dialog.show()
    }
}