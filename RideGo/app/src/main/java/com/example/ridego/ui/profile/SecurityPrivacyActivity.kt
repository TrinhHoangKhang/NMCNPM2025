package com.example.ridego.ui.profile

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivitySecurityPrivacyBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class SecurityPrivacyActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySecurityPrivacyBinding
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySecurityPrivacyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        loadUserSettings()
        setupClickListeners()
    }

    private fun loadUserSettings() {
        val user = auth.currentUser ?: return
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
                        if (document.exists()) {
                            binding.switch2FA.isChecked = document.getBoolean("twoFactorEnabled") ?: false
                            binding.switchShowPhone.isChecked = document.getBoolean("showPhoneToDriver") ?: true
                            binding.switchShowAvatar.isChecked = document.getBoolean("showAvatarToDriver") ?: true
                        }
                    }
            }
    }

    private fun setupClickListeners() {
        // Đổi mật khẩu
        binding.optChangePassword.setOnClickListener {
            showChangePasswordDialog()
        }

        // Xác thực 2 yếu tố
        binding.switch2FA.setOnCheckedChangeListener { _, isChecked ->
            update2FAStatus(isChecked)
        }

        // Quản lý thiết bị
        binding.optDevices.setOnClickListener {
            Toast.makeText(this, "Tính năng đang phát triển", Toast.LENGTH_SHORT).show()
        }

        // Quyền truy cập vị trí
        binding.optLocation.setOnClickListener {
            openAppSettings()
        }

        // Hiển thị SĐT cho tài xế
        binding.switchShowPhone.setOnCheckedChangeListener { _, isChecked ->
            updatePrivacySetting("showPhoneToDriver", isChecked)
        }

        // Hiển thị avatar
        binding.switchShowAvatar.setOnCheckedChangeListener { _, isChecked ->
            updatePrivacySetting("showAvatarToDriver", isChecked)
        }

        // Quyền ứng dụng
        binding.optPermissions.setOnClickListener {
            openAppSettings()
        }

        // Xóa lịch sử
        binding.optClearHistory.setOnClickListener {
            showClearHistoryDialog()
        }

        // Tạm khóa tài khoản
        binding.optLockAccount.setOnClickListener {
            showLockAccountDialog()
        }

        // Xóa tài khoản
        binding.optDeleteAccount.setOnClickListener {
            showDeleteAccountDialog()
        }

        // Điều khoản sử dụng
        binding.optTerms.setOnClickListener {
            openWebPage("https://ridego.com/terms")
        }

        // Chính sách bảo mật
        binding.optPrivacyPolicy.setOnClickListener {
            openWebPage("https://ridego.com/privacy")
        }
    }

    private fun showChangePasswordDialog() {
        val user = auth.currentUser
        if (user == null) {
            Toast.makeText(this, "Vui lòng đăng nhập lại", Toast.LENGTH_SHORT).show()
            return
        }

        // Kiểm tra 2FA
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
                        val is2FAEnabled = document.getBoolean("twoFactorEnabled") ?: false
                        
                        if (is2FAEnabled) {
                            // Yêu cầu nhập mật khẩu cũ trước
                            showPasswordVerificationForReset(user)
                        } else {
                            // Gửi email trực tiếp
                            sendPasswordResetEmail(user)
                        }
                    }
            }
    }
    
    private fun showPasswordVerificationForReset(user: com.google.firebase.auth.FirebaseUser) {
        val editText = android.widget.EditText(this).apply {
            hint = "Nhập mật khẩu hiện tại"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            setPadding(50, 40, 50, 40)
        }
        
        AlertDialog.Builder(this)
            .setTitle("🔒 Xác thực 2 yếu tố")
            .setMessage("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu")
            .setView(editText)
            .setPositiveButton("Xác nhận") { _, _ ->
                val password = editText.text.toString()
                if (password.isEmpty()) {
                    Toast.makeText(this, "Vui lòng nhập mật khẩu", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                val credential = com.google.firebase.auth.EmailAuthProvider.getCredential(user.email ?: "", password)
                user.reauthenticate(credential)
                    .addOnSuccessListener {
                        sendPasswordResetEmail(user)
                    }
                    .addOnFailureListener {
                        Toast.makeText(this, "Mật khẩu không chính xác!", Toast.LENGTH_SHORT).show()
                    }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
    
    private fun sendPasswordResetEmail(user: com.google.firebase.auth.FirebaseUser) {
        AlertDialog.Builder(this)
            .setTitle("Đổi mật khẩu")
            .setMessage("Chúng tôi sẽ gửi email hướng dẫn đổi mật khẩu đến ${user.email}")
            .setPositiveButton("Gửi email") { _, _ ->
                auth.sendPasswordResetEmail(user.email ?: "")
                    .addOnSuccessListener {
                        Toast.makeText(this, "Đã gửi email đổi mật khẩu", Toast.LENGTH_SHORT).show()
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun update2FAStatus(enabled: Boolean) {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid

        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }

                db.collection("users").document(customUserId)
                    .update("twoFactorEnabled", enabled)
                    .addOnSuccessListener {
                        val message = if (enabled) "Đã bật xác thực 2 yếu tố" else "Đã tắt xác thực 2 yếu tố"
                        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                        binding.switch2FA.isChecked = !enabled
                    }
            }
    }

    private fun updatePrivacySetting(field: String, value: Boolean) {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid

        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }

                db.collection("users").document(customUserId)
                    .update(field, value)
                    .addOnSuccessListener {
                        Toast.makeText(this, "Đã cập nhật cài đặt", Toast.LENGTH_SHORT).show()
                    }
            }
    }

    private fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = Uri.fromParts("package", packageName, null)
        startActivity(intent)
    }

    private fun showClearHistoryDialog() {
        AlertDialog.Builder(this)
            .setTitle("Xóa lịch sử chuyến đi")
            .setMessage("Bạn có chắc muốn xóa toàn bộ lịch sử chuyến đi? Hành động này không thể hoàn tác.")
            .setPositiveButton("Xóa") { _, _ ->
                clearTripHistory()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun clearTripHistory() {
        val user = auth.currentUser ?: return
        Toast.makeText(this, "Đang xóa lịch sử...", Toast.LENGTH_SHORT).show()
        // TODO: Implement clear history from Firestore
    }

    private fun showLockAccountDialog() {
        AlertDialog.Builder(this)
            .setTitle("Tạm khóa tài khoản")
            .setMessage("Tài khoản sẽ bị vô hiệu hóa tạm thời. Bạn có thể kích hoạt lại bất cứ lúc nào.")
            .setPositiveButton("Khóa") { _, _ ->
                lockAccount()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun lockAccount() {
        Toast.makeText(this, "Tính năng đang phát triển", Toast.LENGTH_SHORT).show()
    }

    private fun showDeleteAccountDialog() {
        AlertDialog.Builder(this)
            .setTitle("⚠️ Xóa tài khoản vĩnh viễn")
            .setMessage("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. Không thể khôi phục!")
            .setPositiveButton("Xóa vĩnh viễn") { _, _ ->
                confirmDeleteAccount()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun confirmDeleteAccount() {
        AlertDialog.Builder(this)
            .setTitle("Xác nhận lần cuối")
            .setMessage("Nhập 'XÓA TÀI KHOẢN' để xác nhận")
            .setPositiveButton("Xác nhận") { _, _ ->
                deleteAccount()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun deleteAccount() {
        Toast.makeText(this, "Tính năng đang phát triển", Toast.LENGTH_SHORT).show()
    }

    private fun openWebPage(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }
}
