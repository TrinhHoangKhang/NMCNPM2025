package com.example.ridego.ui.auth

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import androidx.lifecycle.lifecycleScope
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityOtpVerifyBinding
import com.google.firebase.auth.PhoneAuthProvider
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import android.content.Intent
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions

class OtpVerifyActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOtpVerifyBinding
    private val viewModel: AuthViewModel by viewModels { AuthViewModelFactory(AuthRepository()) }

    private val isAddPhoneMode: Boolean
        get() = intent.getStringExtra("MODE") == "ADD_PHONE"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOtpVerifyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val verificationId = PhoneAuthHelper.verificationId
        if (verificationId == null) {
            Toast.makeText(this, "Không tìm thấy mã verification. Vui lòng thử lại.", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        binding.btnVerifyOtp.setOnClickListener {
            val code = binding.edtOtp.text.toString().trim()
            if (code.length < 4) {
                Toast.makeText(this, "Nhập mã OTP hợp lệ", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.progressOtp.visibility = View.VISIBLE
            binding.btnVerifyOtp.isEnabled = false
            if (isAddPhoneMode) {
                // Gọi hàm MỚI: xác minh và LIÊN KẾT SĐT
                viewModel.verifyOtpAndLink(verificationId, code)
            } else {
                // Gọi hàm CŨ: xác minh và ĐĂNG NHẬP (cho luồng đăng nhập/đăng ký SĐT)
                viewModel.verifyOtp(verificationId, code)
            }
        }

        binding.tvResend.setOnClickListener {
            val phone = PhoneAuthHelper.lastPhoneNumber
            val token = PhoneAuthHelper.resendToken
            if (phone == null) {
                Toast.makeText(this, "Không có số điện thoại để gửi lại. Vui lòng quay lại.", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            doResend(phone, token)
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this, Observer { state ->
            binding.progressOtp.visibility = View.GONE
            binding.btnVerifyOtp.isEnabled = true

            when (state) {
                is AuthState.Loading -> {
                }
                is AuthState.Success -> {
                    if (isAddPhoneMode) {
                        Toast.makeText(this, "Liên kết số điện thoại thành công!", Toast.LENGTH_LONG).show()
                        // Vào app luôn vì đã có tài khoản email rồi
                        startActivity(Intent(this, RiderMainActivity::class.java))
                    } else {
                        Toast.makeText(this, "Xác thực thành công", Toast.LENGTH_SHORT).show()
                        val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
                        if (currentUser?.displayName.isNullOrBlank()) {
                            startActivity(Intent(this, CompleteProfileActivity::class.java))
                        } else {
                            startActivity(Intent(this, RiderMainActivity::class.java))
                        }
                    }
                    finishAffinity()
                    viewModel.resetState()
                }
                is AuthState.Error -> {
                    Toast.makeText(this, "Lỗi: ${state.message}", Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }
                else -> {}
            }
        })
    }

    private fun doResend(phone: String, token: PhoneAuthProvider.ForceResendingToken?) {
        binding.tvResend.isEnabled = false
        lifecycleScope.launch {
            try {
                val builder = PhoneAuthOptions.newBuilder(com.google.firebase.auth.FirebaseAuth.getInstance())
                    .setPhoneNumber(phone)
                    .setTimeout(60L, java.util.concurrent.TimeUnit.SECONDS)
                    .setActivity(this@OtpVerifyActivity)
                    .setCallbacks(object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                        override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                            if (isAddPhoneMode) {
                                viewModel.linkPhoneCredential(credential)  // Link khi resend trong mode thêm phone
                            } else {
                                viewModel.signInWithCredential(credential)
                            }
                        }

                        override fun onVerificationFailed(e: com.google.firebase.FirebaseException) {
                            Log.e(TAG, "resend onVerificationFailed", e)
                            Toast.makeText(this@OtpVerifyActivity, "Gửi lại thất bại: ${e.message}", Toast.LENGTH_LONG).show()
                        }

                        override fun onCodeSent(verificationId: String, forceResendingToken: PhoneAuthProvider.ForceResendingToken) {
                            PhoneAuthHelper.verificationId = verificationId
                            PhoneAuthHelper.resendToken = forceResendingToken
                            Toast.makeText(this@OtpVerifyActivity, "Mã đã được gửi lại", Toast.LENGTH_SHORT).show()
                        }
                    })

                if (token != null) builder.setForceResendingToken(token)

                val options = builder.build()
                PhoneAuthProvider.verifyPhoneNumber(options)
            } finally {
                delay(1500)
                binding.tvResend.isEnabled = true
            }
        }
    }

    companion object {
        private const val TAG = "OtpVerifyActivity"
    }
}

object PhoneAuthHelper {
    var verificationId: String? = null
    var resendToken: PhoneAuthProvider.ForceResendingToken? = null
    var lastPhoneNumber: String? = null
}