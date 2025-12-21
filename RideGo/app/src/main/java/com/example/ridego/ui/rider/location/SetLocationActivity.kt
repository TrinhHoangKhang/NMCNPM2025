package com.example.ridego.ui.rider.location

import android.content.Context
import android.os.Bundle
import android.preference.PreferenceManager
import android.view.MotionEvent
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.res.ResourcesCompat
import com.example.ridego.R
import com.example.ridego.databinding.ActivitySetLocationBinding
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.overlay.Marker

class SetLocationActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySetLocationBinding

    // Marker đại diện cho Shipper (Để tracking)
    private var shipperMarker: Marker? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Configuration.getInstance().load(applicationContext, getSharedPreferences("osm_pref", MODE_PRIVATE))
        Configuration.getInstance().userAgentValue = packageName // Để server OSM biết app nào đang gọi

        binding = ActivitySetLocationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupMap()
        setupUI()
    }

    private fun setupMap() {
        binding.mapView.apply {
            setTileSource(TileSourceFactory.MAPNIK) // Style bản đồ chuẩn OSM
            setMultiTouchControls(true) // Cho phép zoom bằng 2 ngón tay
            zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER) // Ẩn nút zoom +/- mặc định xấu xí

            // Set vị trí mặc định (Chợ Bến Thành)
            val startPoint = GeoPoint(10.7721, 106.6983)
            controller.setZoom(18.0) // Zoom lớn để nhìn rõ đường
            controller.setCenter(startPoint)
        }

        // --- DEMO TRACKING: THÊM SHIPPER VÀO BẢN ĐỒ ---
        addShipperMarker(GeoPoint(10.7725, 106.6980))
    }

    // Hàm thêm Shipper lên bản đồ
    private fun addShipperMarker(position: GeoPoint) {
        if (shipperMarker == null) {
            shipperMarker = Marker(binding.mapView)
            shipperMarker?.icon = ResourcesCompat.getDrawable(resources, R.drawable.ic_car_logo, null) // Dùng icon xe nhỏ
            // Hoặc dùng icon shipper vector bạn mới vẽ (nhưng nhớ resize nhỏ lại tầm 40dp trong xml vector)

            shipperMarker?.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
            shipperMarker?.title = "Tài xế đang đến"
            binding.mapView.overlays.add(shipperMarker)
        }
        shipperMarker?.position = position
        binding.mapView.invalidate() // Vẽ lại map
    }

    // Hàm cập nhật vị trí Shipper (Gọi hàm này khi có tọa độ mới từ Socket/API)
    fun updateShipperPosition(lat: Double, lng: Double) {
        val newPos = GeoPoint(lat, lng)
        // Animation mượt mà di chuyển xe (OSM hỗ trợ animateTo)
        shipperMarker?.position = newPos
        binding.mapView.invalidate()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        // Sự kiện map di chuyển (Thay thế cho setOnCameraIdleListener của Google)
        // OSM hơi thủ công đoạn này, ta dùng MapListener hoặc check scroll
        // Đơn giản nhất là khi bấm nút Xác nhận mới lấy tọa độ tâm

        binding.btnConfirmDestination.setOnClickListener {
            val center = binding.mapView.mapCenter as GeoPoint
            // Lấy tọa độ tâm
            val lat = center.latitude
            val lng = center.longitude

            // TODO: Geocoding (Đổi tọa độ -> Tên đường)
            // Với OSM, bạn cần dùng thư viện Geocoder của Android hoặc gọi API Nominatim (Free)

            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        binding.mapView.onResume() // Cần thiết cho OSM
    }

    override fun onPause() {
        super.onPause()
        binding.mapView.onPause() // Cần thiết cho OSM
    }
}