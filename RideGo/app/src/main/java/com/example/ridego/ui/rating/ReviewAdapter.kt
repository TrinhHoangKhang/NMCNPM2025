package com.example.ridego.ui.rating

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.databinding.ItemReviewBinding

class ReviewAdapter(
    private val reviews: List<ReviewItem>,
    private val onHelpfulClick: (String, Boolean) -> Unit
) : RecyclerView.Adapter<ReviewAdapter.ReviewViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReviewViewHolder {
        val binding = ItemReviewBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ReviewViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReviewViewHolder, position: Int) {
        holder.bind(reviews[position])
    }

    override fun getItemCount() = reviews.size

    inner class ReviewViewHolder(private val binding: ItemReviewBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(review: ReviewItem) {
            binding.apply {
                // Hiển thị sao
                tvRating.text = "★".repeat(review.rating) + "☆".repeat(5 - review.rating)
                tvRating.setTextColor(0xFFFFD700.toInt())

                tvReviewTitle.text = review.title
                tvReviewContent.text = review.content
                tvReviewDate.text = review.date
                tvHelpfulCount.text = "${review.helpful}"

                // Updated visual state for Like button
                if (review.isLiked) {
                    btnHelpful.text = "👍 Đã thích"
                    btnHelpful.setTextColor(android.graphics.Color.BLUE)
                    btnHelpful.setTypeface(null, android.graphics.Typeface.BOLD)
                } else {
                    btnHelpful.text = "👍 Có ích"
                    btnHelpful.setTextColor(android.graphics.Color.GRAY)
                    btnHelpful.setTypeface(null, android.graphics.Typeface.NORMAL)
                }
                
                btnHelpful.isEnabled = true // Always enable to allow toggle

                // Button helpful
                btnHelpful.setOnClickListener {
                    onHelpfulClick(review.id, review.isLiked)
                    btnHelpful.isEnabled = false // Temp disable to prevent spam
                }
            }
        }
    }
}
