package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

data class CancelTripRequest(
    @SerializedName("tripId") val tripId: String,
    @SerializedName("reason") val reason: String = "User cancelled"
)
