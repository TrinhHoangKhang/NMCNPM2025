package com.example.ridego.data.api

import com.example.ridego.data.model.RouteRequest
import com.example.ridego.data.model.RouteResponse
import com.example.ridego.data.model.TripRequest
import com.example.ridego.data.model.TripResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

// CHỈ GIỮ LẠI INTERFACE NÀY
interface RideGoApiService {

    @POST("api/maps/calculate-route")
    fun calculateRoute(@Body request: RouteRequest): Call<RouteResponse>

    @POST("api/trips/request")
    fun createTrip(@Body request: TripRequest): Call<TripResponse>
}

// --- NẾU THẤY object RetrofitClient Ở ĐÂY THÌ XÓA NÓ ĐI NHÉ! ---