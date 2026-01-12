package com.example.ridego.ui.profile

import android.app.AlertDialog
import android.app.ProgressDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.text.InputType
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivitySecurityPrivacyBinding
import com.example.ridego.ui.auth.LoginActivity
import com.example.ridego.ui.common.WebViewActivity
import com.example.ridego.ui.legal.PrivacyPolicyActivity
import com.example.ridego.ui.legal.TermsActivity
import com.example.ridego.utils.DeviceSessionManager
import com.google.firebase.auth.EmailAuthProvider
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

    override fun onResume() {
        super.onResume()
        updateDeviceCount()
    }

    private fun updateDeviceCount() {
        DeviceSessionManager.getDeviceCount { count ->
            runOnUiThread {
                // Cập nhật số lượng thiết bị trong UI
                val deviceCountText = if (count > 0) "$count thiết bị" else ""
                // Tìm TextView hiển thị số thiết bị trong optDevices
                try {
                    val deviceCountView = binding.optDevices.findViewById<TextView>(
                        resources.getIdentifier("tvDeviceCount", "id", packageName)
                    )
                    deviceCountView?.text = deviceCountText
                } catch (e: Exception) {
                    // Ignore if view not found
                }
            }
        }
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
            val intent = Intent(this, DeviceManagementActivity::class.java)
            startActivity(intent)
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
            startActivity(Intent(this, TermsActivity::class.java))
        }

        // Chính sách bảo mật
        binding.optPrivacyPolicy.setOnClickListener {
            startActivity(Intent(this, PrivacyPolicyActivity::class.java))
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
            .setTitle("🔒 Tạm khóa tài khoản")
            .setMessage("Tài khoản sẽ bị vô hiệu hóa tạm thời. Bạn sẽ bị đăng xuất.\n\nKhi đăng nhập lại, bạn sẽ cần xác nhận mã để mở khóa.\n\nBạn có chắc chắn muốn tạm khóa tài khoản?")
            .setPositiveButton("Tạm khóa") { _, _ ->
                showPasswordDialogForLock()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun showPasswordDialogForLock() {
        val user = auth.currentUser ?: return
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 40, 50, 10)
        }
        
        val passwordInput = EditText(this).apply {
            hint = "Nhập mật khẩu để xác nhận"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        layout.addView(passwordInput)
        
        AlertDialog.Builder(this)
            .setTitle("Xác thực")
            .setMessage("Vui lòng nhập mật khẩu để xác nhận tạm khóa tài khoản")
            .setView(layout)
            .setPositiveButton("Xác nhận") { _, _ ->
                val password = passwordInput.text.toString()
                if (password.isEmpty()) {
                    Toast.makeText(this, "Vui lòng nhập mật khẩu", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                val credential = EmailAuthProvider.getCredential(user.email ?: "", password)
                user.reauthenticate(credential)
                    .addOnSuccessListener {
                        lockAccount()
                    }
                    .addOnFailureListener {
                        Toast.makeText(this, "Mật khẩu không chính xác!", Toast.LENGTH_SHORT).show()
                    }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun lockAccount() {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid
        
        val progressDialog = ProgressDialog(this).apply {
            setMessage("Đang tạm khóa tài khoản...")
            setCancelable(false)
            show()
        }
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                // Cập nhật trạng thái tài khoản
                val lockData = hashMapOf(
                    "accountStatus" to "locked",
                    "lockedAt" to com.google.firebase.Timestamp.now(),
                    "lockReason" to "Người dùng tự tạm khóa"
                )
                
                db.collection("users").document(customUserId)
                    .update(lockData as Map<String, Any>)
                    .addOnSuccessListener {
                        progressDialog.dismiss()
                        
                        // Xóa tất cả device sessions
                        db.collection("users").document(customUserId)
                            .collection("device_sessions")
                            .get()
                            .addOnSuccessListener { docs ->
                                val batch = db.batch()
                                docs.forEach { batch.delete(it.reference) }
                                batch.commit()
                            }
                        
                        // Đăng xuất và về màn hình login
                        AlertDialog.Builder(this)
                            .setTitle("Tài khoản đã bị khóa")
                            .setMessage("Tài khoản của bạn đã được tạm khóa thành công.\n\nKhi đăng nhập lại, bạn sẽ nhận được mã xác nhận để mở khóa tài khoản.")
                            .setPositiveButton("OK") { _, _ ->
                                auth.signOut()
                                val intent = Intent(this, LoginActivity::class.java)
                                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                                startActivity(intent)
                                finish()
                            }
                            .setCancelable(false)
                            .show()
                    }
                    .addOnFailureListener { e ->
                        progressDialog.dismiss()
                        Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
            }
    }

    private fun showDeleteAccountDialog() {
        AlertDialog.Builder(this)
            .setTitle("⚠️ Xóa tài khoản vĩnh viễn")
            .setMessage("CẢNH BÁO NGHIÊM TRỌNG!\n\nHành động này sẽ:\n• Xóa vĩnh viễn tài khoản của bạn\n• Xóa toàn bộ lịch sử chuyến đi\n• Xóa tất cả dữ liệu cá nhân\n• Xóa ví và số dư (nếu có)\n\n❌ KHÔNG THỂ HOÀN TÁC!")
            .setPositiveButton("Tiếp tục xóa") { _, _ ->
                confirmDeleteAccount()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun confirmDeleteAccount() {
        val user = auth.currentUser ?: return
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 40, 50, 10)
        }
        
        val passwordInput = EditText(this).apply {
            hint = "Nhập mật khẩu để xác nhận"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        layout.addView(passwordInput)
        
        AlertDialog.Builder(this)
            .setTitle("Xác nhận xóa tài khoản")
            .setMessage("Nhập mật khẩu để xác nhận xóa tài khoản vĩnh viễn")
            .setView(layout)
            .setPositiveButton("Xóa vĩnh viễn") { _, _ ->
                val password = passwordInput.text.toString()
                
                if (password.isEmpty()) {
                    Toast.makeText(this, "Vui lòng nhập mật khẩu", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                val credential = EmailAuthProvider.getCredential(user.email ?: "", password)
                user.reauthenticate(credential)
                    .addOnSuccessListener {
                        deleteAccount()
                    }
                    .addOnFailureListener {
                        Toast.makeText(this, "Mật khẩu không chính xác!", Toast.LENGTH_SHORT).show()
                    }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun deleteAccount() {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid
        
        val progressDialog = ProgressDialog(this).apply {
            setMessage("Đang xóa tài khoản...")
            setCancelable(false)
            show()
        }
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                // Xóa tất cả subcollections và documents trước
                deleteFirestoreData(customUserId, firebaseUid) {
                    // Sau khi xóa Firestore xong, xóa Firebase Auth
                    user.delete()
                        .addOnSuccessListener {
                            progressDialog.dismiss()
                            
                            AlertDialog.Builder(this)
                                .setTitle("Tài khoản đã bị xóa")
                                .setMessage("Tài khoản của bạn đã được xóa vĩnh viễn. Cảm ơn bạn đã sử dụng RideGo.")
                                .setPositiveButton("OK") { _, _ ->
                                    val intent = Intent(this, LoginActivity::class.java)
                                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                                    startActivity(intent)
                                    finish()
                                }
                                .setCancelable(false)
                                .show()
                        }
                        .addOnFailureListener { e ->
                            progressDialog.dismiss()
                            Toast.makeText(this, "Lỗi xóa tài khoản: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                }
            }
            .addOnFailureListener { e ->
                progressDialog.dismiss()
                Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
            }
    }
    
    private fun deleteFirestoreData(customUserId: String, firebaseUid: String, onComplete: () -> Unit) {
        val userDocRef = db.collection("users").document(customUserId)
        
        // Xóa device_sessions subcollection
        userDocRef.collection("device_sessions").get()
            .addOnSuccessListener { sessionDocs ->
                val batch1 = db.batch()
                sessionDocs.forEach { batch1.delete(it.reference) }
                batch1.commit().addOnCompleteListener {
                    
                    // Xóa trips subcollection
                    userDocRef.collection("trips").get()
                        .addOnSuccessListener { tripDocs ->
                            val batch2 = db.batch()
                            tripDocs.forEach { batch2.delete(it.reference) }
                            batch2.commit().addOnCompleteListener {
                                
                                // Xóa user document
                                userDocRef.delete().addOnCompleteListener {
                                    
                                    // Xóa uid_mapping
                                    db.collection("uid_mapping").document(firebaseUid)
                                        .delete()
                                        .addOnCompleteListener {
                                            onComplete()
                                        }
                                }
                            }
                        }
                        .addOnFailureListener {
                            // Nếu lỗi, vẫn tiếp tục xóa các phần còn lại
                            userDocRef.delete().addOnCompleteListener {
                                db.collection("uid_mapping").document(firebaseUid).delete()
                                    .addOnCompleteListener { onComplete() }
                            }
                        }
                }
            }
            .addOnFailureListener {
                // Nếu lỗi, vẫn tiếp tục xóa user document
                userDocRef.delete().addOnCompleteListener {
                    db.collection("uid_mapping").document(firebaseUid).delete()
                        .addOnCompleteListener { onComplete() }
                }
            }
    }

    private fun openWebPage(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }

    private fun openInAppWebView(url: String, title: String) {
        val intent = Intent(this, WebViewActivity::class.java).apply {
            putExtra(WebViewActivity.EXTRA_URL, url)
            putExtra(WebViewActivity.EXTRA_TITLE, title)
        }
        startActivity(intent)
    }
}
