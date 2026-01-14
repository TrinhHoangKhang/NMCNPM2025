package com.example.ridego.ui.chat

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import java.text.SimpleDateFormat
import java.util.*

data class Conversation(
    val id: String,
    val name: String,
    val lastMessage: String,
    val time: String,
    val avatar: Int = R.drawable.ic_user_avatar
)

class ChatListActivity : AppCompatActivity() {

    private lateinit var rvConversationList: RecyclerView
    private lateinit var adapter: ConversationAdapter
    private val conversations = mutableListOf<Conversation>()
    private val db = FirebaseFirestore.getInstance()
    private val currentUser = FirebaseAuth.getInstance().currentUser

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_list)

        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowTitleEnabled(false)
        toolbar.setNavigationOnClickListener { finish() }

        rvConversationList = findViewById(R.id.rvConversationList)
        rvConversationList.layoutManager = LinearLayoutManager(this)
        
        adapter = ConversationAdapter(conversations) { conversation ->
            val intent = Intent(this, ChatActivity::class.java)
            intent.putExtra("PARTNER_ID", conversation.id)
            intent.putExtra("PARTNER_NAME", conversation.name)
            startActivity(intent)
        }
        rvConversationList.adapter = adapter
        
        loadConversations()
    }
    
    private fun loadConversations() {
        com.example.ridego.data.api.RetrofitClient.instance.getConversations().enqueue(object : retrofit2.Callback<List<com.example.ridego.data.model.ConversationResponse>> {
             override fun onResponse(call: retrofit2.Call<List<com.example.ridego.data.model.ConversationResponse>>, response: retrofit2.Response<List<com.example.ridego.data.model.ConversationResponse>>) {
                 if (response.isSuccessful && response.body() != null) {
                     conversations.clear()
                     val list = response.body()!!
                     for (item in list) {
                         conversations.add(
                             Conversation(
                                 item.partnerId,
                                 item.partnerName,
                                 item.lastMessage,
                                 formatTime(item.lastMessageTime)
                             )
                         )
                     }
                     adapter.notifyDataSetChanged()
                 }
             }

             override fun onFailure(call: retrofit2.Call<List<com.example.ridego.data.model.ConversationResponse>>, t: Throwable) {
                 // Handle failure silently or show toast
             }
        })
    }
    
    private fun formatTime(timeStr: String): String {
        // timeStr is likely ISO string or formatted. For simplicity, just return it or parse if needed.
        // If the backend returns "2023-10-10T10:00:00Z", we might want to prettify it.
        // Assuming backend returns a readable string or we just show it as is for now, 
        // as the task specifically asked to fetch from server.
        // Ideally we parse it. Let's try to parse if it looks like a long timestamp, else return it.
        return try {
            val timestamp = timeStr.toLong()
            val sdf = SimpleDateFormat("HH:mm dd/MM", Locale.getDefault())
            sdf.format(Date(timestamp))
        } catch (e: Exception) {
            timeStr // Return as is if not a long timestamp
        }
    }
}

class ConversationAdapter(
    private val items: List<Conversation>,
    private val onClick: (Conversation) -> Unit
) : RecyclerView.Adapter<ConversationAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvLastMessage: TextView = view.findViewById(R.id.tvLastMessage)
        val tvTime: TextView = view.findViewById(R.id.tvTime)
        val imgAvatar: ImageView = view.findViewById(R.id.imgAvatar)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_conversation, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.tvName.text = item.name
        holder.tvLastMessage.text = item.lastMessage
        holder.tvTime.text = item.time
        holder.imgAvatar.setImageResource(item.avatar)
        
        holder.itemView.setOnClickListener { onClick(item) }
    }

    override fun getItemCount() = items.size
}