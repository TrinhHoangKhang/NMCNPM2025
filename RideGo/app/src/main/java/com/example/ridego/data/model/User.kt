package com.example.ridego.data.model

data class User(
    val _id: String,
    val name: String,
    val email: String,
    val role: String,
    val phone: String? = null,
    val token: String? = null
)