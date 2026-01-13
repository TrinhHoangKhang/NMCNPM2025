package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

// --- REQUEST (Gửi đi) ---
data class TripRequest(
    @SerializedName("pickupLocation") val pickupLocation: LocationData,
    @SerializedName("dropoffLocation") val dropoffLocation: LocationData,
    @SerializedName("vehicleType") val vehicleType: String,
    @SerializedName("paymentMethod") val paymentMethod: String,
    val distance: Double,
    val fare: Double,
    val discountId: String? = null
)

data class TripEstimateRequest(
    val pickupLocation: LocationData,
    val dropoffLocation: LocationData,
    val vehicleType: String,
    val discountId: String? = null
)

data class TripEstimateResponse(
    val fare: Double,
    val originalFare: Double,
    val distance: Double,
    val duration: String,
    val discountAmount: Double,
    val discountApplied: Boolean
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
    val status: String?,
    val driverId: String? = null,
    val vehicleType: String? = null,
    val pickupLocation: LocationData? = null,
    val dropoffLocation: LocationData? = null,
    val fare: Double = 0.0,
    val distance: Double = 0.0,
    val duration: String? = null
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
    val value: Int
)

// --- DISCOUNT MODELS (Moved back here to avoid duplicate files) ---
data class ClaimDiscountRequest(
    val code: String
)

data class DiscountsResponse(
    val success: Boolean,
    val discounts: List<Promotion>
)

data class ClaimDiscountResponse(
    val message: String,
    val discount: Promotion?
)