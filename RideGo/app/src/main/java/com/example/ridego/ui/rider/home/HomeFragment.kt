package com.example.ridego.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.ridego.databinding.FragmentHomeBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import android.content.Intent
import com.example.ridego.ui.rider.location.SetLocationActivity
import com.example.ridego.ui.rider.location.SearchDestinationActivity

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loadUserInfo()
        binding.layoutSearch.setOnClickListener {
            checkLocationAndNavigate()
        }
    }

    private fun checkLocationAndNavigate() {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return
        val db = FirebaseFirestore.getInstance()
        val firebaseUid = currentUser.uid

        // 1. Kiểm tra uid_mapping để lấy đúng ID người dùng
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val targetUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }

                // 2. Lấy dữ liệu user thật
                db.collection("users").document(targetUserId).get()
                    .addOnSuccessListener { document ->
                        val savedAddress = document.getString("currentPickupAddress")

                        // 3. Nếu đã có địa chỉ và khác "none" -> Sang màn hình Nhập điểm đến
                        if (!savedAddress.isNullOrEmpty() && savedAddress != "none") {
                            val intent = Intent(requireContext(), SearchDestinationActivity::class.java)
                            startActivity(intent)
                        } else {
                            // 4. Nếu chưa có -> Mở bản đồ để chọn điểm đón
                            val intent = Intent(requireContext(), SetLocationActivity::class.java)
                            intent.putExtra("IS_BOOKING_FLOW", true)
                            startActivity(intent)
                        }
                    }
                    .addOnFailureListener {
                        // Lỗi mạng -> Mặc định mở bản đồ
                        val intent = Intent(requireContext(), SetLocationActivity::class.java)
                        intent.putExtra("IS_BOOKING_FLOW", true)
                        startActivity(intent)
                    }
            }
    }

    private fun openMapToPickLocation() {
        val intent = Intent(requireContext(), SetLocationActivity::class.java)
        intent.putExtra("IS_BOOKING_FLOW", true)
        startActivity(intent)
    }
    
    override fun onResume() {
        super.onResume()
        // Reload tên người dùng mỗi khi quay lại màn hình
        loadUserInfo()
    }

    private fun loadUserInfo() {
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            val firebaseUid = currentUser.uid
            val db = FirebaseFirestore.getInstance()
            db.collection("uid_mapping").document(firebaseUid).get()
                .addOnSuccessListener { mappingDoc ->
                    val customUserId = if (mappingDoc.exists()) {
                        mappingDoc.getString("customUserId") ?: firebaseUid
                    } else {
                        firebaseUid
                    }
                    db.collection("users").document(customUserId).get()
                        .addOnSuccessListener { document ->
                            val name = document.getString("name") ?: currentUser.displayName ?: "Bạn"
                            binding.tvWelcome.text = "Chào $name! 👋"
                        }
                        .addOnFailureListener {
                            val name = currentUser.displayName ?: "Bạn"
                            binding.tvWelcome.text = "Chào $name! 👋"
                        }
                }
                .addOnFailureListener {
                    val name = currentUser.displayName ?: "Bạn"
                    binding.tvWelcome.text = "Chào $name! 👋"
                }
        } else {
            binding.tvWelcome.text = "Chào Bạn! 👋"
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}