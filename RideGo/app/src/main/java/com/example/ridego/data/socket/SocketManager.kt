package com.example.ridego.data.socket

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException
import com.example.ridego.data.Config

object SocketManager {
    private var mSocket: Socket? = null
    private val SOCKET_URL = Config.BASE_URL

    // 1. Kết nối với Server
    fun connect() {
        try {
            mSocket = IO.socket(SOCKET_URL)
            mSocket?.connect()
            Log.d("SocketManager", "Đang kết nối tới $SOCKET_URL")

            // Lắng nghe sự kiện kết nối thành công
            mSocket?.on(Socket.EVENT_CONNECT) {
                Log.d("SocketManager", "Đã kết nối thành công!")
            }
        } catch (e: URISyntaxException) {
            Log.e("SocketManager", "Lỗi URL Socket: ${e.message}")
        }
    }

    // 2. Ngắt kết nối (khi thoát app)
    fun disconnect() {
        mSocket?.disconnect()
        mSocket?.off()
    }

    // 3. Lắng nghe tin báo "Tài xế đã nhận chuyến"
    fun onTripAccepted(listener: (JSONObject) -> Unit) {
        mSocket?.on("trip_accepted") { args ->
            if (args.isNotEmpty()) {
                val data = args[0] as JSONObject
                listener(data)
            }
        }
    }

    // Gửi sự kiện lên server (nếu cần)
    fun emit(event: String, data: JSONObject) {
        mSocket?.emit(event, data)
    }
}