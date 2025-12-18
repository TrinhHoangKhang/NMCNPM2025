package com.example.ridego.ui.onboarding

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.viewpager2.widget.ViewPager2
import com.example.ridego.R
import com.example.ridego.databinding.ActivityOnboardingBinding
import com.example.ridego.ui.auth.LoginActivity

class OnboardingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBinding
    private lateinit var onboardingAdapter: OnboardingAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupOnboardingItems()
        setupIndicators()
        setCurrentIndicator(0)

        // Đăng ký sự kiện khi lướt trang
        binding.viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                setCurrentIndicator(position)

                // LOGIC MỚI: Xử lý nút Button và nút Skip
                if (position == onboardingAdapter.itemCount - 1) {
                    binding.btnNext.text = "Bắt đầu"
                    // Ẩn nút Bỏ qua ở trang cuối (Dùng INVISIBLE để giữ chỗ, không bị nhảy layout)
                    binding.tvSkip.visibility = View.INVISIBLE
                } else {
                    binding.btnNext.text = "Tiếp theo"
                    // Hiện lại nút Bỏ qua ở các trang trước
                    binding.tvSkip.visibility = View.VISIBLE
                }
            }
        })

        binding.btnNext.setOnClickListener {
            if (binding.viewPager.currentItem + 1 < onboardingAdapter.itemCount) {
                binding.viewPager.currentItem += 1
            } else {
                navigateToLogin()
            }
        }

        binding.tvSkip.setOnClickListener {
            navigateToLogin()
        }
    }

    // ... (Hàm setupOnboardingItems giữ nguyên) ...
    private fun setupOnboardingItems() {
        val items = listOf(
            OnboardingItem(
                R.drawable.bg_circle_purple,
                R.drawable.ic_onboarding_car,
                "Đặt xe dễ dàng",
                "Chỉ cần vài chạm để có xe đến đón bạn ngay lập tức"
            ),
            OnboardingItem(
                R.drawable.bg_circle_orange,
                R.drawable.ic_onboarding_location,
                "Theo dõi hành trình",
                "Xem vị trí xe và tài xế theo thời gian thực"
            ),
            OnboardingItem(
                R.drawable.bg_circle_mixed,
                R.drawable.ic_onboarding_shield,
                "An toàn & Tin cậy",
                "Tài xế được kiểm duyệt kỹ lưỡng, hành trình được bảo hiểm"
            )
        )
        onboardingAdapter = OnboardingAdapter(items)
        binding.viewPager.adapter = onboardingAdapter
    }


    // LOGIC MỚI: Thêm sự kiện click cho các dấu chấm
    private fun setupIndicators() {
        val indicators = arrayOfNulls<ImageView>(onboardingAdapter.itemCount)
        val layoutParams = LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
        layoutParams.setMargins(16, 0, 16, 0) // Tăng khoảng cách chấm lên một chút cho dễ bấm

        for (i in indicators.indices) {
            indicators[i] = ImageView(applicationContext)
            indicators[i]?.setImageDrawable(
                ContextCompat.getDrawable(applicationContext, R.drawable.indicator_inactive)
            )
            indicators[i]?.layoutParams = layoutParams

            // THÊM DÒNG NÀY: Bấm vào chấm nào thì ViewPager nhảy tới trang đó
            indicators[i]?.setOnClickListener {
                binding.viewPager.currentItem = i
            }

            binding.layoutIndicators.addView(indicators[i])
        }
    }

    private fun setCurrentIndicator(index: Int) {
        val childCount = binding.layoutIndicators.childCount
        for (i in 0 until childCount) {
            val imageView = binding.layoutIndicators.getChildAt(i) as ImageView
            if (i == index) {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(applicationContext, R.drawable.indicator_active)
                )
            } else {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(applicationContext, R.drawable.indicator_inactive)
                )
            }
        }
    }

    private fun navigateToLogin() {
        Toast.makeText(this, "Chuyển đến màn Login", Toast.LENGTH_SHORT).show()
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }
}