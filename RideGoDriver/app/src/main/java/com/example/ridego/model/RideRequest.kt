package com.example.ridego.model

data class RideRequest(
    val tripId: String,
    val customerName: String,
    val pickupAddress: String,
    val destinationAddress: String,
    val price: Double,
    val distance: Double
)