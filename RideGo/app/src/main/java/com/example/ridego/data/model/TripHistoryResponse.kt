package com.example.ridego.data.model

data class TripHistoryResponse(
    val id: String,
    val riderId: String,
    val driverId: String?,
    val pickup: LocationInfo?,
    val destination: LocationInfo?,
    val pickupLocation: LocationInfo?,
    val dropoffLocation: LocationInfo?,
    val vehicleType: String,
    val fare: Double,
    val distance: Double,
    val duration: Double,
    val status: String,
    val createdAt: String,
    val completedAt: String?,
    val paymentMethod: String,
    val paymentStatus: String,
    val ratingDriver: Float?,
    val ratingTrip: Float?,
    val ratingComment: String?
)

data class LocationInfo(
    val lat: Double,
    val lng: Double,
    val address: String?
)
