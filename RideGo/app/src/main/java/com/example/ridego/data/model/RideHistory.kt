package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

data class RideHistory(
    @SerializedName("id", alternate = ["_id"])
    val id: String,
    
    val pickupLocation: LocationData?,
    val dropoffLocation: LocationData?,
    
    val fare: Double,
    val status: String,
    val createdAt: String,
    
    @SerializedName("vehicleType")
    val vehicleType: String,
    
    val driverName: String? = null,
    val ratingTrip: Float? = null,
    
    val distance: Double = 0.0,
    val duration: String? = "0"
)