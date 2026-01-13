package com.example.ridego.ui.legal

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R

data class FaqItem(val question: String, val answer: String, var isExpanded: Boolean = false)

class FaqAdapter(private val faqList: List<FaqItem>) :
    RecyclerView.Adapter<FaqAdapter.FaqViewHolder>() {

    inner class FaqViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvQuestion: TextView = itemView.findViewById(R.id.tvQuestion)
        val tvAnswer: TextView = itemView.findViewById(R.id.tvAnswer)
        val imgExpand: ImageView = itemView.findViewById(R.id.imgExpand)
        val layoutAnswer: LinearLayout = itemView.findViewById(R.id.layoutAnswer)
        val layoutHeader: LinearLayout = itemView.findViewById(R.id.layoutHeader)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FaqViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_faq, parent, false)
        return FaqViewHolder(view)
    }

    override fun onBindViewHolder(holder: FaqViewHolder, position: Int) {
        val item = faqList[position]

        holder.tvQuestion.text = item.question
        holder.tvAnswer.text = item.answer

        // Handle Expand/Collapse
        val isExpanded = item.isExpanded
        holder.layoutAnswer.visibility = if (isExpanded) View.VISIBLE else View.GONE
        holder.imgExpand.rotation = if (isExpanded) 90f else 0f

        holder.layoutHeader.setOnClickListener {
            item.isExpanded = !item.isExpanded
            notifyItemChanged(position)
        }
    }

    override fun getItemCount(): Int = faqList.size
}
