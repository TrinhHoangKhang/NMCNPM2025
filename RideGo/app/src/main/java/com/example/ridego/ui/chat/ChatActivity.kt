package com.example.ridego.ui.chat

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.data.api.RetrofitClient
import com.example.ridego.data.model.ChatHistoryItem
import com.example.ridego.data.model.ChatMessage
import com.example.ridego.data.model.SendMessageRequest
import com.example.ridego.data.socket.SocketManager
import com.example.ridego.databinding.ActivityChatBinding
import com.example.ridego.ui.profile.ChatAdapter
import com.google.firebase.auth.FirebaseAuth
import io.socket.emitter.Emitter
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChatActivity : AppCompatActivity() {

    private lateinit var binding: ActivityChatBinding
    private var partnerId: String? = null
    private val messages = mutableListOf<ChatMessage>()
    private lateinit var adapter: ChatAdapter
    private val currentUserId = FirebaseAuth.getInstance().uid

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        partnerId = intent.getStringExtra("PARTNER_ID")
        if (partnerId.isNullOrEmpty()) {
            Toast.makeText(this, "Error: No user to chat with", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setupRecyclerView()
        setupListeners()
        loadHistory()
        setupSocketListener()
    }

    private fun setupRecyclerView() {
        adapter = ChatAdapter(messages)
        binding.rvMessages.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        binding.rvMessages.adapter = adapter
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener { finish() }
        
        binding.btnSend.setOnClickListener {
            val text = binding.etMessage.text.toString().trim()
            if (text.isNotEmpty()) {
                sendMessage(text)
            }
        }
    }

    private fun loadHistory() {
        if (partnerId == null) return
        
        RetrofitClient.instance.getChatHistory(partnerId!!).enqueue(object : Callback<List<ChatHistoryItem>> {
            override fun onResponse(call: Call<List<ChatHistoryItem>>, response: Response<List<ChatHistoryItem>>) {
                if (response.isSuccessful && response.body() != null) {
                    val history = response.body()!!
                    messages.clear()
                    
                    history.forEach { item ->
                        val isMe = item.senderId == currentUserId
                        messages.add(ChatMessage(item.text, isMe))
                    }
                    adapter.notifyDataSetChanged()
                    scrollToBottom()
                }
            }

            override fun onFailure(call: Call<List<ChatHistoryItem>>, t: Throwable) {
                Toast.makeText(this@ChatActivity, "Failed to load history", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun sendMessage(text: String) {
        if (partnerId == null) return

        messages.add(ChatMessage(text, true))
        adapter.notifyItemInserted(messages.size - 1)
        scrollToBottom()
        binding.etMessage.text.clear()

        val request = SendMessageRequest(partnerId!!, text)
        RetrofitClient.instance.sendChatMessage(request).enqueue(object : Callback<ChatHistoryItem> {
            override fun onResponse(call: Call<ChatHistoryItem>, response: Response<ChatHistoryItem>) {
                if (!response.isSuccessful) {
                    Toast.makeText(this@ChatActivity, "Failed to send", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ChatHistoryItem>, t: Throwable) {
                Toast.makeText(this@ChatActivity, "Error sending", Toast.LENGTH_SHORT).show()
            }
        })
    }
    
    private val onNewMessage = Emitter.Listener { args ->
        if (args.isNotEmpty()) {
            val data = args[0]
            val json = if (data is String) JSONObject(data) else data as JSONObject
            
            try {
                val senderId = json.optString("senderId")
                val text = json.optString("text")
                
                if (senderId == partnerId) {
                    runOnUiThread {
                        messages.add(ChatMessage(text, false))
                        adapter.notifyItemInserted(messages.size - 1)
                        scrollToBottom()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun setupSocketListener() {
        SocketManager.onEvent("receive_message", onNewMessage)
    }

    override fun onDestroy() {
        super.onDestroy()
        SocketManager.offEvent("receive_message", onNewMessage)
    }

    private fun scrollToBottom() {
        if (messages.isNotEmpty()) {
            binding.rvMessages.smoothScrollToPosition(messages.size - 1)
        }
    }
}