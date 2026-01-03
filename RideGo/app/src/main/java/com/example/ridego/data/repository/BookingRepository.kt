package com.example.ridego.data.repository

import com.example.ridego.data.api.BookRideRequest
import com.example.ridego.data.api.RideGoApiService
import com.example.ridego.data.api.TripResponse
import com.example.ridego.data.model.Location
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BookingRepository @Inject constructor(
    private val apiService: RideGoApiService
) {
    suspend fun bookRide(pickup: Location, dropoff: Location, vehicleType: String, price: Double): Result<TripResponse> {
        return try {
            val request = BookRideRequest(pickup, dropoff, vehicleType, price)
            val response = apiService.bookRide(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Booking failed: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}