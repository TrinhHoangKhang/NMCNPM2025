package com.example.ridego.ui.legal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityFaqBinding

class FaqActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFaqBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFaqBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        // Dữ liệu mẫu (sau này có thể lấy từ API)
        val faqList = listOf(
            FaqItem(
                "Làm sao để đặt xe?",
                "Để đặt xe, bạn chỉ cần mở ứng dụng:\n1. Nhập điểm đón và điểm đến.\n2. Chọn loại xe phù hợp (Xe máy, Xe hơi...).\n3. Kiểm tra giá và nhấn 'Đặt xe'.\nTài xế sẽ nhận chuyến và đến đón bạn ngay!"
            ),
            FaqItem(
                "Các phương thức thanh toán là gì?",
                "RideGo hỗ trợ nhiều phương thức thanh toán:\n- Tiền mặt: Thanh toán trực tiếp cho tài xế.\n- Ví điện tử: Momo, ZaloPay (liên kết).\n- Thẻ ngân hàng: Visa/Mastercard.\nBạn có thể thay đổi phương thức thanh toán trong mục Cá nhân hoặc trước khi đặt chuyến."
            ),
            FaqItem(
                "Cách tính giá cước chuyến đi?",
                "Giá cước được tính dựa trên:\n- Giá mở cửa (km đầu tiên).\n- Giá theo khoảng cách (km tiếp theo).\n- Phụ phí thời gian (nếu kẹt xe).\n- Phụ phí khung giờ cao điểm (nếu có).\nTổng giá dự kiến sẽ hiển thị rõ ràng trước khi bạn đặt xe."
            ),
            FaqItem(
                "Tôi có thể hủy chuyến xe không?",
                "Có, bạn có thể hủy chuyến nếu thay đổi kế hoạch. Tuy nhiên:\n- Hủy khi tài xế chưa nhận chuyến: Miễn phí.\n- Hủy sau khi tài xế đã di chuyển xa: Có thể áp dụng phí hủy nhỏ để hỗ trợ tài xế.\nVui lòng chọn lý do hủy chính xác để chúng tôi ghi nhận."
            ),
            FaqItem(
                "Làm sao để liên hệ với tài xế?",
                "Sau khi tìm thấy tài xế, bạn có thể:\n- Gọi trực tiếp qua nút 'Gọi điện'.\n- Chat qua nút 'Nhắn tin' trong ứng dụng (miễn phí).\nSố điện thoại của bạn sẽ được ẩn để bảo mật thông tin."
            ),
            FaqItem(
                "Chuyến đi của tôi có an toàn không?",
                "An toàn là ưu tiên hàng đầu của RideGo. Bạn có thể:\n- Xem thông tin tài xế và biển số xe rõ ràng.\n- Chia sẻ hành trình (Live location) cho người thân.\n- Sử dụng nút SOS trong trường hợp khẩn cấp."
            ),
            FaqItem(
                "Tôi bị quên đồ trên xe, phải làm sao?",
                "Đừng lo lắng! Hãy vào mục 'Lịch sử chuyến đi', chọn chuyến xe đó và nhấn 'Báo cáo sự cố' -> 'Quên đồ'. Chúng tôi sẽ hỗ trợ liên hệ tài xế để tìm lại đồ giúp bạn."
            )
        )

        val adapter = FaqAdapter(faqList)
        binding.rvFaq.layoutManager = LinearLayoutManager(this)
        binding.rvFaq.adapter = adapter
    }
}
