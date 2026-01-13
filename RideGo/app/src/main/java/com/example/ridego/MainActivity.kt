package com.example.ridego

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Initialize Global Socket Connection
        com.example.ridego.data.socket.SocketManager.connect()
        setupNotificationListener()
    }

    private fun setupNotificationListener() {
        val onNotification = io.socket.emitter.Emitter.Listener { args ->
            if (args.isEmpty()) return@Listener
            
            try {
                val data = args[0]
                val json = if (data is org.json.JSONObject) data else org.json.JSONObject(data.toString())
                val message = json.optString("message")
                val title = json.optString("title", "Thông báo")

                runOnUiThread {
                    androidx.appcompat.app.AlertDialog.Builder(this)
                        .setTitle(title)
                        .setMessage(message)
                        .setPositiveButton("OK", null)
                        .setIcon(R.mipmap.ic_launcher) // Use app icon or null
                        .show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        
        com.example.ridego.data.socket.SocketManager.onEvent("server_notification", onNotification)
    }

    override fun onDestroy() {
        super.onDestroy()
        // Optional: Disconnect if you want socket only alive with MainActivity, 
        // but typically we keep it alive for background services vs this UI listener.
        // com.example.ridego.data.socket.SocketManager.disconnect()
    }
}