package com.example.ridego.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.ridego.data.api.RetrofitClient
import com.example.ridego.data.model.DriverProfileResponse
import com.example.ridego.databinding.ActivityOtherUserProfileBinding
import com.example.ridego.ui.chat.ChatActivity // Will create this next
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class OtherUserProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOtherUserProfileBinding
    private var driverId: String? = null
    private var driverUid: String? = null // For chat mapping

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOtherUserProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        driverId = intent.getStringExtra("DRIVER_ID")
        // Alternatively, it might be passed as UID directly. 
        // The API accepts the Firestore Document ID, which usually IS the UID.
        
        if (driverId.isNullOrEmpty()) {
            Toast.makeText(this, "Error: No Driver ID found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding.btnBack.setOnClickListener { finish() }

        binding.btnChat.setOnClickListener {
            if (driverUid != null) {
                val intent = Intent(this, ChatActivity::class.java)
                intent.putExtra("PARTNER_ID", driverUid) // Use UID for Chat
                startActivity(intent)
            } else {
                Toast.makeText(this, "Loading driver info...", Toast.LENGTH_SHORT).show()
            }
        }

        loadDriverProfile(driverId!!)
    }

    private fun loadDriverProfile(id: String) {
        RetrofitClient.instance.getDriver(id).enqueue(object : Callback<DriverProfileResponse> {
            override fun onResponse(call: Call<DriverProfileResponse>, response: Response<DriverProfileResponse>) {
                if (response.isSuccessful && response.body() != null) {
                    val driver = response.body()!!
                    updateUI(driver)
                } else {
                    Toast.makeText(this@OtherUserProfileActivity, "Failed to load profile", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<DriverProfileResponse>, t: Throwable) {
                Toast.makeText(this@OtherUserProfileActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun updateUI(driver: DriverProfileResponse) {
        driverUid = driver.uid

        binding.tvName.text = driver.name
        binding.tvRole.text = driver.role
        binding.tvRating.text = String.format("%.1f", driver.rating ?: 5.0)
        binding.tvTotalTrips.text = driver.totalTrips?.toString() ?: "0"

        if (driver.vehicle != null) {
            binding.tvVehicleType.text = driver.vehicle.type?.uppercase() ?: "N/A"
            binding.tvPlate.text = driver.vehicle.plate ?: "N/A"
        } else {
            binding.tvVehicleType.text = "Unknown"
            binding.tvPlate.text = "Unknown"
        }

        if (!driver.avatar.isNullOrEmpty()) {
            binding.imgAvatar.visibility = View.VISIBLE
            binding.tvAvatarFallback.visibility = View.GONE
            Glide.with(this).load(driver.avatar).into(binding.imgAvatar)
        } else {
            binding.imgAvatar.visibility = View.GONE
            binding.tvAvatarFallback.visibility = View.VISIBLE
            binding.tvAvatarFallback.text = driver.name.firstOrNull()?.toString()?.uppercase() ?: "U"
        }
    }
}
