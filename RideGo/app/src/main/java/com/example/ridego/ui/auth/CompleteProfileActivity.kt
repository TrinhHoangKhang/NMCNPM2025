package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AlertDialog
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityCompleteProfileBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore

class CompleteProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCompleteProfileBinding
    private val viewModel: AuthViewModel by viewModels { AuthViewModelFactory(AuthRepository()) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCompleteProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnContinue.setOnClickListener {
            val name = binding.edtName.text.toString().trim()
            if (name.isEmpty()) {
                binding.tilName.error = "Vui lòng nhập tên"
                return@setOnClickListener
            }
            binding.btnContinue.isEnabled = false
            saveNameToFirebase(name)
        }
    }

    private fun saveNameToFirebase(name: String) {
        val user = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
            ?: run {
                Toast.makeText(this, "Không tìm thấy user", Toast.LENGTH_SHORT).show()
                binding.btnContinue.isEnabled = true
                return
            }

        val profileUpdates = UserProfileChangeRequest.Builder()
            .setDisplayName(name)
            .build()

        user.updateProfile(profileUpdates)
            .addOnSuccessListener {
                val db = FirebaseFirestore.getInstance()
                val firebaseUid = user.uid
                
                // Lấy customUserId từ uid_mapping trước
                db.collection("uid_mapping").document(firebaseUid)
                    .get()
                    .addOnSuccessListener { mappingDoc ->
                        val customUserId = if (mappingDoc.exists()) {
                            mappingDoc.getString("customUserId") ?: firebaseUid
                        } else {
                            firebaseUid // Fallback nếu chưa có mapping
                        }
                        
                        // Update name vào document đúng
                        db.collection("users").document(customUserId)
                            .update("name", name)
                            .addOnSuccessListener {
                                Toast.makeText(this, "Hoàn tất hồ sơ!", Toast.LENGTH_SHORT).show()
                                // Chuyển thẳng đến màn hình thêm email
                                val intent = Intent(this, AddEmailActivity::class.java)
                                startActivity(intent)
                                finish()
                            }
                            .addOnFailureListener { e ->
                                Toast.makeText(this, "Lỗi lưu tên vào dữ liệu: ${e.message}", Toast.LENGTH_SHORT).show()
                                binding.btnContinue.isEnabled = true
                            }
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(this, "Lỗi tìm user: ${e.message}", Toast.LENGTH_SHORT).show()
                        binding.btnContinue.isEnabled = true
                    }
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "Lỗi cập nhật tên: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.btnContinue.isEnabled = true
            }
    }

    private fun showAddEmailDialog() {
        AlertDialog.Builder(this)
            .setTitle("Thêm email?")
            .setMessage("Thêm email để:\n• Khôi phục tài khoản nếu mất số điện thoại\n• Nhận hóa đơn và khuyến mãi")
            .setPositiveButton("Thêm ngay") { _, _ ->
                val intent = Intent(this, AddEmailActivity::class.java)
                startActivity(intent)
            }
            .setNegativeButton("Để sau") { _, _ ->
                navigateToHome()
            }
            .setCancelable(false)
            .show()
    }

    private fun navigateToHome() {
        val intent = Intent(this, RiderMainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}