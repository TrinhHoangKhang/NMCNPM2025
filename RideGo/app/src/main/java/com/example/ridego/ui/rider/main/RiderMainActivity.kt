package com.example.ridego.ui.rider.main

import android.Manifest
import android.app.Activity
import android.app.Dialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
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

    // --- 1. BỘ XỬ LÝ KẾT QUẢ XIN QUYỀN ---
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val isGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true

        if (isGranted) {
            showPickupLocationDialog()
        } else {
            Toast.makeText(this, "Bạn cần cấp quyền vị trí để đặt xe!", Toast.LENGTH_LONG).show()
        }
    }

    // --- 2. NHẬN KẾT QUẢ TỪ BẢN ĐỒ ---
    private val getContent = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val address = data?.getStringExtra("SELECTED_ADDRESS")
            // Cập nhật giao diện Home nếu cần
            Toast.makeText(this, "Vị trí hiện tại: $address", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRiderMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupManualBottomNav()
        checkLocationPermission()
    }

    private fun checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // Quyền đã được cấp, không cần làm gì thêm ở đây hoặc có thể load dữ liệu
        } else {
            requestPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }
    }

    private fun setupManualBottomNav() {
        binding.btnHome.setOnClickListener { }
        binding.btnActivity.setOnClickListener { startActivity(Intent(this, HistoryActivity::class.java)) }
        binding.btnPromotion.setOnClickListener { startActivity(Intent(this, PromotionActivity::class.java)) }
        binding.btnAccount.setOnClickListener { startActivity(Intent(this, ProfileActivity::class.java)) }

        // Nút Đặt xe (FAB) - Luồng Booking: IS_BOOKING_FLOW = true
        binding.fabBooking.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                val intent = Intent(this, SetLocationActivity::class.java)
                intent.putExtra("IS_BOOKING_FLOW", true) 
                intent.putExtra("LOCATION_TYPE", 1) // 1: Pickup (Điểm đón)
                startActivity(intent)
            } else {
                checkLocationPermission()
            }
        }
    }

    private fun showPickupLocationDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_confirm_pickup)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.setCancelable(false)

        val btnSkip = dialog.findViewById<TextView>(R.id.btnEnterLocation) // Nút trái
        val btnContinue = dialog.findViewById<TextView>(R.id.btnConfirmLocation) // Nút phải

        // Nút Bỏ qua -> Đóng dialog, ở lại Home
        btnSkip.setOnClickListener {
            dialog.dismiss()
        }

        // Nút Tiếp tục -> Mở bản đồ để set vị trí (IS_BOOKING_FLOW = false)
        btnContinue.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", false)
            intent.putExtra("LOCATION_TYPE", 1) // Mặc định là điểm đón
            getContent.launch(intent)
        }

        dialog.show()
    }
}