package com.example.ridego.ui.profile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityProfileBinding
import com.example.ridego.databinding.ItemProfileOptionRowBinding // <-- QUAN TRỌNG: Import cái này

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        // Bây giờ gọi hàm thoải mái không còn báo lỗi đỏ nữa
        setupOption(binding.optInfo, "Thông tin cá nhân", R.drawable.ic_user_icon_profile)
        // Lưu ý: Bạn cần tạo hoặc thay thế các icon R.drawable... tương ứng nếu chưa có
        setupOption(binding.optPayment, "Phương thức thanh toán", R.drawable.ic_payment_icon, "2")
        setupOption(binding.optWallet, "Ví RideGo", R.drawable.ic_wallet_icon, "250.000đ")
        setupOption(binding.optPromo, "Ưu đãi của tôi", R.drawable.ic_gift_icon_profile, "5")

        setupOption(binding.optSecurity, "Bảo mật & Quyền riêng tư", R.drawable.ic_shield_icon)
        setupOption(binding.optHelp, "Trợ giúp & Hỗ trợ", R.drawable.ic_help_icon)

        setupOption(binding.optRate, "Đánh giá ứng dụng", R.drawable.ic_star_outline)
        setupOption(binding.optShare, "Giới thiệu bạn bè", R.drawable.ic_share_icon, "Nhận 50k")

        binding.btnLogout.setOnClickListener {
            // Logic đăng xuất
        }
    }

    // --- ĐÃ SỬA HÀM NÀY ---
    // Thay đổi tham số đầu tiên từ 'View' thành 'ItemProfileOptionRowBinding'
    private fun setupOption(itemBinding: ItemProfileOptionRowBinding, title: String, iconRes: Int, value: String = "") {
        // Dùng trực tiếp biến binding để gán dữ liệu, không cần findViewById nữa (Code gọn hơn nhiều)
        itemBinding.tvTitle.text = title
        itemBinding.imgIcon.setImageResource(iconRes)
        itemBinding.tvValue.text = value
    }
}