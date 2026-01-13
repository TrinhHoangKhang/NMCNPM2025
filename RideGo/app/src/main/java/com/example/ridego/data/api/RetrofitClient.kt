package com.example.ridego.data.api

import com.example.ridego.data.Config
import com.google.android.gms.tasks.Tasks
import com.google.firebase.auth.FirebaseAuth
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // 1. Gọi thẳng vào Config để lấy URL tự động (Code của bạn)
    private val BASE_URL = Config.BASE_URL

    // 2. Cấu hình OkHttpClient để tự động thêm Token (Sửa lỗi 401)
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val originalRequest = chain.request()
            val builder = originalRequest.newBuilder()

            // Lấy User hiện tại từ Firebase
            val user = FirebaseAuth.getInstance().currentUser

            if (user != null) {
                try {
                    // Lấy Token đồng bộ (Tasks.await bắt buộc chờ lấy xong mới gửi request)
                    val task = user.getIdToken(false)
                    val result = Tasks.await(task)
                    val token = result.token

                    // Kẹp Token vào Header "Authorization"
                    if (!token.isNullOrEmpty()) {
                        builder.addHeader("Authorization", "Bearer $token")
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            chain.proceed(builder.build())
        }
        .build()

    // 3. Khởi tạo Retrofit
    val instance: RideGoApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient) // <--- QUAN TRỌNG: Dòng này giúp vượt qua bảo mật Server
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RideGoApiService::class.java)
        // Lưu ý: Nếu tên file Interface của bạn là RideGoApiService thì sửa dòng trên thành RideGoApiService::class.java
    }
}