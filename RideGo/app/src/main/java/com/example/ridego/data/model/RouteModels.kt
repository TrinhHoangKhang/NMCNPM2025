package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

// --- REQUEST (Gửi đi) ---
data class TripRequest(
    @SerializedName("pickupLocation") val pickupLocation: LocationData,
    @SerializedName("dropoffLocation") val dropoffLocation: LocationData,
    @SerializedName("vehicleType") val vehicleType: String,
    @SerializedName("paymentMethod") val paymentMethod: String,
    val distance: Double,
    val fare: Double
)

data class LocationData(
    val address: String,
    val lat: Double,
    val lng: Double
)

// --- RESPONSE (Nhận về - ĐÃ SỬA ĐỂ BẮT MỌI TRƯỜNG HỢP) ---
data class TripResponse(
    val success: Boolean?,
    val message: String?,

    // Trường hợp 1: ID nằm ngay ngoài (Root)
    @SerializedName("tripId") val rootTripId: String?,
    @SerializedName("_id") val rootMongoId: String?,
    @SerializedName("id") val rootSimpleId: String?,

    // Trường hợp 2: ID nằm trong object "data" (Khả năng cao là cái này)
    val data: TripDataContainer?
)

data class TripDataContainer(
    @SerializedName("tripId") val tripId: String?,
    @SerializedName("_id") val mongoId: String?,
    @SerializedName("id") val simpleId: String?,
    val status: String?
)

// ... (Các class RouteRequest, RouteResponse... giữ nguyên như cũ)
data class RouteRequest(
    val origin: String,
    val destination: String,
    val vehicleType: String
)
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
    val value: Double // GraphHopper returns floating meters/seconds; use Double to avoid parse errors
)