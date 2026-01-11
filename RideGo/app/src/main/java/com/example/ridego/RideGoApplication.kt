package com.example.ridego

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class RideGoApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
