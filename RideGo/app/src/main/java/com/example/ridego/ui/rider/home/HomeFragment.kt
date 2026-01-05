package com.example.ridego.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.ridego.databinding.FragmentHomeBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

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