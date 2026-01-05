package com.example.ridego.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ridego.data.model.User
import com.example.ridego.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repo: AuthRepository
) : ViewModel() {

    private val _authState = MutableLiveData<AuthState>(AuthState.Idle)
    val authState: LiveData<AuthState> = _authState

    fun login(email: String, password: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.login(email, password)
            if (res.isSuccess) {
                // User is inside LoginResponse
                val loginResponse = res.getOrThrow()
                _authState.value = AuthState.Success(loginResponse.user)
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Login failed")
            }
        }
    }

    fun signInWithGoogle(idToken: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val res = repo.signInWithGoogle(idToken)
            if (res.isSuccess) {
                _authState.value = AuthState.Success(res.getOrThrow())
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Lỗi đăng nhập Google")
            }
        }
    }

    fun register(name: String?, email: String, password: String, phone: String = "") {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            // Default role to 'rider'
            val res = repo.register(name, email, password, phone, "rider")
            if (res.isSuccess) {
                // Gửi email xác thực
                val sendRes = repo.sendEmailVerification()
                if (sendRes.isSuccess) {
                    _authState.value = AuthState.EmailVerificationNeeded(email)
                } else {
                    _authState.value = AuthState.Error(sendRes.exceptionOrNull()?.message ?: "Gửi email xác thực thất bại")
                }
            } else {
                _authState.value = AuthState.Error(res.exceptionOrNull()?.message ?: "Register failed")
            }
        }
    }

    fun resetState() {
        _authState.value = AuthState.Idle
    }
}