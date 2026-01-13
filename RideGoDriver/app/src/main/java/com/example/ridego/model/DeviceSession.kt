package com.example.ridego.model

import com.google.firebase.Timestamp

data class DeviceSession(
    val sessionId: String = "",
    val deviceName: String = "",
    val deviceModel: String = "",
    val deviceOs: String = "",
    val appVersion: String = "",
    val ipAddress: String = "",
    val location: String = "",
    val lastActive: Timestamp? = null,
    val loginTime: Timestamp? = null,
    val isCurrentDevice: Boolean = false
) {
    companion object {
        fun fromMap(sessionId: String, map: Map<String, Any?>): DeviceSession {
            return DeviceSession(
                sessionId = sessionId,
                deviceName = map["deviceName"] as? String ?: "Thiết bị không xác định",
                deviceModel = map["deviceModel"] as? String ?: "",
                deviceOs = map["deviceOs"] as? String ?: "Android",
                appVersion = map["appVersion"] as? String ?: "",
                ipAddress = map["ipAddress"] as? String ?: "",
                location = map["location"] as? String ?: "",
                lastActive = map["lastActive"] as? Timestamp,
                loginTime = map["loginTime"] as? Timestamp,
                isCurrentDevice = map["isCurrentDevice"] as? Boolean ?: false
            )
        }
    }

    fun toMap(): Map<String, Any?> {
        return mapOf(
            "deviceName" to deviceName,
            "deviceModel" to deviceModel,
            "deviceOs" to deviceOs,
            "appVersion" to appVersion,
            "ipAddress" to ipAddress,
            "location" to location,
            "lastActive" to lastActive,
            "loginTime" to loginTime,
            "isCurrentDevice" to isCurrentDevice
        )
    }
}
