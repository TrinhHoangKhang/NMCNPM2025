package com.example.ridego.data.api

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocketManager @Inject constructor() {

    private var socket: Socket? = null
    private val TAG = "SocketManager"

    fun connect(tokens: String? = null) {
        try {
            val options = IO.Options()
            // Ensure this matches your backend URL. 10.0.2.2 is localhost for Emulator.
            // If tokens are implemented, add auth here:
            // options.auth = mapOf("token" to tokens)
            
            socket = IO.socket("http://10.0.2.2:3001", options)
            
            socket?.on(Socket.EVENT_CONNECT) {
                Log.d(TAG, "Socket Connected")
            }
            
            socket?.on(Socket.EVENT_DISCONNECT) {
                Log.d(TAG, "Socket Disconnected")
            }
            
            socket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
                Log.e(TAG, "Socket Connection Error: ${args[0]}")
            }

            socket?.connect()
        } catch (e: URISyntaxException) {
            Log.e(TAG, "Socket URI Error: ${e.message}")
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket?.off()
    }

    fun emit(event: String, data: JSONObject) {
        socket?.emit(event, data)
    }

    fun on(event: String, listener: (Array<Any>) -> Unit) {
        socket?.on(event) { args ->
            listener(args)
        }
    }
    
    fun isConnected(): Boolean {
        return socket?.connected() ?: false
    }
}