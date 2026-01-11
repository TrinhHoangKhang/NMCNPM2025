package com.example.ridego.ui.rider.location

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R
import com.example.ridego.ui.booking.BookingActivity
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.AutocompleteSessionToken
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.model.RectangularBounds
import com.google.android.libraries.places.api.model.TypeFilter
import com.google.android.libraries.places.api.net.FetchPlaceRequest
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest
import com.google.android.libraries.places.api.net.PlacesClient
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Arrays

class SearchDestinationActivity : AppCompatActivity() {

    private lateinit var placesClient: PlacesClient
    private lateinit var recycler: RecyclerView
    private lateinit var edtSearch: EditText
    private lateinit var tvPickup: TextView
    private var token: AutocompleteSessionToken? = null

    // Lưu tọa độ điểm đón để ưu tiên kết quả tìm kiếm gần đó
    private var currentLat = 0.0
    private var currentLng = 0.0
    private var pickupAddress = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_destination)

        // 1. Khởi tạo Google Places (quan trọng)
        // Lấy key từ Manifest hoặc nhập cứng để test
        val apiKey = getString(R.string.google_maps_key) // Đảm bảo bạn có string này
        if (!Places.isInitialized()) {
            Places.initialize(applicationContext, apiKey)
        }
        placesClient = Places.createClient(this)
        token = AutocompleteSessionToken.newInstance()

        // 2. Ánh xạ View
        recycler = findViewById(R.id.recyclerSearchResults)
        edtSearch = findViewById(R.id.edtDestination)
        tvPickup = findViewById(R.id.tvPickupLocation)

        recycler.layoutManager = LinearLayoutManager(this)

        // 3. Load điểm đón từ Firebase
        loadCurrentPickupLocation()

        // 4. Bắt sự kiện nhập liệu
        edtSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (!s.isNullOrEmpty()) {
                    searchPlaces(s.toString())
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
    }

    private fun searchPlaces(query: String) {
        // Tạo request tìm kiếm
        val request = FindAutocompletePredictionsRequest.builder()
            .setSessionToken(token)
            .setQuery(query)
            .setCountries("VN") // Giới hạn ở Việt Nam
            // .setOrigin(LatLng(currentLat, currentLng)) // Ưu tiên gần vị trí đón (nếu có LatLng)
            .build()

        placesClient.findAutocompletePredictions(request)
            .addOnSuccessListener { response ->
                val adapter = LocationAdapter(response.autocompletePredictions) { prediction ->
                    // Khi người dùng chọn 1 địa điểm -> Lấy tọa độ chi tiết
                    getPlaceDetails(prediction.placeId, prediction.getPrimaryText(null).toString(), prediction.getSecondaryText(null).toString())
                }
                recycler.adapter = adapter
            }
            .addOnFailureListener { exception ->
                // Xử lý lỗi nếu có (vd: Quota exceeded, Invalid Key)
                exception.printStackTrace()
            }
    }

    private fun getPlaceDetails(placeId: String, name: String, address: String) {
        // Cần lấy Lat/Lng của địa điểm đó
        val placeFields = Arrays.asList(Place.Field.ID, Place.Field.NAME, Place.Field.LAT_LNG, Place.Field.ADDRESS)
        val request = FetchPlaceRequest.builder(placeId, placeFields).setSessionToken(token).build()

        placesClient.fetchPlace(request)
            .addOnSuccessListener { response ->
                val place = response.place
                val latLng = place.latLng

                if (latLng != null) {
                    // --- CHUYỂN SANG BOOKING ACTIVITY ---
                    val intent = Intent(this, BookingActivity::class.java)

                    // Gửi thông tin điểm đón (đã lấy từ Firebase)
                    intent.putExtra("PICKUP_ADDRESS", pickupAddress)
                    intent.putExtra("PICKUP_LAT", currentLat)
                    intent.putExtra("PICKUP_LNG", currentLng)

                    // Gửi thông tin điểm đến (vừa tìm được)
                    intent.putExtra("DROPOFF_NAME", name)
                    intent.putExtra("DROPOFF_ADDRESS", address) // Hoặc place.address
                    intent.putExtra("DROPOFF_LAT", latLng.latitude)
                    intent.putExtra("DROPOFF_LNG", latLng.longitude)

                    startActivity(intent)
                }
            }
    }

    private fun loadCurrentPickupLocation() {
        // Code lấy từ Firebase giống các bước trước
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return
        val db = FirebaseFirestore.getInstance()
        val uid = currentUser.uid

        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
            val targetId = mapping.getString("customUserId") ?: uid
            db.collection("users").document(targetId).get().addOnSuccessListener { userDoc ->
                pickupAddress = userDoc.getString("currentPickupAddress") ?: ""
                currentLat = userDoc.getDouble("currentPickupLat") ?: 0.0
                currentLng = userDoc.getDouble("currentPickupLng") ?: 0.0

                tvPickup.text = pickupAddress

                // Focus vào ô nhập điểm đến ngay khi vào
                edtSearch.requestFocus()
            }
        }
    }
}