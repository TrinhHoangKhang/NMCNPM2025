package com.example.ridego.ui.profile

import android.app.Activity
import android.app.AlertDialog
import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.example.ridego.R
import com.example.ridego.databinding.ActivityPersonalInfoBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.Calendar

class PersonalInfoActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPersonalInfoBinding
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private var isEditing = false
    private var is2FAEnabled = false
    
    // Supabase config - thay bằng thông tin project của bạn
    companion object {
        private const val SUPABASE_URL = "https://idgzqsqkdxvbopelvlon.supabase.co"
        private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZ3pxc3FrZHh2Ym9wZWx2bG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQzODQsImV4cCI6MjA4MzgwMDM4NH0.QJ5zUJNzs5bLe9aFwpnUemdVaSWSWeQP1cq69hbJ9g0"
        private const val BUCKET_NAME = "RiderAvartar"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPersonalInfoBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.btnBack.setOnClickListener { finish() }
        
        loadUserInfo()
        binding.btnEditInfo.setOnClickListener { toggleEditMode() }
        
        // Nút camera chuyên nghiệp để chọn ảnh
        binding.btnCamera.setOnClickListener {
            if (isEditing) {
                pickImageFromGallery()
            } else {
                Toast.makeText(this, "Vui lòng bấm \"Chỉnh sửa thông tin\" trước", Toast.LENGTH_SHORT).show()
            }
        }
        
        // DatePicker cho ngày sinh với format dd-MM-yyyy
        binding.edtBirthday.setOnClickListener {
            if (isEditing) {
                showDatePicker()
            }
        }
        
        // Dialog chọn giới tính
        binding.edtGender.setOnClickListener {
            if (isEditing) {
                showGenderPicker()
            }
        }
    }

    private val PICK_IMAGE_REQUEST = 1001
    private var avatarUri: Uri? = null

    private fun pickImageFromGallery() {
        val intent = Intent(Intent.ACTION_PICK)
        intent.type = "image/*"
        startActivityForResult(intent, PICK_IMAGE_REQUEST)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == Activity.RESULT_OK) {
            avatarUri = data?.data
            // Hiển thị preview ảnh đã chọn
            if (avatarUri != null) {
                binding.imgAvatar.visibility = View.VISIBLE
                binding.tvAvatarLetter.visibility = View.GONE
                Glide.with(this)
                    .load(avatarUri)
                    .circleCrop()
                    .into(binding.imgAvatar)
            }
        }
    }

    private fun loadUserInfo() {
        val user = auth.currentUser
        if (user != null) {
            val firebaseUid = user.uid
            db.collection("uid_mapping").document(firebaseUid).get()
                .addOnSuccessListener { mappingDoc ->
                    val customUserId = if (mappingDoc.exists()) {
                        mappingDoc.getString("customUserId") ?: firebaseUid
                    } else {
                        firebaseUid
                    }
                    db.collection("users").document(customUserId).get()
                        .addOnSuccessListener { document ->
                            val name = document.getString("name") ?: user.displayName ?: "User"
                            val phone = document.getString("phone") ?: user.phoneNumber ?: ""
                            val email = document.getString("email") ?: user.email ?: ""
                            val birthday = document.getString("birthday") ?: ""
                            val gender = document.getString("gender") ?: ""
                            is2FAEnabled = document.getBoolean("twoFactorEnabled") ?: false

                            binding.edtName.setText(name)
                            binding.edtPhone.setText(phone)
                            binding.edtEmail.setText(email)
                            binding.edtBirthday.setText(birthday)
                            binding.edtGender.setText(gender)
                            binding.edtPhone.isEnabled = false
                            
                            // Hiển thị chữ cái đầu làm avatar
                            binding.tvAvatarLetter.text = name.first().uppercase()
                            
                            // Load ảnh đại diện từ Firebase nếu có
                            val avatarUrl = document.getString("avatarUrl")
                            if (!avatarUrl.isNullOrEmpty()) {
                                binding.imgAvatar.visibility = View.VISIBLE
                                binding.tvAvatarLetter.visibility = View.GONE
                                Glide.with(this@PersonalInfoActivity)
                                    .load(avatarUrl)
                                    .circleCrop()
                                    .into(binding.imgAvatar)
                            } else {
                                binding.imgAvatar.visibility = View.GONE
                                binding.tvAvatarLetter.visibility = View.VISIBLE
                            }
                        }
                }
        }
    }

    private fun toggleEditMode() {
        isEditing = !isEditing
        binding.edtName.isEnabled = isEditing
        binding.edtEmail.isEnabled = isEditing
        binding.edtBirthday.isEnabled = isEditing
        binding.edtGender.isEnabled = isEditing
        // binding.imgAvatar: cho phép chọn ảnh mới khi isEditing
        binding.btnEditInfo.text = if (isEditing) "Lưu thông tin" else "Chỉnh sửa thông tin"
        if (!isEditing) {
            // Nếu 2FA bật, yêu cầu nhập mật khẩu trước khi lưu
            if (is2FAEnabled) {
                showPasswordVerificationDialog()
            } else {
                saveUserInfo()
            }
        }
    }

    private fun showDatePicker() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_date_picker, null)
        val dayPicker = dialogView.findViewById<android.widget.NumberPicker>(R.id.dayPicker)
        val monthPicker = dialogView.findViewById<android.widget.NumberPicker>(R.id.monthPicker)
        val yearPicker = dialogView.findViewById<android.widget.NumberPicker>(R.id.yearPicker)
        
        val calendar = Calendar.getInstance()
        // Parse ngày hiện tại nếu có (format: dd-MM-yyyy)
        val currentDate = binding.edtBirthday.text.toString()
        if (currentDate.isNotEmpty() && currentDate.contains("-")) {
            try {
                val parts = currentDate.split("-")
                if (parts.size == 3) {
                    calendar.set(parts[2].toInt(), parts[1].toInt() - 1, parts[0].toInt())
                }
            } catch (e: Exception) {
                // Nếu parse lỗi, giữ nguyên calendar hiện tại
            }
        }
        
        // Setup NumberPickers
        dayPicker.minValue = 1
        dayPicker.maxValue = 31
        dayPicker.value = calendar.get(Calendar.DAY_OF_MONTH)
        dayPicker.wrapSelectorWheel = true
        setNumberPickerTextColor(dayPicker)
        
        monthPicker.minValue = 1
        monthPicker.maxValue = 12
        monthPicker.value = calendar.get(Calendar.MONTH) + 1
        monthPicker.wrapSelectorWheel = true
        setNumberPickerTextColor(monthPicker)
        
        yearPicker.minValue = 1920
        yearPicker.maxValue = Calendar.getInstance().get(Calendar.YEAR)
        yearPicker.value = calendar.get(Calendar.YEAR)
        yearPicker.wrapSelectorWheel = false
        setNumberPickerTextColor(yearPicker)
        
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()
        
        dialogView.findViewById<android.widget.Button>(R.id.btnCancel).setOnClickListener {
            dialog.dismiss()
        }
        
        dialogView.findViewById<android.widget.Button>(R.id.btnConfirm).setOnClickListener {
            // Format: dd-MM-yyyy (vd: 28-02-2005)
            val formattedDate = String.format(
                "%02d-%02d-%04d",
                dayPicker.value,
                monthPicker.value,
                yearPicker.value
            )
            binding.edtBirthday.setText(formattedDate)
            dialog.dismiss()
        }
        
        dialog.show()
    }

    private fun showGenderPicker() {
        val genders = arrayOf("Nam", "Nữ", "Khác")
        val currentGender = binding.edtGender.text.toString()
        val selectedIndex = genders.indexOf(currentGender).takeIf { it >= 0 } ?: -1

        AlertDialog.Builder(this)
            .setTitle("Chọn giới tính")
            .setSingleChoiceItems(genders, selectedIndex) { dialog, which ->
                binding.edtGender.setText(genders[which])
                dialog.dismiss()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
    
    private fun showPasswordVerificationDialog() {
        val dialogView = layoutInflater.inflate(android.R.layout.simple_list_item_1, null)
        val editText = android.widget.EditText(this).apply {
            hint = "Nhập mật khẩu hiện tại"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            setPadding(50, 40, 50, 40)
        }
        
        AlertDialog.Builder(this)
            .setTitle("🔒 Xác thực 2 yếu tố")
            .setMessage("Vui lòng nhập mật khẩu để xác nhận thay đổi thông tin")
            .setView(editText)
            .setPositiveButton("Xác nhận") { _, _ ->
                val password = editText.text.toString()
                if (password.isEmpty()) {
                    Toast.makeText(this, "Vui lòng nhập mật khẩu", Toast.LENGTH_SHORT).show()
                    isEditing = true
                    binding.btnEditInfo.text = "Lưu thông tin"
                    return@setPositiveButton
                }
                verifyPasswordAndSave(password)
            }
            .setNegativeButton("Hủy") { _, _ ->
                isEditing = true
                binding.btnEditInfo.text = "Lưu thông tin"
            }
            .setCancelable(false)
            .show()
    }
    
    private fun verifyPasswordAndSave(password: String) {
        val user = auth.currentUser ?: return
        val email = user.email ?: ""
        
        // Xác thực lại người dùng với mật khẩu
        val credential = com.google.firebase.auth.EmailAuthProvider.getCredential(email, password)
        user.reauthenticate(credential)
            .addOnSuccessListener {
                Toast.makeText(this, "Xác thực thành công!", Toast.LENGTH_SHORT).show()
                saveUserInfo()
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "Mật khẩu không chính xác!", Toast.LENGTH_SHORT).show()
                isEditing = true
                binding.btnEditInfo.text = "Lưu thông tin"
            }
    }
    
    private fun setNumberPickerTextColor(numberPicker: android.widget.NumberPicker) {
        try {
            // Đặt màu cho divider
            val dividerField = android.widget.NumberPicker::class.java.getDeclaredField("mSelectionDivider")
            dividerField.isAccessible = true
            val colorDrawable = android.graphics.drawable.ColorDrawable(android.graphics.Color.parseColor("#9C27B0"))
            dividerField.set(numberPicker, colorDrawable)
            
            // Đặt màu text cho các EditText bên trong
            val count = numberPicker.childCount
            for (i in 0 until count) {
                val child = numberPicker.getChildAt(i)
                if (child is android.widget.EditText) {
                    child.setTextColor(android.graphics.Color.parseColor("#212121"))
                    child.textSize = 20f
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun saveUserInfo() {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid
        val name = binding.edtName.text.toString().trim()
        val email = binding.edtEmail.text.toString().trim()
        val birthday = binding.edtBirthday.text.toString().trim()
        val gender = binding.edtGender.text.toString().trim()

        // Validate dữ liệu
        if (name.isEmpty()) {
            Toast.makeText(this, "Vui lòng nhập họ và tên", Toast.LENGTH_SHORT).show()
            return
        }
        if (email.isNotEmpty() && !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(this, "Email không hợp lệ", Toast.LENGTH_SHORT).show()
            return
        }
        // Ngày sinh và giới tính có thể kiểm tra thêm nếu muốn

        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                val updates = hashMapOf<String, Any>(
                    "name" to name,
                    "email" to email,
                    "birthday" to birthday,
                    "gender" to gender
                )
                // Nếu có chọn ảnh mới, upload lên Supabase Storage
                if (avatarUri != null) {
                    Toast.makeText(this, "Đang upload ảnh...", Toast.LENGTH_SHORT).show()
                    uploadToSupabase(customUserId, updates)
                } else {
                    db.collection("users").document(customUserId).update(updates)
                        .addOnSuccessListener {
                            Toast.makeText(this, "Cập nhật thành công!", Toast.LENGTH_SHORT).show()
                        }
                        .addOnFailureListener { e ->
                            Toast.makeText(this, "Lỗi lưu dữ liệu: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                }
            }
    }
    
    private fun uploadToSupabase(customUserId: String, updates: HashMap<String, Any>) {
        lifecycleScope.launch {
            try {
                val inputStream = contentResolver.openInputStream(avatarUri!!)
                val bytes = inputStream?.readBytes()
                inputStream?.close()
                
                if (bytes == null) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@PersonalInfoActivity, "Không thể đọc file ảnh", Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }
                
                val fileName = "$customUserId.jpg"
                
                // Upload qua Supabase REST API - dùng upsert endpoint
                val uploadUrl = "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/$fileName"
                
                withContext(Dispatchers.IO) {
                    try {
                        val url = URL(uploadUrl)
                        val connection = url.openConnection() as HttpURLConnection
                        connection.requestMethod = "PUT"  // Dùng PUT thay vì POST để upsert
                        connection.setRequestProperty("Authorization", "Bearer $SUPABASE_ANON_KEY")
                        connection.setRequestProperty("apikey", SUPABASE_ANON_KEY)
                        connection.setRequestProperty("Content-Type", "image/jpeg")
                        connection.setRequestProperty("Cache-Control", "max-age=3600")
                        connection.doOutput = true
                        connection.connectTimeout = 30000
                        connection.readTimeout = 30000
                        
                        connection.outputStream.use { outputStream ->
                            outputStream.write(bytes)
                            outputStream.flush()
                        }
                        
                        val responseCode = connection.responseCode
                        val responseMessage = connection.responseMessage
                        
                        android.util.Log.d("PersonalInfo", "Response: $responseCode - $responseMessage")
                        
                        if (responseCode in 200..299) {
                            // Tạo public URL
                            val publicUrl = "$SUPABASE_URL/storage/v1/object/public/$BUCKET_NAME/$fileName"
                            
                            withContext(Dispatchers.Main) {
                                updates["avatarUrl"] = publicUrl
                                db.collection("users").document(customUserId).update(updates)
                                    .addOnSuccessListener {
                                        Toast.makeText(this@PersonalInfoActivity, "Cập nhật thành công!", Toast.LENGTH_SHORT).show()
                                        avatarUri = null
                                    }
                                    .addOnFailureListener { e ->
                                        Toast.makeText(this@PersonalInfoActivity, "Lỗi lưu dữ liệu: ${e.message}", Toast.LENGTH_SHORT).show()
                                    }
                            }
                        } else {
                            val errorStream = connection.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
                            android.util.Log.e("PersonalInfo", "Upload failed: $responseCode - $errorStream")
                            withContext(Dispatchers.Main) {
                                Toast.makeText(this@PersonalInfoActivity, "Lỗi upload: $errorStream", Toast.LENGTH_LONG).show()
                            }
                        }
                        connection.disconnect()
                    } catch (e: Exception) {
                        android.util.Log.e("PersonalInfo", "Connection error", e)
                        withContext(Dispatchers.Main) {
                            Toast.makeText(this@PersonalInfoActivity, "Lỗi kết nối: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("PersonalInfo", "Upload error", e)
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@PersonalInfoActivity, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
