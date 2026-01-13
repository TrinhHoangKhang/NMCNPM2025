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

    private var homeAddress: String? = null
    private var homeLat: Double = 0.0
    private var homeLng: Double = 0.0

    private var workAddress: String? = null
    private var workLat: Double = 0.0
    private var workLng: Double = 0.0

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
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
        
        binding.layoutHome.setOnClickListener {
            handleFavoriteClick(homeAddress, homeLat, homeLng, 3) 
        }
        
        binding.layoutWork.setOnClickListener {
            handleFavoriteClick(workAddress, workLat, workLng, 4)
        }
    }
    
    private fun handleFavoriteClick(address: String?, lat: Double, lng: Double, type: Int) {
        if (address.isNullOrEmpty()) {
            // Chưa có -> Mở màn hình set location
            val intent = Intent(requireContext(), SetLocationActivity::class.java)
            intent.putExtra("LOCATION_TYPE", type) // 3: Home, 4: Work
            startActivity(intent)
        } else {
            // Đã có -> Check pickup -> Navigate to Booking
            checkPickupAndBook(address, lat, lng)
        }
    }

    private fun checkPickupAndBook(dropoffAddress: String, dropoffLat: Double, dropoffLng: Double) {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return
        val db = FirebaseFirestore.getInstance()
        val uid = currentUser.uid
        
        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
             val targetId = mapping.getString("customUserId") ?: uid
             db.collection("users").document(targetId).get().addOnSuccessListener { userDoc ->
                 val pickupAddress = userDoc.getString("currentPickupAddress")
                 val pickupLat = userDoc.getDouble("currentPickupLat") ?: 0.0
                 val pickupLng = userDoc.getDouble("currentPickupLng") ?: 0.0
                 
                 if (!pickupAddress.isNullOrEmpty() && pickupAddress != "none") {
                     // Đã có pickup -> Mở BookingActivity luôn
                     val intent = Intent(requireContext(), com.example.ridego.ui.booking.BookingActivity::class.java)
                     intent.putExtra("PICKUP_ADDRESS", pickupAddress)
                     intent.putExtra("PICKUP_LAT", pickupLat)
                     intent.putExtra("PICKUP_LNG", pickupLng)
                     intent.putExtra("DROPOFF_ADDRESS", dropoffAddress)
                     intent.putExtra("DROPOFF_LAT", dropoffLat)
                     intent.putExtra("DROPOFF_LNG", dropoffLng)
                     startActivity(intent)
                 } else {
                     // Chưa có pickup -> Mở SetLocationActivity (Pickup)
                     val intent = Intent(requireContext(), SetLocationActivity::class.java)
                     intent.putExtra("IS_BOOKING_FLOW", true)
                     intent.putExtra("LOCATION_TYPE", 1) // Pickup
                     startActivity(intent)
                 }
             }
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
                            intent.putExtra("LOCATION_TYPE", 1)
                            startActivity(intent)
                        }
                    }
                    .addOnFailureListener {
                        // Lỗi mạng -> Mặc định mở bản đồ
                        val intent = Intent(requireContext(), SetLocationActivity::class.java)
                        intent.putExtra("IS_BOOKING_FLOW", true)
                        intent.putExtra("LOCATION_TYPE", 1)
                        startActivity(intent)
                    }
            }
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
                            
                            // Load Favorites
                            homeAddress = document.getString("homeAddress")
                            homeLat = document.getDouble("homeLat") ?: 0.0
                            homeLng = document.getDouble("homeLng") ?: 0.0
                            
                            workAddress = document.getString("workAddress")
                            workLat = document.getDouble("workLat") ?: 0.0
                            workLng = document.getDouble("workLng") ?: 0.0
                            
                            if (!homeAddress.isNullOrEmpty()) {
                                binding.tvHomeAddress.text = homeAddress
                            } else {
                                binding.tvHomeAddress.text = "Thiết lập ngay"
                            }
                            
                            if (!workAddress.isNullOrEmpty()) {
                                binding.tvWorkAddress.text = workAddress
                            } else {
                                binding.tvWorkAddress.text = "Thiết lập ngay"
                            }
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