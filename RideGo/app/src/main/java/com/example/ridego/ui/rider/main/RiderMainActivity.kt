package com.example.ridego.ui.rider.main

import android.app.Activity
import android.app.Dialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityRiderMainBinding
import com.example.ridego.ui.history.HistoryActivity
import com.example.ridego.ui.rider.location.SetLocationActivity
import com.example.ridego.ui.promotion.PromotionActivity
import com.example.ridego.ui.profile.ProfileActivity

class RiderMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRiderMainBinding

    // --- BỘ LẮNG NGHE KẾT QUẢ TRẢ VỀ TỪ BẢN ĐỒ ---
    // Dùng khi người dùng chọn vị trí xong và quay lại Home (Luồng tìm kiếm)
    private val getContent = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val address = data?.getStringExtra("SELECTED_ADDRESS")
            // Cập nhật giao diện Home với địa chỉ mới
            Toast.makeText(this, "Đã chọn: $address", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRiderMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupManualBottomNav()
        showLocationPermissionDialog()
    }

    private fun setupManualBottomNav() {
        // Nút Trang chủ
        binding.btnHome.setOnClickListener {
            Toast.makeText(this, "Đang ở Trang chủ", Toast.LENGTH_SHORT).show()
        }

        // Nút Hoạt động
        binding.btnActivity.setOnClickListener {
            startActivity(Intent(this, HistoryActivity::class.java))
        }

        // Nút Ưu đãi
        binding.btnPromotion.setOnClickListener {
            startActivity(Intent(this, PromotionActivity::class.java))
        }

        // Nút Tài khoản
        binding.btnAccount.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        // --- LUỒNG 1: ĐẶT XE NGAY (Nút to ở giữa) ---
        // Gửi cờ hiệu TRUE -> Chọn xong sẽ sang BookingActivity
        binding.fabBooking.setOnClickListener {
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", true)
            startActivity(intent)
        }
    }

    private fun showLocationPermissionDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_location_permission)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        val params = dialog.window?.attributes
        params?.gravity = Gravity.CENTER
        dialog.setCancelable(false)

        val btnWhileUsing = dialog.findViewById<TextView>(R.id.btnAllowWhileUsing)
        val btnAllowOnce = dialog.findViewById<TextView>(R.id.btnAllowOnce)
        val btnDeny = dialog.findViewById<TextView>(R.id.btnDeny)

        btnWhileUsing.setOnClickListener {
            dialog.dismiss()
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

    private fun showPickupLocationDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_confirm_pickup)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.window?.setDimAmount(0.6f)
        dialog.setCancelable(false)

        val btnEnter = dialog.findViewById<TextView>(R.id.btnEnterLocation)
        val btnConfirm = dialog.findViewById<TextView>(R.id.btnConfirmLocation)

        // --- LUỒNG 2: TÌM KIẾM VỊ TRÍ (Nút "Nhập vị trí") ---
        // Gửi cờ hiệu FALSE -> Chọn xong sẽ quay về Home
        btnEnter.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", false)
            getContent.launch(intent) // Dùng launch để đợi kết quả
        }

        // Nút "Tiếp tục" trong Dialog -> Cũng coi như là luồng Đặt xe
        btnConfirm.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", true)
            startActivity(intent)
        }
        dialog.show()
    }
}