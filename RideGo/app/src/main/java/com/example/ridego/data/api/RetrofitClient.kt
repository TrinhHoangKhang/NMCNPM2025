package com.example.ridego.data.api

import com.example.ridego.data.Config // Import file Config vừa tạo
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Gọi thẳng vào Config để lấy URL tự động
    private val BASE_URL = Config.BASE_URL

    val instance: RideGoApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RideGoApiService::class.java)
    }
}