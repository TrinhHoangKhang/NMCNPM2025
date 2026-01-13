package com.example.ridego.data.model

data class ChatHistoryItem(
    val id: String,
    val senderId: String,
    val text: String,
    val createdAt: String,
    val read: Boolean,
    val conversationId: String
)
