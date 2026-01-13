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

    @GET("api/trips/history")
    fun getTripHistory(): Call<List<RideHistory>>
    
    @POST("api/trips/estimate")
    fun estimateTrip(@Body request: TripEstimateRequest): Call<TripEstimateResponse>

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

    @GET("api/trips/{id}")
    fun getTripDetails(@Path("id") id: String): Call<TripResponse>

    @GET("api/trips/current")
    fun getCurrentTrip(): Call<TripResponse>

    @POST("api/trips/{id}/pay")
    fun submitPayment(@Path("id") id: String, @Body request: PaymentRequest): Call<TripResponse>
}

// --- NẾU THẤY object RetrofitClient Ở ĐÂY THÌ XÓA NÓ ĐI NHÉ! ---