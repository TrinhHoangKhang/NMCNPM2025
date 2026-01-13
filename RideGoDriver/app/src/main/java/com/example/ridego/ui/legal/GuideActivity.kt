package com.example.ridego.ui.legal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityGuideBinding

class GuideActivity : AppCompatActivity() {
    private lateinit var binding: ActivityGuideBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGuideBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        val guideList = listOf(
            GuideItem(
                "1",
                "Tạo tài khoản",
                "Tải ứng dụng RideGo và đăng ký bằng số điện thoại hoặc email. Nhập mã OTP xác thực để hoàn tất."
            ),
            GuideItem(
                "2",
                "Đặt chuyến xe",
                "Tại màn hình chính, nhập điểm đến vào ô tìm kiếm. Chọn loại xe bạn muốn đi (Xe máy, Ô tô 4 chỗ, 7 chỗ...) và nhấn 'Xác nhận'."
            ),
            GuideItem(
                "3",
                "Trong chuyến đi",
                "Bạn có thể theo dõi lộ trình di chuyển trực tiếp trên bản đồ. Có thể chia sẻ vị trí cho bạn bè/người thân để họ yên tâm."
            ),
            GuideItem(
                "4",
                "Thanh toán & Đánh giá",
                "Khi đến nơi, ứng dụng sẽ hiện tổng cước (nếu trả tiền mặt). Đừng quên đánh giá sao cho tài xế để giúp chúng tôi nâng cao chất lượng dịch vụ nhé!"
            ),
            GuideItem(
                "5",
                "Tích điểm & Ưu đãi",
                "Mỗi chuyến đi hoàn thành bạn sẽ nhận được RidePoints. Dùng điểm này để đổi các voucher giảm giá cho các chuyến sau."
            )
        )

        val adapter = GuideAdapter(guideList)
        binding.rvGuide.layoutManager = LinearLayoutManager(this)
        binding.rvGuide.adapter = adapter
    }
}
