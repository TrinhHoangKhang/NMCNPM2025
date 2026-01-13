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
        if (mSocket?.connected() == true) return

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

    // 4. Lắng nghe tin báo "Tài xế đã nhận chuyến"
    fun onTripAccepted(listener: (JSONObject) -> Unit) {
        on("trip_accepted", listener)
    }

    // Gửi sự kiện lên server (nếu cần)
    fun emit(event: String, data: JSONObject) {
        mSocket?.emit(event, data)
    }
}