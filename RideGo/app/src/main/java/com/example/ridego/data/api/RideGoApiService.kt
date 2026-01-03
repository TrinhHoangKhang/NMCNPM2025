package com.example.ridego.data.api

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

import com.example.ridego.data.model.User
import com.example.ridego.data.model.Location

interface RideGoApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("api/trips/book")
    suspend fun bookRide(@Body request: BookRideRequest): Response<TripResponse>

    @GET("api/trips/history/{userId}")
    suspend fun getTripHistory(@Path("userId") userId: String): Response<List<TripResponse>>
}

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String, val phone: String, val role: String)
data class LoginResponse(val token: String, val user: User)
data class RegisterResponse(val token: String, val user: User)
data class BookRideRequest(val pickup: Location, val dropoff: Location, val vehicleType: String, val price: Double)
data class TripResponse(val _id: String, val status: String, val pickup: Location, val dropoff: Location, val price: Double)