package com.example.ridego.data.model

data class ChatRequest(
    val text: String,
    val userLocation: Map<String, Double>? = null
)
