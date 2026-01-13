package com.example.ridego.data.api

import com.example.ridego.data.model.*
import retrofit2.Call
import retrofit2.http.*

// CHỈ GIỮ LẠI INTERFACE NÀY
interface RideGoApiService {

    @GET("api/discounts")
    fun getDiscounts(): Call<List<Promotion>> // SỬA: Chấp nhận Array [] thay vì Object {}

    @POST("api/discounts/claim")
    fun claimDiscount(@Body request: ClaimDiscountRequest): Call<ClaimDiscountResponse>

    @POST("api/maps/calculate-route")
    fun calculateRoute(@Body request: RouteRequest): Call<RouteResponse>

    @POST("api/trips/request")
    fun createTrip(@Body request: TripRequest): Call<TripResponse>

    @POST("api/ai/query")
    fun chatQuery(@Body request: ChatRequest): Call<ChatResponse>

    @POST("api/ai/command")
    fun chatCommand(@Body request: ChatRequest): Call<ChatCommandResponse>

    @PATCH("api/trips/cancel")
    fun cancelTrip(@Body request: CancelTripRequest): Call<TripResponse>
}

// --- NẾU THẤY object RetrofitClient Ở ĐÂY THÌ XÓA NÓ ĐI NHÉ! ---