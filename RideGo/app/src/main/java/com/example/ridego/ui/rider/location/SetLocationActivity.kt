package com.example.ridego.ui.rider.location

import android.app.Activity
import android.content.Intent
import android.location.Geocoder
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.res.ResourcesCompat
import com.example.ridego.R
import com.example.ridego.databinding.ActivitySetLocationBinding
import com.example.ridego.ui.booking.BookingActivity
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import java.util.Locale

class SetLocationActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySetLocationBinding
    private var shipperMarker: Marker? = null
    private var myLocationOverlay: MyLocationNewOverlay? = null

    // Biến lưu trạng thái luồng (True = Đặt xe, False = Chỉ tìm kiếm)
    private var isBookingFlow = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Configuration.getInstance().load(applicationContext, getSharedPreferences("osm_pref", MODE_PRIVATE))
        Configuration.getInstance().userAgentValue = packageName

        binding = ActivitySetLocationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 1. NHẬN TÍN HIỆU TỪ MÀN HÌNH TRƯỚC
        isBookingFlow = intent.getBooleanExtra("IS_BOOKING_FLOW", false)

        setupMap()
        setupUI()
    }

    private fun setupMap() {
        binding.mapView.apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)
            isHorizontalMapRepetitionEnabled = false
            isVerticalMapRepetitionEnabled = false

            val startPoint = GeoPoint(10.7721, 106.6983)
            controller.setZoom(18.0)
            controller.setCenter(startPoint)
        }
        setupMyLocation()
        addShipperMarker(GeoPoint(10.7725, 106.6980))
    }

    private fun setupMyLocation() {
        myLocationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(this), binding.mapView)
        myLocationOverlay?.enableMyLocation()
        myLocationOverlay?.enableFollowLocation()
        myLocationOverlay?.isDrawAccuracyEnabled = true
        binding.mapView.overlays.add(myLocationOverlay)
    }

    private fun addShipperMarker(position: GeoPoint) {
        if (shipperMarker == null) {
            shipperMarker = Marker(binding.mapView)
            shipperMarker?.icon = ResourcesCompat.getDrawable(resources, R.drawable.ic_car_logo, null)
            shipperMarker?.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
            shipperMarker?.title = "Tài xế đang đến"
            binding.mapView.overlays.add(shipperMarker)
        }
        shipperMarker?.position = position
        binding.mapView.invalidate()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        // XỬ LÝ NÚT XÁC NHẬN (PHÂN LUỒNG)
        binding.btnConfirmLocation.setOnClickListener {
            val center = binding.mapView.mapCenter as GeoPoint
            val lat = center.latitude
            val lng = center.longitude
            val addressName = getAddressFromLocation(lat, lng)

            if (isBookingFlow) {
                // --- TRƯỜNG HỢP A: LUỒNG ĐẶT XE -> SANG BOOKING ---
                val intent = Intent(this, BookingActivity::class.java)
                intent.putExtra("PICKUP_ADDRESS", addressName)
                intent.putExtra("PICKUP_LAT", lat)
                intent.putExtra("PICKUP_LNG", lng)
                startActivity(intent)
            } else {
                // --- TRƯỜNG HỢP B: LUỒNG TÌM KIẾM -> QUAY VỀ HOME ---
                val returnIntent = Intent()
                returnIntent.putExtra("SELECTED_ADDRESS", addressName)
                returnIntent.putExtra("SELECTED_LAT", lat)
                returnIntent.putExtra("SELECTED_LNG", lng)

                setResult(Activity.RESULT_OK, returnIntent)
                finish() // Đóng màn hình, tự động kích hoạt getContent ở Home
            }
        }
    }

    private fun getAddressFromLocation(lat: Double, lng: Double): String {
        return try {
            val geocoder = Geocoder(this, Locale.getDefault())
            val addresses = geocoder.getFromLocation(lat, lng, 1)
            if (addresses != null && addresses.isNotEmpty()) {
                addresses[0].getAddressLine(0)
            } else {
                "Vị trí đã ghim ($lat, $lng)"
            }
        } catch (e: Exception) {
            e.printStackTrace()
            "Vị trí đã ghim ($lat, $lng)"
        }
    }

    override fun onResume() {
        super.onResume()
        binding.mapView.onResume()
        myLocationOverlay?.enableMyLocation()
    }

    override fun onPause() {
        super.onPause()
        binding.mapView.onPause()
        myLocationOverlay?.disableMyLocation()
    }
}