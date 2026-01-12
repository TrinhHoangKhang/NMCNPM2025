package com.example.ridego.data.model

data class RouteRequest(
    val origin: String,
    val destination: String
)

data class RouteResponse(
    val success: Boolean,
    val data: RouteData?
)

data class RouteData(
    val distance: ValueText,
    val duration: ValueText
)

data class ValueText(
    val text: String,
    val value: Int
)

data class TripRequest(
    val riderId: String,      // ID của người đặt (Lấy từ Firebase Auth)
    val pickup: LocationData, // Điểm đón
    val dropoff: LocationData,// Điểm đến
    val vehicleType: String,  // Loại xe: "RideGo Bike", "RideGo Car"...
    val distance: Double,     // Khoảng cách (km)
    val fare: Double          // Giá tiền (đ)
)

data class LocationData(
    val address: String,
    val lat: Double,
    val lng: Double
)

// Server trả về kết quả tạo chuyến thành công
data class TripResponse(
    val success: Boolean,
    val tripId: String?,
    val message: String?
)