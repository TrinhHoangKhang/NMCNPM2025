package com.example.ridego.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.ridego.R
import com.example.ridego.databinding.ActivityProfileBinding
import com.example.ridego.databinding.ItemProfileOptionRowBinding
import com.example.ridego.ui.auth.LoginActivity
import com.example.ridego.utils.DeviceSessionManager
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
        binding.optInfo.root.setOnClickListener {
            val intent = Intent(this, PersonalInfoActivity::class.java)
            startActivity(intent)
        }
        // Lưu ý: Bạn cần tạo hoặc thay thế các icon R.drawable... tương ứng nếu chưa có
        setupOption(binding.optPayment, "Phương thức thanh toán", R.drawable.ic_payment_icon, "2")
        setupOption(binding.optWallet, "Ví RideGo", R.drawable.ic_wallet_icon, "250.000đ")
        setupOption(binding.optPromo, "Ưu đãi của tôi", R.drawable.ic_gift_icon_profile, "5")

        setupOption(binding.optSecurity, "Bảo mật & Quyền riêng tư", R.drawable.ic_shield_icon)
        binding.optSecurity.root.setOnClickListener {
            val intent = Intent(this, SecurityPrivacyActivity::class.java)
            startActivity(intent)
        }
        
        setupOption(binding.optHelp, "Trợ giúp & Hỗ trợ", R.drawable.ic_help_icon)
        binding.optHelp.root.setOnClickListener {
            val intent = Intent(this, SupportActivity::class.java)
            startActivity(intent)
        }

        setupOption(binding.optRate, "Đánh giá ứng dụng", R.drawable.ic_star_outline)
        setupOption(binding.optShare, "Giới thiệu bạn bè", R.drawable.ic_share_icon, "Nhận 50k")
        binding.optShare.root.setOnClickListener {
            startActivity(Intent(this, ReferralActivity::class.java))
        }

        binding.btnLogout.setOnClickListener {
            showLogoutDialog()
        }

        binding.btnChatbot.setOnClickListener {
            showChatbotBottomSheet()
        }
    }
    
    override fun onResume() {
        super.onResume()
        // Reload thông tin user khi quay lại (sau khi đổi ảnh đại diện)
        loadUserInfo()
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
                                
                                // Load ảnh đại diện từ Supabase nếu có
                                val avatarUrl = document.getString("avatarUrl")
                                if (!avatarUrl.isNullOrEmpty()) {
                                    binding.cardUserAvatar.visibility = View.VISIBLE
                                    binding.tvUserAvatar.visibility = View.GONE
                                    Glide.with(this@ProfileActivity)
                                        .load(avatarUrl)
                                        .circleCrop()
                                        .into(binding.imgUserAvatar)
                                } else {
                                    binding.cardUserAvatar.visibility = View.GONE
                                    binding.tvUserAvatar.visibility = View.VISIBLE
                                }
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
        // Xóa session của thiết bị hiện tại trước khi đăng xuất
        DeviceSessionManager.removeCurrentDevice(this) {
            auth.signOut()
            Toast.makeText(this, "Đã đăng xuất", Toast.LENGTH_SHORT).show()
            
            // Chuyển về màn hình login và xóa stack
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    private fun setupOption(itemBinding: ItemProfileOptionRowBinding, title: String, iconRes: Int, value: String = "") {
        // Dùng trực tiếp biến binding để gán dữ liệu, không cần findViewById nữa (Code gọn hơn nhiều)
        itemBinding.tvTitle.text = title
        itemBinding.imgIcon.setImageResource(iconRes)
        itemBinding.tvValue.text = value
    }

    // --- CHATBOT LOGIC ---
    private fun showChatbotBottomSheet() {
        val bottomSheetDialog = com.google.android.material.bottomsheet.BottomSheetDialog(this)
        val view = layoutInflater.inflate(R.layout.bottom_sheet_chatbot, null)
        bottomSheetDialog.setContentView(view)

        val rvChatHistory = view.findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvChatHistory)
        val etChatInput = view.findViewById<android.widget.EditText>(R.id.etChatInput)
        val btnSendChat = view.findViewById<android.widget.ImageButton>(R.id.btnSendChat)

        val messages = mutableListOf<com.example.ridego.data.model.ChatMessage>()
        val adapter = ChatAdapter(messages)
        rvChatHistory.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(this)
        rvChatHistory.adapter = adapter

        // Welcome message
        messages.add(com.example.ridego.data.model.ChatMessage("Xin chào! Tôi có thể giúp gì cho bạn?", false))
        adapter.notifyDataSetChanged()

        val rgChatMode = view.findViewById<android.widget.RadioGroup>(R.id.rgChatMode)
        val rbModeCommand = view.findViewById<android.widget.RadioButton>(R.id.rbModeCommand)
        val rbModeQuery = view.findViewById<android.widget.RadioButton>(R.id.rbModeQuery)

        btnSendChat.setOnClickListener {
            val userText = etChatInput.text.toString().trim()
            if (userText.isNotEmpty()) {
                // 1. Add User Message
                messages.add(com.example.ridego.data.model.ChatMessage(userText, true))
                adapter.notifyItemInserted(messages.size - 1)
                rvChatHistory.scrollToPosition(messages.size - 1)
                etChatInput.text.clear()

                val request = com.example.ridego.data.model.ChatRequest(userText)

                // --- UNIFIED MODE: LUÔN DÙNG chatCommand ---
                // Lý do: chatCommand thông minh hơn, handle được cả lệnh đặt xe VÀ câu hỏi thường.
                // chatQuery đang bị lỗi logic "tìm kiếm chuyến đi" khi hỏi câu thường.
                com.example.ridego.data.api.RetrofitClient.instance.chatCommand(request).enqueue(object : retrofit2.Callback<com.example.ridego.data.model.ChatCommandResponse> {
                    override fun onResponse(call: retrofit2.Call<com.example.ridego.data.model.ChatCommandResponse>, response: retrofit2.Response<com.example.ridego.data.model.ChatCommandResponse>) {
                        if (response.isSuccessful && response.body() != null) {
                            val body = response.body()!!
                            val botReply = body.message
                            
                            messages.add(com.example.ridego.data.model.ChatMessage(botReply, false))
                            adapter.notifyItemInserted(messages.size - 1)
                            rvChatHistory.scrollToPosition(messages.size - 1)

                            // Xử lý hành động (Action) nếu có
                            if (body.success && body.data != null) {
                                handleChatAction(body.data)
                            }
                        } else {
                            messages.add(com.example.ridego.data.model.ChatMessage("Lỗi server: ${response.code()}", false))
                            adapter.notifyItemInserted(messages.size - 1)
                        }
                    }

                    override fun onFailure(call: retrofit2.Call<com.example.ridego.data.model.ChatCommandResponse>, t: Throwable) {
                        messages.add(com.example.ridego.data.model.ChatMessage("Lỗi kết nối: ${t.message}", false))
                        adapter.notifyItemInserted(messages.size - 1)
                    }
                })
            }
        }

        bottomSheetDialog.show()
    }

    private fun handleChatAction(data: com.example.ridego.data.model.CommandData) {
        when (data.intent) {
            "BOOK_TRIP" -> {
                val destinationStep = data.steps.find { it.cmd == "SET_DESTINATION" }
                val vehicleStep = data.steps.find { it.cmd == "SET_VEHICLE" }

                val destName = destinationStep?.value ?: ""
                val destLat = destinationStep?.lat ?: 0.0
                val destLng = destinationStep?.lng ?: 0.0
                val vehicleType = vehicleStep?.value ?: "MOTORBIKE"

                // 1. Lấy vị trí hiện tại từ Firestore
                val user = auth.currentUser
                if (user != null) {
                    db.collection("uid_mapping").document(user.uid).get()
                        .addOnSuccessListener { mappingDoc ->
                            val customUserId = if (mappingDoc.exists()) mappingDoc.getString("customUserId") ?: user.uid else user.uid
                            
                            db.collection("users").document(customUserId).get()
                                .addOnSuccessListener { doc ->
                                    val pickupAddress = doc.getString("currentPickupAddress")
                                    val pickupLat = doc.getDouble("currentPickupLat") ?: 0.0
                                    val pickupLng = doc.getDouble("currentPickupLng") ?: 0.0

                                    if (!pickupAddress.isNullOrEmpty() && pickupLat != 0.0) {
                                        // 2. Đã có đủ thông tin -> Mở BookingActivity
                                        val intent = Intent(this, com.example.ridego.ui.booking.BookingActivity::class.java)
                                        intent.putExtra("PICKUP_ADDRESS", pickupAddress)
                                        intent.putExtra("PICKUP_LAT", pickupLat)
                                        intent.putExtra("PICKUP_LNG", pickupLng)
                                        
                                        intent.putExtra("DROPOFF_ADDRESS", destName)
                                        intent.putExtra("DROPOFF_LAT", destLat)
                                        intent.putExtra("DROPOFF_LNG", destLng)
                                        
                                        intent.putExtra("VEHICLE_TYPE", vehicleType)
                                        
                                        startActivity(intent)
                                    } else {
                                        Toast.makeText(this, "Bạn chưa có vị trí đón. Hãy ra trang chủ chọn vị trí trước!", Toast.LENGTH_LONG).show()
                                    }
                                }
                        }
                }
            }
            "ADD_FAVORITE_LOCATION" -> {
                val locationStep = data.steps.find { it.cmd == "SET_LOCATION" }
                val locName = locationStep?.value ?: ""
                Toast.makeText(this, "🤖 Đang lưu địa điểm: $locName", Toast.LENGTH_LONG).show()
                // TODO: Gọi API lưu địa điểm
            }
            "OPEN_TRIP_HISTORY" -> {
                // Mở màn hình lịch sử (HistoryActivity nếu có, hoặc Fragment)
                val intent = Intent(this, com.example.ridego.ui.history.HistoryActivity::class.java)
                startActivity(intent)
            }
            else -> {
                Toast.makeText(this, "🤖 Action: ${data.intent}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}