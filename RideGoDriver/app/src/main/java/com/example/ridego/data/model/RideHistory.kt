package com.example.ridego.model

data class RideHistory(
    val serviceName: String, // Ví dụ: RideGo Car, RideGo Bike
    val price: String,       // Ví dụ: 45.000đ
    val status: String,      // Ví dụ: Hoàn thành
    val pickupAddress: String,
    val dropoffAddress: String,
    val date: String,        // 15/11/2024
    val time: String,        // 14:30
    val distance: String,    // 8.5 km
    val duration: String,    // 25 phút
    val driverName: String,
    val rating: Float,
    val isCar: Boolean       // True = Ô tô, False = Xe máy (để đổi icon)
)