package com.example.ridego.data.socket

import android.util.Log
import com.example.ridego.data.Config
import com.google.firebase.auth.FirebaseAuth
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

object SocketManager {
    private var mSocket: Socket? = null
    // Use Config.BASE_URL for ngrok tunnel
    private val SOCKET_URL = Config.BASE_URL

    // Hàm connect KHÔNG nhận tham số (tự lấy Token)
    fun connect() {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            Log.e("SocketManager", "Chưa đăng nhập Firebase, không thể kết nối Socket!")
            return
        }

        user.getIdToken(true).addOnSuccessListener { result ->
            val token = result.token
            if (token != null) {
                connectWithToken(token)
            }
        }.addOnFailureListener { e ->
            Log.e("SocketManager", "Lỗi lấy Token: ${e.message}")
        }
    }

    private fun connectWithToken(token: String) {
        try {
            val options = IO.Options().apply {
                auth = mapOf("token" to token)
                reconnection = true
                forceNew = true
            }

            mSocket = IO.socket(SOCKET_URL, options)
            mSocket?.connect()

            setupBaseListeners()

        } catch (e: Exception) {
            Log.e("SocketManager", "Lỗi khởi tạo Socket: ${e.message}")
        }
    }

    private fun setupBaseListeners() {
        mSocket?.on(Socket.EVENT_CONNECT) {
            Log.d("SocketManager", "✅ Đã kết nối Socket thành công!")
        }
        mSocket?.on(Socket.EVENT_DISCONNECT) {
            Log.d("SocketManager", "❌ Đã ngắt kết nối!")
        }
        mSocket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
            Log.e("SocketManager", "⚠️ Lỗi kết nối: ${args.getOrNull(0)}")
        }
    }

    fun disconnect() {
        mSocket?.disconnect()
        mSocket?.off()
    }

    // --- CÁC HÀM SỰ KIỆN ---

    fun onNewRideRequest(listener: (JSONObject) -> Unit) {
        mSocket?.on("new_ride_request") { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                listener(args[0] as JSONObject)
            }
        }
    }

    // ĐÃ THÊM LẠI HÀM NÀY (Để sửa lỗi Unresolved reference)
    fun onRideCanceled(listener: (JSONObject) -> Unit) {
        mSocket?.on("ride_canceled_by_user") { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                listener(args[0] as JSONObject)
            }
        }
    }

    fun emitLocationUpdate(driverId: String, lat: Double, lng: Double, heading: Float) {
        val data = JSONObject().apply {
            put("driverId", driverId)
            put("lat", lat)
            put("lng", lng)
            put("heading", heading)
        }
        mSocket?.emit("update_driver_location", data)
        mSocket?.emit("update_location", data)
    }

    fun emitAcceptRide(driverId: String, tripId: String) {
        val data = JSONObject().apply {
            put("driverId", driverId)
            put("tripId", tripId)
        }
        mSocket?.emit("driver_accept_ride", data)
    }

    fun emitRejectRide(driverId: String, tripId: String) {
        val data = JSONObject().apply {
            put("driverId", driverId)
            put("tripId", tripId)
        }
        mSocket?.emit("driver_reject_ride", data)
    }
}