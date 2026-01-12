package com.example.ridego.ui.auth

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.data.AuthRepository
import com.example.ridego.databinding.ActivityLoginBinding
import com.example.ridego.ui.rider.main.RiderMainActivity
import com.example.ridego.utils.DeviceSessionManager
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import java.util.concurrent.TimeUnit

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val viewModel: AuthViewModel by viewModels { AuthViewModelFactory(AuthRepository()) }
    private val db = FirebaseFirestore.getInstance()
    private lateinit var googleSignInClient: GoogleSignInClient

    private var cooldownTimer: CountDownTimer? = null
    private val defaultCooldownMs: Long = 60_000L
    
    private val sharedPreferences by lazy {
        getSharedPreferences("RideGoPrefs", MODE_PRIVATE)
    }

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

        // Load thông tin đăng nhập đã lưu
        loadSavedCredentials()

        setupEvents()
        observeViewModel()
        
        // Lắng nghe thay đổi checkbox - xóa credentials ngay khi bỏ tick
        binding.cbRememberMe.setOnCheckedChangeListener { _, isChecked ->
            if (!isChecked) {
                clearCredentials()
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        // Enable lại input khi quay về từ màn hình OTP hoặc màn hình khác
        enablePhoneInput()
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
                Toast.makeText(this, "Email hoặc mật khẩu không hợp lệ", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            // Lưu thông tin nếu checkbox được chọn
            if (binding.cbRememberMe.isChecked) {
                saveCredentials(email, password)
            } else {
                clearCredentials()
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
                    // Có thể show progress bar
                }
                is AuthState.Success -> {
                    // Kiểm tra trạng thái tài khoản trước khi cho phép đăng nhập
                    checkAccountStatusAndProceed()
                }
                is AuthState.Error -> {
                    Toast.makeText(this, "Lỗi: ${state.message}", Toast.LENGTH_LONG).show()
                    enablePhoneInput()
                    viewModel.resetState()
                }
                is AuthState.EmailVerificationNeeded -> {
                    val i = Intent(this, EmailVerificationActivity::class.java)
                    i.putExtra("email", state.email)
                    startActivity(i)
                    viewModel.resetState()
                }
                else -> {
                    enablePhoneInput()
                }
            }
        }
    }

    private fun checkAccountStatusAndProceed() {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return
        val firebaseUid = currentUser.uid
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                db.collection("users").document(customUserId).get()
                    .addOnSuccessListener { userDoc ->
                        val accountStatus = userDoc.getString("accountStatus") ?: "active"
                        
                        if (accountStatus == "locked") {
                            // Tài khoản bị khóa -> hiển thị dialog
                            showLockedAccountDialog(currentUser.email ?: "", customUserId)
                        } else {
                            // Tài khoản bình thường -> tiếp tục đăng nhập
                            proceedWithLogin()
                        }
                    }
                    .addOnFailureListener {
                        // Không tìm thấy user doc -> tiếp tục (có thể là user mới)
                        proceedWithLogin()
                    }
            }
            .addOnFailureListener {
                // Không tìm thấy mapping -> tiếp tục
                proceedWithLogin()
            }
    }

    private fun showLockedAccountDialog(email: String, customUserId: String) {
        AlertDialog.Builder(this)
            .setTitle("🔒 Tài khoản đã bị khóa")
            .setMessage("Tài khoản của bạn hiện đang bị tạm khóa.\n\nBạn có muốn mở khóa tài khoản không?\n\nChúng tôi sẽ gửi email xác nhận đến:\n$email")
            .setPositiveButton("Gửi email mở khóa") { _, _ ->
                sendUnlockEmail(email, customUserId)
            }
            .setNegativeButton("Hủy") { _, _ ->
                // Đăng xuất và ở lại màn hình login
                FirebaseAuth.getInstance().signOut()
                viewModel.resetState()
            }
            .setCancelable(false)
            .show()
    }

    private fun sendUnlockEmail(email: String, customUserId: String) {
        // Tạo mã xác nhận ngẫu nhiên
        val unlockCode = (100000..999999).random().toString()
        
        // Lưu mã xác nhận vào Firestore
        val unlockData = hashMapOf(
            "unlockCode" to unlockCode,
            "unlockRequestedAt" to com.google.firebase.Timestamp.now(),
            "unlockEmail" to email
        )
        
        db.collection("users").document(customUserId)
            .update(unlockData as Map<String, Any>)
            .addOnSuccessListener {
                // Gửi email qua Firebase Auth (sử dụng password reset email như workaround)
                // Trong thực tế, bạn nên sử dụng Cloud Functions để gửi custom email
                
                AlertDialog.Builder(this)
                    .setTitle("📧 Xác nhận mở khóa")
                    .setMessage("Mã xác nhận mở khóa của bạn là:\n\n$unlockCode\n\nVui lòng nhập mã này để mở khóa tài khoản.")
                    .setPositiveButton("Nhập mã") { _, _ ->
                        showEnterUnlockCodeDialog(customUserId, unlockCode)
                    }
                    .setNegativeButton("Hủy") { _, _ ->
                        FirebaseAuth.getInstance().signOut()
                        viewModel.resetState()
                    }
                    .setCancelable(false)
                    .show()
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                FirebaseAuth.getInstance().signOut()
                viewModel.resetState()
            }
    }

    private fun showEnterUnlockCodeDialog(customUserId: String, correctCode: String) {
        val editText = android.widget.EditText(this).apply {
            hint = "Nhập mã xác nhận 6 số"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
            setPadding(50, 40, 50, 40)
        }
        
        AlertDialog.Builder(this)
            .setTitle("🔓 Nhập mã xác nhận")
            .setMessage("Nhập mã 6 số để mở khóa tài khoản")
            .setView(editText)
            .setPositiveButton("Xác nhận") { _, _ ->
                val enteredCode = editText.text.toString().trim()
                
                if (enteredCode == correctCode) {
                    // Mã đúng -> mở khóa tài khoản
                    unlockAccount(customUserId)
                } else {
                    Toast.makeText(this, "Mã xác nhận không đúng!", Toast.LENGTH_SHORT).show()
                    FirebaseAuth.getInstance().signOut()
                    viewModel.resetState()
                }
            }
            .setNegativeButton("Hủy") { _, _ ->
                FirebaseAuth.getInstance().signOut()
                viewModel.resetState()
            }
            .setCancelable(false)
            .show()
    }

    private fun unlockAccount(customUserId: String) {
        val unlockData = hashMapOf(
            "accountStatus" to "active",
            "unlockedAt" to com.google.firebase.Timestamp.now(),
            "unlockCode" to null,
            "unlockRequestedAt" to null,
            "unlockEmail" to null
        )
        
        db.collection("users").document(customUserId)
            .update(unlockData as Map<String, Any>)
            .addOnSuccessListener {
                Toast.makeText(this, "🎉 Tài khoản đã được mở khóa thành công!", Toast.LENGTH_LONG).show()
                // Tiếp tục đăng nhập bình thường
                proceedWithLogin()
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                FirebaseAuth.getInstance().signOut()
                viewModel.resetState()
            }
    }

    private fun proceedWithLogin() {
        // Đăng ký thiết bị khi đăng nhập thành công
        DeviceSessionManager.registerCurrentDevice(this)
        
        if (isAddPhoneMode) {
            Toast.makeText(this, "Liên kết số điện thoại thành công!", Toast.LENGTH_LONG).show()
            navigateToHome()
        } else {
            Toast.makeText(this, "Đăng nhập thành công", Toast.LENGTH_SHORT).show()
            val currentUser = FirebaseAuth.getInstance().currentUser
            
            // Kiểm tra xem cần hoàn thiện thông tin không
            when {
                currentUser?.displayName.isNullOrBlank() -> {
                    startActivity(Intent(this, CompleteProfileActivity::class.java))
                }
                currentUser?.phoneNumber.isNullOrBlank() -> {
                    val intent = Intent(this, AddPhoneActivity::class.java)
                    startActivity(intent)
                }
                else -> {
                    navigateToHome()
                }
            }
        }
        finishAffinity()
        viewModel.resetState()
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

    private fun loadSavedCredentials() {
        val savedEmail = sharedPreferences.getString("saved_email", "")
        val savedPassword = sharedPreferences.getString("saved_password", "")
        val rememberMe = sharedPreferences.getBoolean("remember_me", false)
        
        if (rememberMe && !savedEmail.isNullOrEmpty() && !savedPassword.isNullOrEmpty()) {
            // Chuyển sang tab email login
            binding.layoutEmailInput.visibility = View.VISIBLE
            binding.layoutPhoneInput.visibility = View.GONE
            binding.btnContinue.visibility = View.GONE
            binding.tvEmailLogin.visibility = View.GONE
            binding.layoutDivider.visibility = View.GONE
            
            // Điền thông tin đã lưu
            binding.edtEmail.setText(savedEmail)
            binding.edtPassword.setText(savedPassword)
            binding.cbRememberMe.isChecked = true
        } else {
            // Không có saved credentials -> hiển thị màn hình mặc định (đăng nhập SĐT)
            binding.layoutEmailInput.visibility = View.GONE
            binding.layoutPhoneInput.visibility = View.VISIBLE
            binding.btnContinue.visibility = View.VISIBLE
            binding.tvEmailLogin.visibility = View.VISIBLE
            binding.layoutDivider.visibility = View.VISIBLE
            binding.cbRememberMe.isChecked = false
            
            // Xóa credentials cũ nếu có
            binding.edtEmail.setText("")
            binding.edtPassword.setText("")
        }
    }
    
    private fun saveCredentials(email: String, password: String) {
        sharedPreferences.edit().apply {
            putString("saved_email", email)
            putString("saved_password", password)
            putBoolean("remember_me", true)
            apply()
        }
    }
    
    private fun clearCredentials() {
        sharedPreferences.edit().apply {
            remove("saved_email")
            remove("saved_password")
            putBoolean("remember_me", false)
            apply()
        }
    }

    companion object {
        private const val TAG = "LoginActivity"
    }
}