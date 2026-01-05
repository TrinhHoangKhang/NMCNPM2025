package com.example.ridego.ui.profile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.R
import com.example.ridego.databinding.ActivityProfileBinding
import com.example.ridego.databinding.ItemProfileOptionRowBinding
import com.example.ridego.ui.auth.LoginActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        // Load thông tin user từ Firebase
        loadUserInfo()

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
            showLogoutDialog()
        }
    }

    private fun loadUserInfo() {
        val user = auth.currentUser
        if (user != null) {
            val firebaseUid = user.uid
            
            // Lấy customUserId từ uid_mapping trước
            db.collection("uid_mapping").document(firebaseUid).get()
                .addOnSuccessListener { mappingDoc ->
                    val customUserId = if (mappingDoc.exists()) {
                        mappingDoc.getString("customUserId") ?: firebaseUid
                    } else {
                        firebaseUid // Fallback
                    }
                    
                    // Lấy thông tin từ Firestore với customUserId
                    db.collection("users").document(customUserId).get()
                        .addOnSuccessListener { document ->
                            if (document.exists()) {
                                val name = document.getString("name") ?: user.displayName ?: "User"
                                val phone = document.getString("phone") ?: user.phoneNumber ?: ""
                                
                                binding.tvUserName.text = name
                                binding.tvUserPhone.text = phone
                                
                                // Hiển thị chữ cái đầu làm avatar
                                binding.tvUserAvatar.text = name.first().uppercase()
                            } else {
                                // Fallback: Dùng displayName từ FirebaseAuth
                                val name = user.displayName ?: "User"
                                val phone = user.phoneNumber ?: ""
                                
                                binding.tvUserName.text = name
                                binding.tvUserPhone.text = phone
                                binding.tvUserAvatar.text = name.first().uppercase()
                            }
                        }
                        .addOnFailureListener {
                            // Nếu lỗi, dùng displayName từ FirebaseAuth
                            val name = user.displayName ?: "User"
                            val phone = user.phoneNumber ?: ""
                            
                            binding.tvUserName.text = name
                            binding.tvUserPhone.text = phone
                            binding.tvUserAvatar.text = name.first().uppercase()
                        }
                }
                .addOnFailureListener {
                    // Fallback nếu không tìm được mapping
                    val name = user.displayName ?: "User"
                    val phone = user.phoneNumber ?: ""
                    
                    binding.tvUserName.text = name
                    binding.tvUserPhone.text = phone
                    binding.tvUserAvatar.text = name.first().uppercase()
                }
        }
    }

    private fun showLogoutDialog() {
        AlertDialog.Builder(this)
            .setTitle("Đăng xuất")
            .setMessage("Bạn có chắc muốn đăng xuất?")
            .setPositiveButton("Đăng xuất") { _, _ ->
                logout()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun logout() {
        auth.signOut()
        Toast.makeText(this, "Đã đăng xuất", Toast.LENGTH_SHORT).show()
        
        // Chuyển về màn hình login và xóa stack
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
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