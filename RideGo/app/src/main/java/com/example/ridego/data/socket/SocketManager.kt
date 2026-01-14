package com.example.ridego.data.socket

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException
import com.example.ridego.data.Config
import io.socket.emitter.Emitter

object SocketManager {
    private var mSocket: Socket? = null
    private val SOCKET_URL = Config.BASE_URL.trimEnd('/')

    // 1. Kết nối với Server
    fun connect() {
        if (mSocket?.connected() == true) return

        val user = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
        if (user != null) {
            user.getIdToken(false).addOnSuccessListener { result ->
                val token = result.token
                connectWithToken(token)
            }.addOnFailureListener {
                Log.e("SocketManager", "Failed to get token: ${it.message}")
                connectWithToken(null) // Try connecting anyway, though server might reject
            }
        } else {
             Log.w("SocketManager", "User not logged in.")
             connectWithToken(null)
        }
    }

    private fun connectWithToken(token: String?) {
        try {
            val opts = IO.Options()
            if (token != null) {
                // Construct Auth Map
                val authMap = java.util.HashMap<String, String>()
                authMap["token"] = token
                opts.auth = authMap
            }
            
            mSocket = IO.socket(SOCKET_URL, opts)
            mSocket?.connect()
            Log.d("SocketManager", "Connecting to $SOCKET_URL with token? ${token != null}")

            // Lắng nghe sự kiện kết nối thành công
            mSocket?.on(Socket.EVENT_CONNECT) {
                Log.d("SocketManager", "Đã kết nối thành công!")
            }
            
            // Listen for errors
             mSocket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
                Log.e("SocketManager", "Connect Error: ${args.getOrElse(0) { "Unknown" }}")
            }
        } catch (e: URISyntaxException) {
            Log.e("SocketManager", "Lỗi URL Socket: ${e.message}")
        }
    }

    // 2. Ngắt kết nối (khi thoát app)
    fun disconnect() {
        mSocket?.disconnect()
        mSocket?.off()
        mSocket = null
    }

    // 3. Lắng nghe sự kiện bất kỳ
    fun on(event: String, listener: (JSONObject) -> Unit) {
        mSocket?.on(event) { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                val data = args[0] as JSONObject
                listener(data)
            }
        }
    }
    
    fun onEvent(event: String, listener: Emitter.Listener) {
        mSocket?.on(event) { args ->
            Log.d("SocketManager", "Event received: $event, Args: ${args.contentToString()}")
            listener.call(*args)
        }
    }
    
    fun offEvent(event: String, listener: Emitter.Listener) {
        mSocket?.off(event, listener)
    }

    // 4. Lắng nghe tin báo "Tài xế đã nhận chuyến"
    fun onTripAccepted(listener: (JSONObject) -> Unit) {
        on("trip_accepted", listener)
    }

    // Gửi sự kiện lên server (nếu cần)
    fun emit(event: String, data: JSONObject) {
        mSocket?.emit(event, data)
    }
}