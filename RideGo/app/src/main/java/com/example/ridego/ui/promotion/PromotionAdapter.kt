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
            tvTitle.text = item.code // Use code as primary title
            tvDesc.text = item.description
            tvCode.text = item.id.takeLast(6).uppercase() // Show ID snippet or code again
            tvExpiry.text = "HSD: ${item.expiryDate.split("T")[0]}"
            
            val minOrderStr = if (item.minOrderValue > 0) "Đơn từ ${(item.minOrderValue/1000).toInt()}k" else "Mọi đơn"
            val maxDiscountStr = if (item.maxDiscount > 0) "Tối đa ${(item.maxDiscount/1000).toInt()}k" else ""
            tvDesc.text = "${item.description}\n$minOrderStr $maxDiscountStr".trim()

            tvDiscountAmount.text = if (item.type == "PERCENT") {
                "Giảm\n${item.value.toInt()}%"
            } else {
                "Giảm\n${(item.value / 1000).toInt()}k"
            }

            btnAction.text = if (item.isUsed) "Đã sử dụng" else "Dùng ngay"
            btnAction.isEnabled = !item.isUsed
            
            btnAction.setOnClickListener {
                onUseClick?.invoke(item)
            }
        }
    }

    private var onUseClick: ((Promotion) -> Unit)? = null
    fun setOnUseClickListener(listener: (Promotion) -> Unit) {
        onUseClick = listener
    }

    override fun getItemCount() = list.size
}