package com.example.ridego.ui.rider.location

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.example.ridego.R
import com.example.ridego.databinding.ActivitySetLocationBinding
import com.example.ridego.ui.booking.BookingActivity
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.Locale

class SetLocationActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var binding: ActivitySetLocationBinding
    private lateinit var mMap: GoogleMap
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var isBookingFlow = false
    private val REQUEST_CHECK_SETTINGS = 1001

    // Biến lưu thông tin địa điểm đang chọn
    private var selectedAddressName = ""
    private var selectedLat = 0.0
    private var selectedLng = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySetLocationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        isBookingFlow = intent.getBooleanExtra("IS_BOOKING_FLOW", false)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val mapFragment = supportFragmentManager.findFragmentById(R.id.mapFragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        setupUI()
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            mMap.isMyLocationEnabled = true
            mMap.uiSettings.isMyLocationButtonEnabled = false
            mMap.uiSettings.isCompassEnabled = true
            mMap.uiSettings.isZoomControlsEnabled = false
        }

        checkAndTurnOnGPS()

        // Khi dừng kéo map -> Load thông tin địa điểm
        mMap.setOnCameraIdleListener {
            val center = mMap.cameraPosition.target
            selectedLat = center.latitude
            selectedLng = center.longitude
            updateAddressInfo(center.latitude, center.longitude)
        }
    }

    private fun updateAddressInfo(lat: Double, lng: Double) {
        binding.tvSelectedTitle.text = "Đang tải..."
        binding.tvSelectedAddress.text = "..."

        try {
            val geocoder = Geocoder(this, Locale.getDefault())
            // Chỉ lấy 1 kết quả duy nhất
            val addresses = geocoder.getFromLocation(lat, lng, 1)

            if (!addresses.isNullOrEmpty()) {
                val address = addresses[0]

                // Logic hiển thị thông minh:
                // Title: Tên địa điểm cụ thể (VD: Keangnam Landmark) hoặc Tên đường
                // Sub: Địa chỉ đầy đủ
                val featureName = address.featureName // Tên địa điểm/Số nhà
                val thoroughfare = address.thoroughfare // Tên đường
                val fullAddress = address.getAddressLine(0) // Địa chỉ full

                val displayTitle = if (!featureName.isNullOrEmpty() && featureName != thoroughfare) {
                    featureName
                } else if (!thoroughfare.isNullOrEmpty()) {
                    thoroughfare
                } else {
                    "Vị trí đã chọn"
                }

                binding.tvSelectedTitle.text = displayTitle
                binding.tvSelectedAddress.text = fullAddress

                selectedAddressName = fullAddress // Lưu địa chỉ full để trả về
            } else {
                binding.tvSelectedTitle.text = "Vị trí không xác định"
                binding.tvSelectedAddress.text = "$lat, $lng"
                selectedAddressName = "$lat, $lng"
            }
        } catch (e: Exception) {
            e.printStackTrace()
            binding.tvSelectedTitle.text = "Lỗi tải địa chỉ"
        }
    }

    private fun checkAndTurnOnGPS() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000).build()
        val builder = LocationSettingsRequest.Builder().addLocationRequest(locationRequest)
        val client = LocationServices.getSettingsClient(this)
        val task = client.checkLocationSettings(builder.build())

        task.addOnSuccessListener { getDeviceLocation() }
        task.addOnFailureListener { exception ->
            if (exception is ResolvableApiException) {
                try {
                    exception.startResolutionForResult(this@SetLocationActivity, REQUEST_CHECK_SETTINGS)
                } catch (sendEx: IntentSender.SendIntentException) {}
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CHECK_SETTINGS) {
            if (resultCode == Activity.RESULT_OK) {
                getDeviceLocation()
            }
        }
    }

    private fun getDeviceLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) return

        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            if (location != null) {
                moveCameraToLocation(location.latitude, location.longitude)
            } else {
                requestNewLocation()
            }
        }
    }

    private fun requestNewLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) return
        val tokenSource = CancellationTokenSource()
        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, tokenSource.token)
            .addOnSuccessListener { location ->
                if (location != null) {
                    moveCameraToLocation(location.latitude, location.longitude)
                }
            }
    }

    private fun moveCameraToLocation(lat: Double, lng: Double) {
        val latLng = LatLng(lat, lng)
        mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 17f))
        updateAddressInfo(lat, lng)
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }
        binding.btnMyLocation.setOnClickListener { checkAndTurnOnGPS() }

        val type = intent.getIntExtra("LOCATION_TYPE", 0)
        if (type == 1) {
            binding.btnConfirmLocation.text = "Xác nhận điểm đón"
        } else if (type == 2) {
            binding.btnConfirmLocation.text = "Xác nhận điểm đến"
        }

        binding.btnConfirmLocation.setOnClickListener {
            // Nút "Xác nhận vị trí"
            if (isBookingFlow) {
                val intent = Intent(this, BookingActivity::class.java)
                intent.putExtra("PICKUP_ADDRESS", selectedAddressName)
                intent.putExtra("PICKUP_LAT", selectedLat)
                intent.putExtra("PICKUP_LNG", selectedLng)
                startActivity(intent)
            } else {
                val returnIntent = Intent()
                returnIntent.putExtra("SELECTED_ADDRESS", selectedAddressName)
                returnIntent.putExtra("SELECTED_LAT", selectedLat)
                returnIntent.putExtra("SELECTED_LNG", selectedLng)
                setResult(Activity.RESULT_OK, returnIntent)
                finish()
            }
        }
    }
}