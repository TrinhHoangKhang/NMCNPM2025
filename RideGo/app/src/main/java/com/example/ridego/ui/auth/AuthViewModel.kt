package com.example.ridego.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.ridego.data.AuthRepository
import com.example.ridego.data.UserProfile
import com.google.firebase.auth.PhoneAuthCredential
import kotlinx.coroutines.launch
import com.google.firebase.auth.PhoneAuthProvider // THÊM DÒNG NÀY NẾU CHƯA CÓ

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: UserProfile) : AuthState()
    data class Error(val message: String) : AuthState()
    data class EmailVerificationNeeded(val email: String) : AuthState()
    object EmailVerified : AuthState()
}

class AuthViewModel(private val repo: AuthRepository) : ViewModel() {

    private val _authState = MutableLiveData<AuthState>(AuthState.Idle)
    val authState: LiveData<AuthState> = _authState

    fun login(email: String, password: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.login(email, password)
            if (res.isSuccess) {
                _authState.value = AuthState.Success(res.getOrThrow())
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Lỗi đăng nhập")
            }
        }
    }

    fun register(name: String?, email: String, password: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.register(email, password, name)
            if (res.isSuccess) {
                // gửi email xác thực
                val sendRes = repo.sendEmailVerification()
                if (sendRes.isSuccess) {
                    _authState.value = AuthState.EmailVerificationNeeded(email)
                } else {
                    _authState.value = AuthState.Error(sendRes.exceptionOrNull()?.message ?: "Gửi email xác thực thất bại")
                }
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Lỗi đăng ký")
            }
        }
    }

    fun checkEmailVerified() {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.isEmailVerified()
            if (res.isSuccess) {
                val verified = res.getOrThrow()
                if (verified) {
                    _authState.value = AuthState.EmailVerified
                } else {
                    _authState.value = AuthState.Error("Email chưa được xác thực")
                }
            } else {
                _authState.value = AuthState.Error(
                    res.exceptionOrNull()?.message ?: "Lỗi kiểm tra xác thực"
                )
            }
        }
    }


    fun signInWithCredential(credential: PhoneAuthCredential) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.signInWithCredential(credential)
            if (res.isSuccess) {
                _authState.value = AuthState.Success(res.getOrThrow())
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Xác thực OTP thất bại")
            }
        }
    }

    fun verifyOtp(verificationId: String, code: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            try {
                val credential = PhoneAuthProvider.getCredential(verificationId, code)
                val res = repo.signInWithCredential(credential)
                if (res.isSuccess) {
                    _authState.value = AuthState.Success(res.getOrThrow())
                } else {
                    _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Xác thực OTP thất bại")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Lỗi")
            }
        }
    }

    fun verifyOtpAndLink(verificationId: String, code: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            try {
                val credential = PhoneAuthProvider.getCredential(verificationId, code)
                val res = repo.linkPhoneToCurrentUser(credential)

                if (res.isSuccess) {
                    _authState.value = AuthState.Success(res.getOrThrow())
                } else {
                    _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Liên kết số điện thoại thất bại")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Lỗi")
            }
        }
    }

    fun resetState() {
        _authState.value = AuthState.Idle
    }
    fun linkPhoneCredential(credential: PhoneAuthCredential) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.linkPhoneToCurrentUser(credential)
            if (res.isSuccess) {
                _authState.value = AuthState.Success(res.getOrThrow())
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Liên kết số điện thoại thất bại")
            }
        }
    }
    // Mới: Link email vào user hiện tại
    fun linkEmail(email: String, password: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.linkEmailToCurrentUser(email, password)
            if (res.isSuccess) {
                _authState.value = AuthState.Success(res.getOrThrow())
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Liên kết email thất bại")
            }
        }
    }
}
class AuthViewModelFactory(private val repo: AuthRepository) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AuthViewModel::class.java)) {
            return AuthViewModel(repo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}