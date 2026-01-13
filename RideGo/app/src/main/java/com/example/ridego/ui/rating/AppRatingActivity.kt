package com.example.ridego.ui.rating

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.databinding.ActivityAppRatingBinding
import com.google.firebase.firestore.FirebaseFirestore

class AppRatingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAppRatingBinding
    private val db = FirebaseFirestore.getInstance()
    private var userRating = 0 // Sao người dùng hiện tại đánh giá (0-5)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAppRatingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }

        // Hiển thị dữ liệu đánh giá tổng hợp - sẽ được gọi trong loadReviews()
        // displayOverallRating()

        // Setup sao tương tác
        setupStarRating()

        // Setup nút gửi đánh giá
        binding.btnSubmitRating.setOnClickListener {
            if (userRating > 0) {
                submitRating()
            } else {
                Toast.makeText(this, "Vui lòng chọn số sao", Toast.LENGTH_SHORT).show()
            }
        }

        // Load danh sách đánh giá
        loadReviews()
    }

    private fun displayOverallRating() {
        // Mock dữ liệu - trong thực tế sẽ lấy từ Firestore
        binding.apply {
            tvOverallRating.text = "4.8"
            tvTotalReviews.text = "(45.2K đánh giá)"
            
            // Biểu đồ phân bố sao
            updateProgressBar(binding.progress5Star, 60) // 60% người đánh giá 5 sao
            updateProgressBar(binding.progress4Star, 25)
            updateProgressBar(binding.progress3Star, 10)
            updateProgressBar(binding.progress2Star, 3)
            updateProgressBar(binding.progress1Star, 2)
        }
    }

    private fun updateProgressBar(progressBar: android.widget.ProgressBar, percentage: Int) {
        progressBar.progress = percentage
    }

    private fun setupStarRating() {
        binding.apply {
            // Star 1
            star1.setOnClickListener {
                userRating = 1
                updateStarDisplay()
            }
            // Star 2
            star2.setOnClickListener {
                userRating = 2
                updateStarDisplay()
            }
            // Star 3
            star3.setOnClickListener {
                userRating = 3
                updateStarDisplay()
            }
            // Star 4
            star4.setOnClickListener {
                userRating = 4
                updateStarDisplay()
            }
            // Star 5
            star5.setOnClickListener {
                userRating = 5
                updateStarDisplay()
            }
        }
    }

    private fun updateStarDisplay() {
        binding.apply {
            star1.text = if (userRating >= 1) "★" else "☆"
            star1.setTextColor(if (userRating >= 1) 0xFFFFD700.toInt() else 0xFFCCCCCC.toInt())
            
            star2.text = if (userRating >= 2) "★" else "☆"
            star2.setTextColor(if (userRating >= 2) 0xFFFFD700.toInt() else 0xFFCCCCCC.toInt())
            
            star3.text = if (userRating >= 3) "★" else "☆"
            star3.setTextColor(if (userRating >= 3) 0xFFFFD700.toInt() else 0xFFCCCCCC.toInt())
            
            star4.text = if (userRating >= 4) "★" else "☆"
            star4.setTextColor(if (userRating >= 4) 0xFFFFD700.toInt() else 0xFFCCCCCC.toInt())
            
            star5.text = if (userRating >= 5) "★" else "☆"
            star5.setTextColor(if (userRating >= 5) 0xFFFFD700.toInt() else 0xFFCCCCCC.toInt())

            // Cập nhật text
            tvRatingTitle.text = when (userRating) {
                1 -> "Tệ"
                2 -> "Chưa tốt"
                3 -> "Bình thường"
                4 -> "Tốt"
                5 -> "Tuyệt vời! 😍"
                else -> "Chọn đánh giá của bạn"
            }
        }
    }

    private fun submitRating() {
        val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
        val userId = currentUser?.uid ?: "anonymous"
        val userName = currentUser?.displayName ?: "Người dùng ẩn danh"

        // Data to save
        val ratingData = hashMapOf(
            "userId" to userId,
            "userName" to userName,
            "rating" to userRating,
            "feedback" to binding.etFeedback.text.toString(),
            "timestamp" to System.currentTimeMillis(),
            "likedBy" to ArrayList<String>() // Initialize empty list
        )

        binding.btnSubmitRating.isEnabled = false // Prevent double click

        db.collection("app_reviews")
            .add(ratingData)
            .addOnSuccessListener {
                Toast.makeText(this, "Cảm ơn đánh giá của bạn! ⭐", Toast.LENGTH_SHORT).show()
                
                // Reset form
                userRating = 0
                updateStarDisplay()
                binding.etFeedback.setText("")
                binding.btnSubmitRating.isEnabled = true
                
                // Refresh list
                loadReviews()
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.btnSubmitRating.isEnabled = true
            }
    }

    private fun loadReviews() {
        db.collection("app_reviews")
            .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .limit(50)
            .get()
            .addOnSuccessListener { documents ->
                val reviews = ArrayList<ReviewItem>()
                var totalStars = 0
                val starCounts = IntArray(6) { 0 } // index 1..5 used
                val currentUserId = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid

                for (document in documents) {
                    val rating = document.getLong("rating")?.toInt() ?: 0
                    val feedback = document.getString("feedback") ?: ""
                    val timestamp = document.getLong("timestamp") ?: 0L
                    val name = document.getString("userName") ?: "Người dùng"
                    val helpful = document.getLong("helpful")?.toInt() ?: 0

                    if (rating in 1..5) {
                        starCounts[rating]++
                        totalStars += rating
                    }

                    val likedBy = document.get("likedBy") as? List<String> ?: emptyList()
                    val helpfulCount = likedBy.size
                    val isLiked = likedBy.contains(currentUserId)

                    // Format date
                    val dateStr = android.text.format.DateFormat.format("dd/MM/yyyy HH:mm", timestamp).toString()

                    reviews.add(ReviewItem(document.id, rating, name, feedback, dateStr, helpfulCount, isLiked))
                }

                // Update UI
                val adapter = ReviewAdapter(reviews) { reviewId, currentLikedState ->
                    toggleLike(reviewId, currentLikedState)
                }
                binding.recyclerReviews.layoutManager = LinearLayoutManager(this)
                binding.recyclerReviews.adapter = adapter

                calculateAndDisplayStats(reviews.size, totalStars, starCounts)
            }
            .addOnFailureListener {
                Toast.makeText(this, "Không thể tải đánh giá", Toast.LENGTH_SHORT).show()
            }
    }

    private fun toggleLike(reviewId: String, isCurrentlyLiked: Boolean) {
        val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
        val userId = currentUser?.uid

        if (userId == null) {
            Toast.makeText(this, "Vui lòng đăng nhập để thích", Toast.LENGTH_SHORT).show()
            return
        }

        val docRef = db.collection("app_reviews").document(reviewId)

        if (isCurrentlyLiked) {
            // Unlike: Remove user from array
            docRef.update("likedBy", com.google.firebase.firestore.FieldValue.arrayRemove(userId))
                .addOnSuccessListener { loadReviews() } // Refresh list to update UI
                .addOnFailureListener { Toast.makeText(this, "Lỗi: Không thể bỏ thích", Toast.LENGTH_SHORT).show() }
        } else {
            // Like: Add user to array
            docRef.update("likedBy", com.google.firebase.firestore.FieldValue.arrayUnion(userId))
                .addOnSuccessListener { loadReviews() } // Refresh list to update UI
                .addOnFailureListener { Toast.makeText(this, "Lỗi: Không thể thích", Toast.LENGTH_SHORT).show() }
        }
    }

    private fun calculateAndDisplayStats(totalCount: Int, totalStars: Int, starCounts: IntArray) {
        if (totalCount == 0) {
             binding.tvOverallRating.text = "0.0"
             binding.tvTotalReviews.text = "(0 đánh giá)"
             return
        }

        val average = totalStars.toFloat() / totalCount
        binding.tvOverallRating.text = String.format("%.1f", average)
        binding.tvTotalReviews.text = "($totalCount đánh giá)"

        // Update progress bars
        updateProgressBar(binding.progress5Star, (starCounts[5] * 100 / totalCount))
        updateProgressBar(binding.progress4Star, (starCounts[4] * 100 / totalCount))
        updateProgressBar(binding.progress3Star, (starCounts[3] * 100 / totalCount))
        updateProgressBar(binding.progress2Star, (starCounts[2] * 100 / totalCount))
        updateProgressBar(binding.progress1Star, (starCounts[1] * 100 / totalCount))
    }
}

data class ReviewItem(
    val id: String,
    val rating: Int,
    val title: String,
    val content: String,
    val date: String,
    val helpful: Int,
    val isLiked: Boolean
)
