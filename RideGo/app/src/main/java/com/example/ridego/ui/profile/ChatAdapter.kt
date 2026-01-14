package com.example.ridego.ui.profile

import android.graphics.Color
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R
import com.example.ridego.data.model.ChatMessage

class ChatAdapter(private val messages: List<ChatMessage>) :
    RecyclerView.Adapter<ChatAdapter.ChatViewHolder>() {

    class ChatViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvMessage: TextView = view.findViewById(R.id.tvMessage)
        val layoutContainer: LinearLayout = view as LinearLayout
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chat_message, parent, false)
        return ChatViewHolder(view)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        val message = messages[position]
        holder.tvMessage.text = message.message

        if (message.isUser) {
            // User message: Align Right, Blue Background, White Text
            holder.layoutContainer.gravity = Gravity.END
            holder.tvMessage.setBackgroundResource(R.drawable.bg_chat_bubble_user)
            holder.tvMessage.setTextColor(Color.WHITE)
        } else {
            // Bot/Partner message: Align Left, Gray Background, Black Text
            holder.layoutContainer.gravity = Gravity.START
            holder.tvMessage.setBackgroundResource(R.drawable.bg_chat_bubble_bot)
            holder.tvMessage.setTextColor(Color.BLACK)
        }
    }

    override fun getItemCount() = messages.size
}
