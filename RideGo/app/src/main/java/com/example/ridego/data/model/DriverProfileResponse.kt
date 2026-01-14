package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

data class DriverProfileResponse(
    @SerializedName("_id") val id: String,
    val uid: String,
    val name: String,
    val email: String,
    val phone: String?,
    val role: String,
    val rating: Double?,
    val totalTrips: Int?,
    val vehicle: VehicleInfo?,
    val avatar: String?
)

data class VehicleInfo(
    val type: String?,
    val plate: String?,
    val color: String?
)
