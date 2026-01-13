package com.example.ridego.ui.rider.location

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R
import com.example.ridego.databinding.ActivitySearchDestinationBinding
import com.example.ridego.ui.booking.BookingActivity
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.AutocompletePrediction
import com.google.android.libraries.places.api.model.AutocompleteSessionToken
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.net.FetchPlaceRequest
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest
import com.google.android.libraries.places.api.net.PlacesClient
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Arrays

class SearchDestinationActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySearchDestinationBinding
    private lateinit var placesClient: PlacesClient
    private lateinit var sessionToken: AutocompleteSessionToken
    private lateinit var adapter: LocationAdapter

    // Biến lưu dữ liệu
    private var pickupAddress = ""
    private var pickupLat = 0.0 // Thêm biến lưu tọa độ đón
    private var pickupLng = 0.0 // Thêm biến lưu tọa độ đón

    private var selectedLat = 0.0
    private var selectedLng = 0.0
    private var selectedAddress = ""
    private var selectedName = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Ép buộc chế độ Sáng
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)

        binding = ActivitySearchDestinationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 2. Khởi tạo Google Places
        val apiKey = getString(R.string.google_maps_key)
        if (!Places.isInitialized()) {
            Places.initialize(applicationContext, apiKey)
        }
        placesClient = Places.createClient(this)
        sessionToken = AutocompleteSessionToken.newInstance()

        // 3. Cấu hình RecyclerView
        adapter = LocationAdapter(emptyList()) { prediction ->
            getPlaceDetails(prediction.placeId, prediction.getPrimaryText(null).toString(), prediction.getSecondaryText(null).toString())
        }
        binding.recyclerSearchResults.layoutManager = LinearLayoutManager(this)
        binding.recyclerSearchResults.adapter = adapter

        // 4. Load & Setup
        loadCurrentPickupLocation()
        setupUI()
        setupSearchLogic()

        // Check for passed destination (from Chatbot via SetLocationActivity)
        // Check for passed destination (from Chatbot via SetLocationActivity)
        if (intent.hasExtra("DESTINATION_NAME")) {
            val destName = intent.getStringExtra("DESTINATION_NAME") ?: ""
            val destLat = intent.getDoubleExtra("DESTINATION_LAT", 0.0)
            val destLng = intent.getDoubleExtra("DESTINATION_LNG", 0.0)

            if (destName.isNotEmpty()) {
                if (destLat != 0.0 && destLng != 0.0) {
                    // Case 1: Có tọa độ đầy đủ (Server Geocode thành công)
                    selectedName = destName
                    selectedAddress = destName
                    selectedLat = destLat
                    selectedLng = destLng

                    binding.edtDestination.setText(destName)
                    enableConfirmButton()
                } else {
                    // Case 2: Chỉ có tên, thiếu tọa độ (Server Geocode thất bại)
                    // -> Điền tên vào ô tìm kiếm và tự động search để User chọn
                    binding.edtDestination.setText(destName)
                    searchPlaces(destName)
                    Toast.makeText(this, "Vui lòng chọn địa điểm chính xác", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        binding.btnMapSelect.setOnClickListener {
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", true)
            intent.putExtra("LOCATION_TYPE", 2)
            startActivityForResult(intent, 101)
        }

        binding.btnConfirmSelection.setOnClickListener {
            if (selectedLat != 0.0 && selectedLng != 0.0) {
                navigateToBooking() // <--- GỌI HÀM MỚI
            } else {
                Toast.makeText(this, "Vui lòng chọn điểm đến", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupSearchLogic() {
        binding.edtDestination.requestFocus()
        binding.edtDestination.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val query = s.toString()
                if (query.isNotEmpty()) {
                    searchPlaces(query)
                    binding.btnConfirmSelection.isEnabled = false
                    binding.btnConfirmSelection.alpha = 0.5f
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
    }

    private fun searchPlaces(query: String) {
        val request = FindAutocompletePredictionsRequest.builder()
            .setSessionToken(sessionToken)
            .setQuery(query)
            .setCountries("VN")
            .build()

        placesClient.findAutocompletePredictions(request)
            .addOnSuccessListener { response ->
                adapter.updateData(response.autocompletePredictions)
            }
            .addOnFailureListener { exception -> exception.printStackTrace() }
    }

    private fun getPlaceDetails(placeId: String, name: String, address: String) {
        val placeFields = Arrays.asList(Place.Field.ID, Place.Field.LAT_LNG)
        val request = FetchPlaceRequest.builder(placeId, placeFields).setSessionToken(sessionToken).build()

        placesClient.fetchPlace(request)
            .addOnSuccessListener { response ->
                val place = response.place
                if (place.latLng != null) {
                    selectedLat = place.latLng!!.latitude
                    selectedLng = place.latLng!!.longitude
                    selectedName = name
                    selectedAddress = address

                    binding.edtDestination.setText("$name - $address")
                    binding.edtDestination.setSelection(binding.edtDestination.text.length)
                    binding.recyclerSearchResults.adapter = LocationAdapter(emptyList()) {}

                    enableConfirmButton()
                }
            }
    }

    // --- SỬA QUAN TRỌNG: CHUYỂN SANG BOOKING ACTIVITY ---
    private fun navigateToBooking() {
        val intent = Intent(this, BookingActivity::class.java)

        // Gửi thông tin Điểm đến (Dropoff)
        intent.putExtra("DROPOFF_NAME", selectedName)
        intent.putExtra("DROPOFF_ADDRESS", selectedAddress)
        intent.putExtra("DROPOFF_LAT", selectedLat)
        intent.putExtra("DROPOFF_LNG", selectedLng)

        // Gửi thông tin Điểm đón (Pickup) lấy từ Firebase
        intent.putExtra("PICKUP_ADDRESS", pickupAddress)
        intent.putExtra("PICKUP_LAT", pickupLat)
        intent.putExtra("PICKUP_LNG", pickupLng)

        // Bắt đầu màn hình Booking
        startActivity(intent)
        finish()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 101 && resultCode == Activity.RESULT_OK && data != null) {
            val address = data.getStringExtra("SELECTED_ADDRESS") ?: ""
            val lat = data.getDoubleExtra("SELECTED_LAT", 0.0)
            val lng = data.getDoubleExtra("SELECTED_LNG", 0.0)

            selectedAddress = address
            selectedName = address
            selectedLat = lat
            selectedLng = lng

            binding.edtDestination.setText(address)
            enableConfirmButton()
        }
    }

    private fun enableConfirmButton() {
        binding.btnConfirmSelection.isEnabled = true
        binding.btnConfirmSelection.alpha = 1.0f
        binding.btnConfirmSelection.text = "Xác nhận: $selectedName"
    }

    private fun loadCurrentPickupLocation() {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return
        val db = FirebaseFirestore.getInstance()
        val uid = currentUser.uid

        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
            val targetId = mapping.getString("customUserId") ?: uid
            db.collection("users").document(targetId).get().addOnSuccessListener { userDoc ->
                pickupAddress = userDoc.getString("currentPickupAddress") ?: "Vị trí của bạn"
                // Lấy thêm tọa độ đón để gửi sang Booking
                pickupLat = userDoc.getDouble("currentPickupLat") ?: 0.0
                pickupLng = userDoc.getDouble("currentPickupLng") ?: 0.0

                binding.tvPickupLocation.text = pickupAddress
            }
        }
    }
}

// --- CLASS ADAPTER ---
class LocationAdapter(
    private var predictions: List<AutocompletePrediction>,
    private val onClick: (AutocompletePrediction) -> Unit
) : RecyclerView.Adapter<LocationAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvPrimary: TextView = view.findViewById(android.R.id.text1)
        val tvSecondary: TextView = view.findViewById(android.R.id.text2)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(android.R.layout.simple_list_item_2, parent, false)
        view.setBackgroundColor(Color.WHITE)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = predictions[position]
        holder.tvPrimary.text = item.getPrimaryText(null)
        holder.tvPrimary.setTextColor(Color.BLACK)
        holder.tvPrimary.textSize = 16f

        holder.tvSecondary.text = item.getSecondaryText(null)
        holder.tvSecondary.setTextColor(Color.DKGRAY)

        holder.itemView.setOnClickListener { onClick(item) }
    }

    override fun getItemCount() = predictions.size

    fun updateData(newPredictions: List<AutocompletePrediction>) {
        predictions = newPredictions
        notifyDataSetChanged()
    }
}