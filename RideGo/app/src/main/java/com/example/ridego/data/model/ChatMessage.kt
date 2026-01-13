package com.example.ridego.data.model

data class ChatMessage(
    val message: String,
    val isUser: Boolean, // true = User, false = Bot
    val timestamp: Long = System.currentTimeMillis()
)
