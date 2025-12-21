package com.example.ridego.data.model

data class Promotion(
    val title: String,
    val description: String,
    val code: String,
    val expiryDate: String,
    val discountAmount: String, // Ví dụ: 50% hoặc 20.000đ
    val isUsed: Boolean = false
)