package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

data class LatLngData(
    val lat: Double,
    val lng: Double
)

data class LocationData(
    val address: String,
    val lat: Double,
    val lng: Double
)

// --- TRIP REQUEST
data class TripRequest(
    @SerializedName("pickupLocation") val pickupLocation: LocationData,
    @SerializedName("dropoffLocation") val dropoffLocation: LocationData,
    @SerializedName("vehicleType") val vehicleType: String,
    @SerializedName("paymentMethod") val paymentMethod: String,
    val distance: Double,
    val fare: Double
)

// --- TRIP RESPONSE
data class TripResponse(
    val success: Boolean?,
    val message: String?,

    // Thêm các trường này để hứng ID nếu server trả về ở lớp ngoài cùng
    @SerializedName("tripId") val rootTripId: String? = null,
    @SerializedName("_id") val rootMongoId: String? = null,
    @SerializedName("id") val rootSimpleId: String? = null,

    val data: TripDataContainer? = null
)

data class TripDataContainer(
    @SerializedName("tripId") val tripId: String?,
    @SerializedName("_id") val mongoId: String?,
    @SerializedName("id") val simpleId: String?,
    val status: String?
)

// --- ROUTE REQUEST ---
data class RouteRequest(
    val origin: String,
    val destination: String,
    val vehicleType: String
)

// --- ROUTE RESPONSE ---
data class RouteResponse(
    val success: Boolean,
    val data: RouteData?
)

data class RouteData(
    val distance: ValueText,
    val duration: ValueText,
    val geometry: GeometryData?
)

data class GeometryData(
    val type: String,
    val coordinates: String
)

data class ValueText(
    val text: String,
    val value: Int
)