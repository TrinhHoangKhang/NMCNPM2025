package com.example.ridego.ui.profile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityReferralBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.text.NumberFormat
import java.util.Locale

class ReferralActivity : AppCompatActivity() {

    private lateinit var binding: ActivityReferralBinding
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    
    private var referralCode = ""
    private val shareMessage: String
        get() = """
🚗 Tải RideGo - Ứng dụng đặt xe tiện lợi!

Sử dụng mã giới thiệu của tôi: $referralCode
✅ Bạn được 30.000đ cho chuyến đi đầu tiên!

📱 Tải app ngay: https://play.google.com/store/apps/details?id=com.example.ridego
        """.trimIndent()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityReferralBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        // Load mã giới thiệu
        loadReferralCode()
        
        // Load thống kê
        loadReferralStats()

        // Sao chép mã
        binding.btnCopyCode.setOnClickListener {
            copyToClipboard(referralCode)
        }

        // Chia sẻ Facebook
        binding.btnShareFacebook.setOnClickListener {
            shareToFacebook()
        }

        // Chia sẻ Messenger
        binding.btnShareMessenger.setOnClickListener {
            shareToMessenger()
        }

        // Chia sẻ Zalo
        binding.btnShareZalo.setOnClickListener {
            shareToZalo()
        }

        // Chia sẻ SMS
        binding.btnShareSMS.setOnClickListener {
            shareViaSMS()
        }

        // Chia sẻ qua ứng dụng khác
        binding.btnShareMore.setOnClickListener {
            shareGeneric()
        }
    }

    private fun loadReferralCode() {
        val user = auth.currentUser ?: return
        
        db.collection("uid_mapping").document(user.uid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = mappingDoc.getString("customUserId") ?: user.uid
                
                db.collection("users").document(customUserId).get()
                    .addOnSuccessListener { document ->
                        if (document.exists()) {
                            // Lấy mã giới thiệu từ Firestore, nếu chưa có thì tạo mới
                            referralCode = document.getString("referralCode") ?: ""
                            
                            if (referralCode.isEmpty()) {
                                // Tạo mã giới thiệu mới
                                referralCode = generateReferralCode(customUserId)
                                
                                // Lưu vào Firestore
                                db.collection("users").document(customUserId)
                                    .update("referralCode", referralCode)
                            }
                            
                            binding.tvReferralCode.text = referralCode
                        }
                    }
            }
    }

    private fun generateReferralCode(userId: String): String {
        // Tạo mã giới thiệu từ ID người dùng
        val prefix = "RIDEGO"
        val suffix = userId.takeLast(4).uppercase()
        val random = (1000..9999).random()
        return "$prefix$suffix$random".take(12)
    }

    private fun loadReferralStats() {
        val user = auth.currentUser ?: return
        
        db.collection("uid_mapping").document(user.uid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = mappingDoc.getString("customUserId") ?: user.uid
                
                db.collection("users").document(customUserId).get()
                    .addOnSuccessListener { document ->
                        if (document.exists()) {
                            val totalInvites = document.getLong("totalInvites")?.toInt() ?: 0
                            val successInvites = document.getLong("successInvites")?.toInt() ?: 0
                            val totalEarned = document.getLong("referralEarned")?.toInt() ?: 0
                            
                            binding.tvTotalInvites.text = totalInvites.toString()
                            binding.tvSuccessInvites.text = successInvites.toString()
                            binding.tvTotalEarned.text = formatCurrency(totalEarned)
                        }
                    }
            }
    }

    private fun formatCurrency(amount: Int): String {
        val formatter = NumberFormat.getInstance(Locale("vi", "VN"))
        return "${formatter.format(amount)}đ"
    }

    private fun copyToClipboard(text: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Mã giới thiệu", text)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(this, "Đã sao chép mã giới thiệu", Toast.LENGTH_SHORT).show()
        
        // Tăng số lượt chia sẻ
        incrementShareCount()
    }

    private fun shareToFacebook() {
        try {
            // Thử mở app Facebook
            val facebookIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, shareMessage)
                setPackage("com.facebook.katana")
            }
            startActivity(facebookIntent)
            incrementShareCount()
        } catch (e: Exception) {
            // Nếu không có Facebook, mở trình duyệt
            try {
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(
                    "https://www.facebook.com/sharer/sharer.php?quote=${Uri.encode(shareMessage)}"
                ))
                startActivity(webIntent)
                incrementShareCount()
            } catch (e2: Exception) {
                Toast.makeText(this, "Không thể mở Facebook", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun shareToMessenger() {
        try {
            val messengerIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, shareMessage)
                setPackage("com.facebook.orca")
            }
            startActivity(messengerIntent)
            incrementShareCount()
        } catch (e: Exception) {
            Toast.makeText(this, "Vui lòng cài đặt Messenger", Toast.LENGTH_SHORT).show()
        }
    }

    private fun shareToZalo() {
        try {
            // Thử các package name khác nhau của Zalo
            val zaloPackages = listOf(
                "com.zing.zalo",
                "com.vng.zalo"
            )
            
            var shared = false
            for (packageName in zaloPackages) {
                if (isAppInstalled(packageName)) {
                    val zaloIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, shareMessage)
                        setPackage(packageName)
                    }
                    startActivity(zaloIntent)
                    incrementShareCount()
                    shared = true
                    break
                }
            }
            
            if (!shared) {
                Toast.makeText(this, "Vui lòng cài đặt Zalo", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Không thể mở Zalo", Toast.LENGTH_SHORT).show()
        }
    }

    private fun shareViaSMS() {
        try {
            val smsIntent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("sms:")
                putExtra("sms_body", shareMessage)
            }
            startActivity(smsIntent)
            incrementShareCount()
        } catch (e: Exception) {
            Toast.makeText(this, "Không thể mở ứng dụng tin nhắn", Toast.LENGTH_SHORT).show()
        }
    }

    private fun shareGeneric() {
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "Mời bạn dùng RideGo")
            putExtra(Intent.EXTRA_TEXT, shareMessage)
        }
        startActivity(Intent.createChooser(shareIntent, "Chia sẻ qua"))
        incrementShareCount()
    }

    private fun isAppInstalled(packageName: String): Boolean {
        return try {
            packageManager.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    private fun incrementShareCount() {
        val user = auth.currentUser ?: return
        
        db.collection("uid_mapping").document(user.uid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = mappingDoc.getString("customUserId") ?: user.uid
                
                db.collection("users").document(customUserId).get()
                    .addOnSuccessListener { document ->
                        if (document.exists()) {
                            val currentCount = document.getLong("totalInvites")?.toInt() ?: 0
                            db.collection("users").document(customUserId)
                                .update("totalInvites", currentCount + 1)
                                .addOnSuccessListener {
                                    // Cập nhật UI
                                    binding.tvTotalInvites.text = (currentCount + 1).toString()
                                }
                        }
                    }
            }
    }
}
