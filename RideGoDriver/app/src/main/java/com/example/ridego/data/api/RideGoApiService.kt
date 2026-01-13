package com.example.ridego.data.api

import com.example.ridego.model.LocationData
import com.example.ridego.model.TripResponse
import retrofit2.Call
import retrofit2.http.*

interface RideGoApiService {

    @GET("api/trips/available")
    fun getAvailableTrips(): Call<TripResponse>

    @PATCH("api/trips/{id}/accept")
    fun acceptTrip(@Path("id") tripId: String): Call<TripResponse>

    @PATCH("api/trips/{id}/pickup")
    fun pickupPassenger(@Path("id") tripId: String): Call<TripResponse>

    @PATCH("api/trips/{id}/complete")
    fun completeTrip(@Path("id") tripId: String): Call<TripResponse>

    @PATCH("api/drivers/location")
    fun updateLocation(@Body location: LocationData): Call<Void>

    @PATCH("api/drivers/status")
    fun updateStatus(@Body status: Map<String, Boolean>): Call<Void>

    @GET("api/trips/driver/history")
    fun getDriverHistory(): Call<TripResponse>
}