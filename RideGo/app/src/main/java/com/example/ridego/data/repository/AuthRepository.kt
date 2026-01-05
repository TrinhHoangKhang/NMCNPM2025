package com.example.ridego.data.repository

import com.example.ridego.data.api.LoginRequest
import com.example.ridego.data.api.LoginResponse
import com.example.ridego.data.api.RegisterRequest
import com.example.ridego.data.api.RegisterResponse
import com.example.ridego.data.api.RideGoApiService
import javax.inject.Inject
import javax.inject.Singleton
import retrofit2.Response

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: RideGoApiService
) {
    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Login failed: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(name: String, email: String, password: String, phone: String, role: String): Result<RegisterResponse> {
         return try {
            val response = apiService.register(RegisterRequest(name, email, password, phone, role))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Register failed: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}