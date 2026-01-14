package com.example.ridego.ui.profile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivitySupportBinding

class SupportActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySupportBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySupportBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        binding.btnFaq.setOnClickListener {
            startActivity(Intent(this, com.example.ridego.ui.legal.FaqActivity::class.java))
        }
        binding.btnGuide.setOnClickListener {
            startActivity(Intent(this, com.example.ridego.ui.legal.GuideActivity::class.java))
        }
        binding.btnContact.setOnClickListener {
            showContactDialog()
        }
        binding.btnSendFeedback.setOnClickListener {
            showFeedbackDialog()
        }
        binding.btnOpenWebsite.setOnClickListener {
            // Mở website local từ assets
            val url = "file:///android_asset/support_site/index.html"
            val intent = Intent(this, com.example.ridego.ui.common.WebViewActivity::class.java)
            intent.putExtra(com.example.ridego.ui.common.WebViewActivity.EXTRA_URL, url)
            intent.putExtra(com.example.ridego.ui.common.WebViewActivity.EXTRA_TITLE, "Trung tâm Hỗ trợ")
            startActivity(intent)
        }
    }

    private fun showFaqDialog() {
        AlertDialog.Builder(this)
            .setTitle("Câu hỏi thường gặp (FAQ)")
            .setMessage("1. Làm sao để đặt xe?\n2. Làm sao để liên hệ tài xế?\n3. Tôi quên mật khẩu, làm sao lấy lại?")
            .setPositiveButton("Đã hiểu", null)
            .show()
    }

    private fun showGuideDialog() {
        AlertDialog.Builder(this)
            .setTitle("Hướng dẫn sử dụng")
            .setMessage("- Đăng nhập/Đăng ký tài khoản\n- Chọn điểm đón và điểm đến\n- Xác nhận chuyến đi\n- Thanh toán và đánh giá tài xế")
            .setPositiveButton("Đã hiểu", null)
            .show()
    }

    private fun showContactDialog() {
        AlertDialog.Builder(this)
            .setTitle("Liên hệ hỗ trợ")
            .setMessage("Hotline: 1900 1234\nEmail: support@ridego.vn\nGiờ làm việc: 8h-22h hàng ngày")
            .setPositiveButton("Gọi hotline") { _, _ ->
                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:19001234"))
                startActivity(intent)
            }
            .setNegativeButton("Gửi email") { _, _ ->
                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:support@ridego.vn"))
                startActivity(intent)
            }
            .setNeutralButton("Đóng", null)
            .show()
    }

    private fun showFeedbackDialog() {
        val input = android.widget.EditText(this)
        input.hint = "Nhập phản hồi/lỗi của bạn..."
        AlertDialog.Builder(this)
            .setTitle("Gửi phản hồi/lỗi")
            .setView(input)
            .setPositiveButton("Gửi") { _, _ ->
                val feedback = input.text.toString().trim()
                if (feedback.isEmpty()) {
                    Toast.makeText(this, "Vui lòng nhập nội dung phản hồi!", Toast.LENGTH_SHORT).show()
                } else {
                    // TODO: Gửi feedback lên Firestore hoặc email admin
                    Toast.makeText(this, "Đã gửi phản hồi!", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
}
