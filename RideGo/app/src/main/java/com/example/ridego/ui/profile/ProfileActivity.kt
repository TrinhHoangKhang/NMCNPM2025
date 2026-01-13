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

    private lateinit var fusedLocationClient: com.google.android.gms.location.FusedLocationProviderClient

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
        binding.optRate.root.setOnClickListener {
            val intent = Intent(this, com.example.ridego.ui.rating.AppRatingActivity::class.java)
            startActivity(intent)
        }
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

        fusedLocationClient = com.google.android.gms.location.LocationServices.getFusedLocationProviderClient(this)
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
        val rgChatMode = view.findViewById<android.widget.RadioGroup>(R.id.rgChatMode)
        val rbModeCommand = view.findViewById<android.widget.RadioButton>(R.id.rbModeCommand)
        val rbModeQuery = view.findViewById<android.widget.RadioButton>(R.id.rbModeQuery)

        val messages = mutableListOf<com.example.ridego.data.model.ChatMessage>()
        val adapter = ChatAdapter(messages)
        rvChatHistory.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(this)
        rvChatHistory.adapter = adapter

        // Welcome message
        messages.add(com.example.ridego.data.model.ChatMessage("Xin chào! Tôi có thể giúp gì cho bạn?", false))
        adapter.notifyDataSetChanged()

        btnSendChat.setOnClickListener {
            val userText = etChatInput.text.toString().trim()
            if (userText.isNotEmpty()) {
                // 1. Hiển thị tin nhắn của người dùng lên UI
                messages.add(com.example.ridego.data.model.ChatMessage(userText, true))
                adapter.notifyItemInserted(messages.size - 1)
                rvChatHistory.scrollToPosition(messages.size - 1)
                etChatInput.text.clear()

                // 2. Hiển thị typing indicator (Đang trả lời...)
                val typingMessage = com.example.ridego.data.model.ChatMessage("Đang trả lời...", false)
                messages.add(typingMessage)
                val typingIndex = messages.size - 1
                adapter.notifyItemInserted(typingIndex)
                rvChatHistory.scrollToPosition(typingIndex)

                // 3. Lấy vị trí GPS hiện tại để gửi kèm request (Giúp AI bớt "đần")
                if (androidx.core.app.ActivityCompat.checkSelfPermission(
                        this, android.Manifest.permission.ACCESS_FINE_LOCATION
                    ) == android.content.pm.PackageManager.PERMISSION_GRANTED
                ) {
                    fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                        // Tạo userLocation object nếu lấy được GPS
                        val userLocMap = if (location != null) {
                            mapOf("lat" to location.latitude, "lng" to location.longitude)
                        } else null

                        // Tạo request chuẩn có kèm tọa độ
                        val request = com.example.ridego.data.model.ChatRequest(
                            text = userText,
                            userLocation = userLocMap
                        )

                        // 4. Gửi Request lên Server
                        if (rbModeCommand.isChecked) {
                            // CHẾ ĐỘ LỆNH (GỌI GEMINI)
                            com.example.ridego.data.api.RetrofitClient.instance.chatCommand(request)
                                .enqueue(object : retrofit2.Callback<com.example.ridego.data.model.ChatCommandResponse> {
                                    override fun onResponse(
                                        call: retrofit2.Call<com.example.ridego.data.model.ChatCommandResponse>,
                                        response: retrofit2.Response<com.example.ridego.data.model.ChatCommandResponse>
                                    ) {
                                        messages.removeAt(typingIndex)
                                        adapter.notifyItemRemoved(typingIndex)
                                        handleChatCommandResponse(response, messages, adapter, rvChatHistory)
                                    }

                                    override fun onFailure(call: retrofit2.Call<com.example.ridego.data.model.ChatCommandResponse>, t: Throwable) {
                                        messages.removeAt(typingIndex)
                                        adapter.notifyItemRemoved(typingIndex)
                                        messages.add(com.example.ridego.data.model.ChatMessage("Lỗi kết nối: ${t.message}", false))
                                        adapter.notifyItemInserted(messages.size - 1)
                                    }
                                })
                        } else {
                            // CHẾ ĐỘ TRA CỨU
                            com.example.ridego.data.api.RetrofitClient.instance.chatQuery(request)
                                .enqueue(object : retrofit2.Callback<com.example.ridego.data.model.ChatResponse> {
                                    override fun onResponse(
                                        call: retrofit2.Call<com.example.ridego.data.model.ChatResponse>,
                                        response: retrofit2.Response<com.example.ridego.data.model.ChatResponse>
                                    ) {
                                        messages.removeAt(typingIndex)
                                        adapter.notifyItemRemoved(typingIndex)
                                        if (response.isSuccessful && response.body() != null) {
                                            val botReply = response.body()!!.message
                                            messages.add(com.example.ridego.data.model.ChatMessage(botReply, false))
                                            adapter.notifyItemInserted(messages.size - 1)
                                            rvChatHistory.scrollToPosition(messages.size - 1)
                                        }
                                    }

                                    override fun onFailure(call: retrofit2.Call<com.example.ridego.data.model.ChatResponse>, t: Throwable) {
                                        messages.removeAt(typingIndex)
                                        adapter.notifyItemRemoved(typingIndex)
                                        messages.add(com.example.ridego.data.model.ChatMessage("Lỗi kết nối: ${t.message}", false))
                                        adapter.notifyItemInserted(messages.size - 1)
                                    }
                                })
                        }
                    }
                } else {
                    // Trường hợp chưa cấp quyền GPS (vẫn gửi request nhưng userLocation = null)
                    val request = com.example.ridego.data.model.ChatRequest(userText, null)
                    // ... (Copy lại logic gọi API tương tự như trên nếu cần) ...
                    Toast.makeText(this, "Vui lòng cấp quyền vị trí để AI tìm kiếm chính xác hơn", Toast.LENGTH_SHORT).show()
                }
            }
        }

        bottomSheetDialog.show()
    }

    // Hàm xử lý phản hồi chung cho Chatbot
    private fun handleChatCommandResponse(
        response: retrofit2.Response<com.example.ridego.data.model.ChatCommandResponse>,
        messages: MutableList<com.example.ridego.data.model.ChatMessage>,
        adapter: ChatAdapter,
        rvChatHistory: androidx.recyclerview.widget.RecyclerView
    ) {
        try {
            // Log response để debug
            android.util.Log.d("ChatBot", "Response code: ${response.code()}")
            android.util.Log.d("ChatBot", "Response body: ${response.body()}")
            android.util.Log.d("ChatBot", "Response success: ${response.isSuccessful}")
            
            if (response.isSuccessful && response.body() != null) {
                val cmdResp = response.body()!!
                val botReply = cmdResp.message ?: "Không có câu trả lời."
                
                android.util.Log.d("ChatBot", "Bot reply: $botReply")
                android.util.Log.d("ChatBot", "Intent: ${cmdResp.data?.intent}")
                
                messages.add(com.example.ridego.data.model.ChatMessage(botReply, false))
                adapter.notifyItemInserted(messages.size - 1)
                rvChatHistory.scrollToPosition(messages.size - 1)

                // Xử lý lệnh điều hướng
                if (cmdResp.data?.intent == "BOOK_TRIP") {
                    val destination = cmdResp.data.steps?.find { it.cmd == "SET_DESTINATION" }?.value ?: ""
                    val lat = cmdResp.data.steps?.find { it.cmd == "SET_DESTINATION" }?.lat ?: 0.0
                    val lng = cmdResp.data.steps?.find { it.cmd == "SET_DESTINATION" }?.lng ?: 0.0
                    
                    android.util.Log.d("ChatBot", "Booking: $destination at ($lat, $lng)")
                    
                    // Chuyển sang màn hình SetLocationActivity (Bước 1 của đặt xe)
                    // Delay một chút để người dùng kịp đọc tin nhắn phản hồi của Bot
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        val intent = Intent(this@ProfileActivity, com.example.ridego.ui.rider.location.SetLocationActivity::class.java)
                        intent.putExtra("IS_BOOKING_FLOW", true) // Quan trọng: Bật chế độ đặt xe
                        intent.putExtra("DESTINATION_NAME", destination) // Gửi kèm để nếu cần dùng sau
                        intent.putExtra("DESTINATION_LAT", lat)
                        intent.putExtra("DESTINATION_LNG", lng)
                        startActivity(intent)
                    }, 1500) // Delay 1.5s
                }
            } else {
                val errorMsg = "Lỗi server: ${response.code()} - ${response.message()}"
                android.util.Log.e("ChatBot", errorMsg)
                messages.add(com.example.ridego.data.model.ChatMessage(errorMsg, false))
                adapter.notifyItemInserted(messages.size - 1)
            }
        } catch (e: Exception) {
            val errorMsg = "Lỗi xử lý: ${e.message}"
            android.util.Log.e("ChatBot", errorMsg, e)
            messages.add(com.example.ridego.data.model.ChatMessage(errorMsg, false))
            adapter.notifyItemInserted(messages.size - 1)
        }
    }
}