package com.example.ridego.ui.promotion

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.databinding.ItemPromotionBinding
import com.example.ridego.data.model.Promotion

class PromotionAdapter(private val list: List<Promotion>) :
    RecyclerView.Adapter<PromotionAdapter.PromotionViewHolder>() {

    inner class PromotionViewHolder(val binding: ItemPromotionBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PromotionViewHolder {
        val binding = ItemPromotionBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return PromotionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PromotionViewHolder, position: Int) {
        val item = list[position]
        holder.binding.apply {
            tvTitle.text = item.title
            tvDesc.text = item.description
            tvCode.text = item.code
            tvExpiry.text = "HSD: ${item.expiryDate}"
            tvDiscountAmount.text = item.discountAmount
            // Bạn có thể xử lý sự kiện click nút copy hoặc nút sử dụng ở đây
        }
    }

    override fun getItemCount() = list.size
}