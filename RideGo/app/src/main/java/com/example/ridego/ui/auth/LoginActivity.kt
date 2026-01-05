package com.example.ridego.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityLoginBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.FirebaseException
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import java.util.concurrent.TimeUnit
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val viewModel: AuthViewModel by viewModels { AuthViewModelFactory(AuthRepository()) }
    private lateinit var googleSignInClient: GoogleSignInClient

    private var cooldownTimer: CountDownTimer? = null
    private val defaultCooldownMs: Long = 60_000L

    private val isAddPhoneMode: Boolean
        get() = intent.getStringExtra("MODE") == "ADD_PHONE"

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            account?.idToken?.let { idToken ->
                viewModel.signInWithGoogle(idToken)
            } ?: run {
                Toast.makeText(this, "Không lấy được ID Token", Toast.LENGTH_SHORT).show()
            }
        } catch (e: ApiException) {
            Toast.makeText(this, "Đăng nhập Google thất bại: ${e.message}", Toast.LENGTH_LONG).show()
            Log.e(TAG, "Google sign in failed", e)
        }
    }

    private val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
        override fun onVerificationCompleted(credential: PhoneAuthCredential) {
            Log.d(TAG, "onVerificationCompleted")
            if (isAddPhoneMode) {
                viewModel.linkPhoneCredential(credential)
            } else {
                viewModel.signInWithCredential(credential)
            }
        }

        override fun onVerificationFailed(e: FirebaseException) {
            Log.e(TAG, "onVerificationFailed", e)
            when (e) {
                is com.google.firebase.auth.FirebaseAuthInvalidCredentialsException -> {
                    Toast.makeText(this@LoginActivity, "Số điện thoại không hợp lệ", Toast.LENGTH_LONG).show()
                }
                is com.google.firebase.FirebaseTooManyRequestsException -> {
                    Toast.makeText(this@LoginActivity, "Quá nhiều yêu cầu, vui lòng thử lại sau", Toast.LENGTH_LONG).show()
                    startCooldown()
                }
                else -> {
                    Toast.makeText(this@LoginActivity, "Xác thực thất bại: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
            enablePhoneInput()
        }

        override fun onCodeSent(verificationId: String, token: PhoneAuthProvider.ForceResendingToken) {
            super.onCodeSent(verificationId, token)
            Log.d(TAG, "onCodeSent verificationId=$verificationId")

            PhoneAuthHelper.verificationId = verificationId
            PhoneAuthHelper.resendToken = token

            val intent = Intent(this@LoginActivity, OtpVerifyActivity::class.java)
            intent.putExtra("MODE", if (isAddPhoneMode) "ADD_PHONE" else null)
            startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Khởi tạo Google Sign-In
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(com.example.ridego.R.string.google_web_client_id))
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)

        setupEvents()
        observeViewModel()
        
        // Force show Email input for API login
        binding.layoutEmailInput.visibility = View.VISIBLE
        binding.layoutPhoneInput.visibility = View.GONE
        binding.btnContinue.visibility = View.GONE // Ensure the 'Continue' button for phone is hidden if present
        
        // Since we are forcing Email, maybe we should hide the toggle 'tvEmailLogin' or update its text.
        // For now, let's just make it work.
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

        binding.tvEmailLogin.setOnClickListener {
            binding.layoutEmailInput.visibility = View.VISIBLE
            binding.layoutPhoneInput.visibility = View.GONE
            binding.btnContinue.visibility = View.GONE
            binding.tvEmailLogin.visibility = View.GONE
            binding.layoutDivider.visibility = View.GONE
        }

        binding.tvBackToPhone.setOnClickListener {
            binding.layoutEmailInput.visibility = View.GONE
            binding.layoutPhoneInput.visibility = View.VISIBLE
            binding.btnContinue.visibility = View.VISIBLE
            binding.tvEmailLogin.visibility = View.VISIBLE
            binding.layoutDivider.visibility = View.VISIBLE
        }

        binding.btnLogin.setOnClickListener {
            val email = binding.edtEmail.text.toString().trim()
            val password = binding.edtPassword.text.toString().trim()
            if (email.isEmpty() || password.length < 6) {
                Toast.makeText(this, "Email or password invalid", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.login(email, password)
        }

        binding.tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.btnGoogle.setOnClickListener {
            signInWithGoogle()
        }

        binding.tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    // Show progress
                    binding.btnLogin.isEnabled = false
                }
                is AuthState.Success -> {
                    if (isAddPhoneMode) {
                        Toast.makeText(this, "Liên kết số điện thoại thành công!", Toast.LENGTH_LONG).show()
                        navigateToHome()  // Vào app luôn vì đã có tài khoản email rồi
                    } else {
                        Toast.makeText(this, "Đăng nhập thành công", Toast.LENGTH_SHORT).show()
                        val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
                        
                        // Kiểm tra xem cần hoàn thiện thông tin không
                        when {
                            currentUser?.displayName.isNullOrBlank() -> {
                                // Chưa có tên -> hoàn thiện profile
                                startActivity(Intent(this, CompleteProfileActivity::class.java))
                            }
                            currentUser?.phoneNumber.isNullOrBlank() -> {
                                // Chưa có SĐT (đăng nhập bằng Google/Email) -> yêu cầu thêm SĐT
                                val intent = Intent(this, AddPhoneActivity::class.java)
                                startActivity(intent)
                            }
                            else -> {
                                // Đã đủ thông tin -> vào app
                                navigateToHome()
                            }
                        }
                    }
                    finishAffinity()
                    viewModel.resetState()
                }
                is AuthState.Error -> {
                    binding.btnLogin.isEnabled = true
                    Toast.makeText(this, "Error: ${state.message}", Toast.LENGTH_LONG).show()
                    viewModel.resetState() // Reset so we can try again
                }
                else -> {
                    binding.btnLogin.isEnabled = true
                }
            }
        }
    }

    private fun navigateToHome() {
        val intent = Intent(this, RiderMainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    private fun startPhoneNumberVerification(rawPhone: String) {
        val phone = toE164(rawPhone, "84")
        if (phone == null) {
            Toast.makeText(this, "Số điện thoại không hợp lệ. Ví dụ: 0912345678", Toast.LENGTH_LONG).show()
            return
        }

        Log.d(TAG, "startPhoneNumberVerification -> phone=$phone")
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
                binding.btnContinue.text = "Bạn có thể gửi lại sau ${sec}s"
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

    private fun signInWithGoogle() {
        // Sign out trước để luôn hiển thị màn hình chọn tài khoản
        googleSignInClient.signOut().addOnCompleteListener(this) {
            val signInIntent = googleSignInClient.signInIntent
            googleSignInLauncher.launch(signInIntent)
        }
    }

    companion object {
        private const val TAG = "LoginActivity"
    }
}