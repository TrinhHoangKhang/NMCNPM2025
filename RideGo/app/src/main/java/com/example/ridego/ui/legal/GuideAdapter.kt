package com.example.ridego.ui.legal

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R

data class GuideItem(val step: String, val title: String, val description: String)

class GuideAdapter(private val guideList: List<GuideItem>) :
    RecyclerView.Adapter<GuideAdapter.GuideViewHolder>() {

    inner class GuideViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvStepNumber: TextView = itemView.findViewById(R.id.tvStepNumber)
        val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
        val tvDescription: TextView = itemView.findViewById(R.id.tvDescription)
        val viewLine: View = itemView.findViewById(R.id.viewLine)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GuideViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_guide_step, parent, false)
        return GuideViewHolder(view)
    }

    override fun onBindViewHolder(holder: GuideViewHolder, position: Int) {
        val item = guideList[position]

        holder.tvStepNumber.text = item.step
        holder.tvTitle.text = item.title
        holder.tvDescription.text = item.description

        // Hide line for the last item
        if (position == guideList.size - 1) {
            holder.viewLine.visibility = View.GONE
        } else {
            holder.viewLine.visibility = View.VISIBLE
        }
    }

    override fun getItemCount(): Int = guideList.size
}
