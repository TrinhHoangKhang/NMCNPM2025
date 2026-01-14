package com.example.ridego.data.model

data class Promotion(
    val id: String,
    val code: String,
    val description: String,
    val type: String, // PERCENT or FIXED
    val value: Double,
    val maxDiscount: Double,
    val minOrderValue: Double,
    val expiryDate: String,
    val isActive: Boolean = true,
    val count: Int = 0,
    val isUsed: Boolean = false
)