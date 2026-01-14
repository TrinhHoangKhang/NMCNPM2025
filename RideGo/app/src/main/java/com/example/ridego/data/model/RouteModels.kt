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
    val status: String?,
    val driverId: String? = null,
    val vehicleType: String? = null,
    val pickupLocation: LocationData? = null,
    val dropoffLocation: LocationData? = null,
    val fare: Double = 0.0,
    val distance: Double = 0.0,
    val duration: String? = null,
    val discountAmount: Double? = 0.0
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

// --- DISCOUNT MODELS ---
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

data class PaymentRequest(
    val method: String // "CASH" or "WALLET"
)

// --- PAYMENT & RATING MODELS ---
data class PaymentQRResponse(
    val qrUrl: String,
    val amount: Double
)

data class RateTripRequest(
    val driverRating: Float,
    val tripRating: Float,
    val comment: String?
)

data class RateTripResponse(
    val success: Boolean,
    val message: String?
)