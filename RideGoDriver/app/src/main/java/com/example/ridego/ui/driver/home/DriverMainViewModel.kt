package com.example.ridego.ui.driver.home

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.ridego.data.socket.SocketManager
import com.example.ridego.model.RideRequest
import org.json.JSONObject

class DriverMainViewModel(application: Application) : AndroidViewModel(application) {

    // LiveData để UI lắng nghe khi có chuyến xe mới
    private val _incomingRide = MutableLiveData<RideRequest?>()
    val incomingRide: LiveData<RideRequest?> = _incomingRide

    // LiveData trạng thái chuyến đi (để update UI khi tài xế bấm nút)
    private val _tripStatus = MutableLiveData<String>()
    val tripStatus: LiveData<String> = _tripStatus

    // Giả lập lấy ID tài xế từ SharedPreferences hoặc Repository
    private val currentDriverId = "DRIVER_12345"

    init {
        // 1. Kết nối Socket ngay khi ViewModel được khởi tạo
        connectSocket()
    }

    private fun connectSocket() {
        SocketManager.connect()

        // 2. Đăng ký lắng nghe sự kiện
        listenForNewRide()
        listenForRideCancel()
    }

    private fun listenForNewRide() {
        SocketManager.onNewRideRequest { dataJson ->
            try {
                // Parse JSON sang Object RideRequest
                // Lưu ý: Socket trả về trên background thread, dùng postValue để đẩy lên Main Thread
                val request = RideRequest(
                    tripId = dataJson.optString("tripId"),
                    customerName = dataJson.optString("customerName", "Khách hàng"),
                    pickupAddress = dataJson.optString("pickupAddress"),
                    destinationAddress = dataJson.optString("destinationAddress"),
                    price = dataJson.optDouble("price", 0.0),
                    distance = dataJson.optDouble("distance", 0.0)
                )

                Log.d("DriverVM", "Nhận chuyến: ${request.tripId}")
                _incomingRide.postValue(request)

            } catch (e: Exception) {
                Log.e("DriverVM", "Lỗi parse chuyến xe: ${e.message}")
            }
        }
    }

    private fun listenForRideCancel() {
        SocketManager.onRideCanceled {
            // Xử lý khi khách hủy: Ẩn popup nhận chuyến hoặc thông báo
            _incomingRide.postValue(null)
        }
    }

    // =================================================
    // CÁC HÀM UI GỌI XUỐNG
    // =================================================

    // Gọi hàm này từ LocationCallback trong Activity/Service
    fun updateLocation(lat: Double, lng: Double, heading: Float) {
        SocketManager.emitLocationUpdate(currentDriverId, lat, lng, heading)
    }

    // Tài xế bấm "Nhận chuyến"
    fun acceptRide(tripId: String) {
        SocketManager.emitAcceptRide(currentDriverId, tripId)
        _tripStatus.value = "ACCEPTED"
        // Sau khi nhận, clear biến incomingRide để ẩn popup đi
        _incomingRide.value = null
    }

    // Tài xế bấm "Bỏ qua"
    fun rejectRide(tripId: String) {
        SocketManager.emitRejectRide(currentDriverId, tripId)
        _incomingRide.value = null // Ẩn popup
    }

    override fun onCleared() {
        super.onCleared()
        // Ngắt kết nối khi thoát màn hình chính (hoặc giữ nếu chạy background service)
        SocketManager.disconnect()
    }
}