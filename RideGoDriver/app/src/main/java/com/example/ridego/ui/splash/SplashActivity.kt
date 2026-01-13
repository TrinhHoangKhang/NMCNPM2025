package com.example.ridego.ui.splash

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivitySplashBinding
import com.example.ridego.ui.auth.AddPhoneActivity
import com.example.ridego.ui.auth.CompleteProfileActivity
import com.example.ridego.ui.onboarding.OnboardingActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.example.ridego.ui.driver.home.DriverMainActivity

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding
    private val viewModel: SplashViewModel by viewModels()
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setup ViewBinding
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Quan sát dữ liệu từ ViewModel
        viewModel.navigateToNextScreen.observe(this) { shouldNavigate ->
            if (shouldNavigate) {
                // Kiểm tra đăng nhập tự động
                checkAutoLogin()
            }
        }

        // Bắt đầu load
        viewModel.startLoading()
    }
    
    private fun checkAutoLogin() {
        val currentUser = auth.currentUser
        
        if (currentUser == null) {
            // Chưa đăng nhập -> vào onboarding
            navigateToOnboarding()
            return
        }
        
        // Đã có user, kiểm tra thêm thông tin
        val firebaseUid = currentUser.uid
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                if (!mappingDoc.exists()) {
                    // Không tìm thấy mapping -> user không hợp lệ, đăng xuất
                    auth.signOut()
                    navigateToOnboarding()
                    return@addOnSuccessListener
                }
                
                val customUserId = mappingDoc.getString("customUserId") ?: firebaseUid
                
                db.collection("users").document(customUserId).get()
                    .addOnSuccessListener { userDoc ->
                        if (!userDoc.exists()) {
                            // User document không tồn tại -> user không hợp lệ, đăng xuất
                            auth.signOut()
                            navigateToOnboarding()
                            return@addOnSuccessListener
                        }
                        
                        val accountStatus = userDoc.getString("accountStatus") ?: "active"
                        
                        if (accountStatus == "locked") {
                            // Tài khoản bị khóa -> vào Login để xử lý mở khóa
                            auth.signOut()
                            navigateToOnboarding()
                            return@addOnSuccessListener
                        }
                        
                        // Kiểm tra đã hoàn thiện thông tin chưa
                        val name = userDoc.getString("name")
                        val phone = userDoc.getString("phone") ?: currentUser.phoneNumber
                        
                        when {
                            name.isNullOrBlank() -> {
                                navigateToCompleteProfile()
                            }
                            phone.isNullOrBlank() -> {
                                navigateToAddPhone()
                            }
                            else -> {
                                // Đủ thông tin -> vào app
                                navigateToHome()
                            }
                        }
                    }
                    .addOnFailureListener {
                        // Lỗi đọc user -> đăng xuất và vào onboarding
                        auth.signOut()
                        navigateToOnboarding()
                    }
            }
            .addOnFailureListener {
                // Lỗi đọc mapping -> vào onboarding
                navigateToOnboarding()
            }
    }
    
    private fun navigateToHome() {
        val intent = Intent(this, DriverMainActivity::class.java)
        startActivity(intent)
        finish()
    }
    
    private fun navigateToOnboarding() {
        val intent = Intent(this, OnboardingActivity::class.java)
        startActivity(intent)
        finish()
    }
    
    private fun navigateToCompleteProfile() {
        val intent = Intent(this, CompleteProfileActivity::class.java)
        startActivity(intent)
        finish()
    }
    
    private fun navigateToAddPhone() {
        val intent = Intent(this, AddPhoneActivity::class.java)
        startActivity(intent)
        finish()
    }
}