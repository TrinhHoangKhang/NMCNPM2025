package com.example.ridego.data.model

import com.google.gson.annotations.SerializedName

data class ChatCommandResponse(
    val success: Boolean,
    @SerializedName("response_type") val responseType: String,
    val message: String,
    val data: CommandData?
)

data class CommandData(
    val intent: String,
    val steps: List<CommandStep>
)

data class CommandStep(
    val cmd: String,
    val value: String?,
    val lat: Double?,
    val lng: Double?
)
