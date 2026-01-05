package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityAddPhoneBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.google.firebase.FirebaseException
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import java.util.concurrent.TimeUnit  // <-- THÊM DÒNG NÀY

class AddPhoneActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddPhoneBinding
    private val viewModel: AuthViewModel by viewModels { AuthViewModelFactory(AuthRepository()) }

    private var cooldownTimer: CountDownTimer? = null
    private val defaultCooldownMs: Long = 60_000L

    private val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
        override fun onVerificationCompleted(credential: PhoneAuthCredential) {
            Log.d(TAG, "onVerificationCompleted - Auto link phone")
            viewModel.linkPhoneCredential(credential)
        }

        override fun onVerificationFailed(e: FirebaseException) {
            Log.e(TAG, "onVerificationFailed", e)
            when (e) {
                is com.google.firebase.auth.FirebaseAuthInvalidCredentialsException -> {
                    Toast.makeText(this@AddPhoneActivity, "Số điện thoại không hợp lệ", Toast.LENGTH_LONG).show()
                }
                is com.google.firebase.FirebaseTooManyRequestsException -> {
                    Toast.makeText(this@AddPhoneActivity, "Quá nhiều yêu cầu, vui lòng thử lại sau", Toast.LENGTH_LONG).show()
                    startCooldown()
                }
                else -> {
                    Toast.makeText(this@AddPhoneActivity, "Xác thực thất bại: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
            enablePhoneInput()
        }

        override fun onCodeSent(verificationId: String, token: PhoneAuthProvider.ForceResendingToken) {
            Log.d(TAG, "onCodeSent: $verificationId")
            PhoneAuthHelper.verificationId = verificationId
            PhoneAuthHelper.resendToken = token

            val intent = Intent(this@AddPhoneActivity, OtpVerifyActivity::class.java)
            intent.putExtra("MODE", "ADD_PHONE")
            startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddPhoneBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEvents()
        observeViewModel()
    }

    private fun setupEvents() {
        binding.btnContinue.setOnClickListener {
            val phoneInput = binding.edtPhoneNumber.text.toString().trim()
            if (phoneInput.isBlank()) {
                Toast.makeText(this, "Vui lòng nhập số điện thoại", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            startPhoneNumberVerification(phoneInput)
        }

        // Nút bỏ qua - vào thẳng màn hình chính
        binding.tvSkip.setOnClickListener {
            val intent = Intent(this, RiderMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    // Có thể show loading
                }
                is AuthState.Success -> {
                    Toast.makeText(this, "Liên kết số điện thoại thành công!", Toast.LENGTH_LONG).show()
                    val intent = Intent(this, RiderMainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                    viewModel.resetState()
                }
                is AuthState.Error -> {
                    Toast.makeText(this, "Lỗi: ${state.message}", Toast.LENGTH_LONG).show()
                    enablePhoneInput()
                    viewModel.resetState()
                }
                else -> {
                    enablePhoneInput()
                }
            }
        }
    }

    private fun startPhoneNumberVerification(rawPhone: String) {
        val phone = toE164(rawPhone, "84")
        if (phone == null) {
            Toast.makeText(this, "Số điện thoại không hợp lệ. Ví dụ: 0912345678", Toast.LENGTH_LONG).show()
            return
        }

        Log.d(TAG, "Adding phone: $phone")
        PhoneAuthHelper.lastPhoneNumber = phone

        binding.btnContinue.isEnabled = false
        binding.edtPhoneNumber.isEnabled = false
        val options = PhoneAuthOptions.newBuilder()
            .setPhoneNumber(phone)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(this)
            .setCallbacks(callbacks)
            .build()

        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    private fun enablePhoneInput() {
        binding.btnContinue.isEnabled = true
        binding.edtPhoneNumber.isEnabled = true
        binding.btnContinue.text = "Tiếp tục"
    }

    private fun startCooldown(durationMs: Long = defaultCooldownMs) {
        binding.btnContinue.isEnabled = false
        binding.edtPhoneNumber.isEnabled = false
        cooldownTimer?.cancel()
        cooldownTimer = object : CountDownTimer(durationMs, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val sec = millisUntilFinished / 1000
                binding.btnContinue.text = "Gửi lại sau ${sec}s"
            }

            override fun onFinish() {
                binding.btnContinue.text = "Tiếp tục"
                enablePhoneInput()
            }
        }.start()
    }

    override fun onDestroy() {
        cooldownTimer?.cancel()
        super.onDestroy()
    }

    override fun onResume() {
        super.onResume()
        // Enable lại phone input khi quay lại (trường hợp nhấn back từ OTP)
        if (!binding.btnContinue.isEnabled) {
            enablePhoneInput()
        }
    }

    private fun toE164(raw: String, defaultCountryCode: String = "84"): String? {
        var s = raw.trim()
        if (s.isEmpty()) return null
        s = s.replace(Regex("[\\s\\-()]+"), "")
        if (s.startsWith("+")) {
            return if (s.substring(1).all { it.isDigit() }) s else null
        }
        if (s.startsWith(defaultCountryCode)) {
            val rest = s.substring(defaultCountryCode.length)
            return if (rest.all { it.isDigit() }) "+$defaultCountryCode$rest" else null
        }
        if (s.startsWith("0")) {
            val withoutZero = s.drop(1)
            return if (withoutZero.all { it.isDigit() }) "+$defaultCountryCode$withoutZero" else null
        }
        return if (s.all { it.isDigit() }) "+$defaultCountryCode$s" else null
    }

    companion object {
        private const val TAG = "AddPhoneActivity"
    }
}