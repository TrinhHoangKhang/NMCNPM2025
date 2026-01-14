package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

data class ConversationResponse(
    @SerializedName("partnerId")
    val partnerId: String,
    
    @SerializedName("partnerName")
    val partnerName: String,
    
    @SerializedName("lastMessage")
    val lastMessage: String,
    
    @SerializedName("lastMessageTime")
    val lastMessageTime: String,
    
    @SerializedName("avatar")
    val avatar: String? = null
)
