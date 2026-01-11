package com.example.ridego.ui.splash

import android.os.Handler
import android.os.Looper
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class SplashViewModel : ViewModel() {

    private val _navigateToNextScreen = MutableLiveData<Boolean>()
    val navigateToNextScreen: LiveData<Boolean> = _navigateToNextScreen

    fun startLoading() {
        // Giả lập load data hoặc kiểm tra đăng nhập trong 3 giây
        Handler(Looper.getMainLooper()).postDelayed({
            _navigateToNextScreen.value = true
        }, 3000)
    }
}