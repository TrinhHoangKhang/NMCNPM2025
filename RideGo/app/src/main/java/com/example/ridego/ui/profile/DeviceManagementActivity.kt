package com.example.ridego.ui.profile

import android.app.AlertDialog
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.ridego.BuildConfig
import com.example.ridego.data.model.DeviceSession
import com.example.ridego.databinding.ActivityDeviceManagementBinding
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DeviceManagementActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityDeviceManagementBinding
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private lateinit var deviceAdapter: DeviceSessionAdapter
    
    private var currentSessionId: String = ""
    private var customUserId: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDeviceManagementBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupViews()
        setupRecyclerView()
        registerCurrentDevice()
        loadDeviceSessions()
    }

    private fun setupViews() {
        binding.btnBack.setOnClickListener { finish() }
        
        binding.btnLogoutAll.setOnClickListener {
            showLogoutAllDialog()
        }
    }

    private fun setupRecyclerView() {
        deviceAdapter = DeviceSessionAdapter { device ->
            showLogoutDeviceDialog(device)
        }
        
        binding.rvDevices.apply {
            layoutManager = LinearLayoutManager(this@DeviceManagementActivity)
            adapter = deviceAdapter
        }
    }

    private fun getAndroidDeviceId(): String {
        return Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
    }

    private fun getDeviceName(): String {
        // Ưu tiên lấy tên thiết bị do người dùng đặt
        val userDeviceName = try {
            Settings.Global.getString(contentResolver, "device_name")
        } catch (e: Exception) {
            null
        }
        
        if (!userDeviceName.isNullOrBlank()) {
            return userDeviceName
        }
        
        // Fallback: Lấy tên Bluetooth (thường là tên người dùng đặt)
        val bluetoothName = try {
            android.bluetooth.BluetoothAdapter.getDefaultAdapter()?.name
        } catch (e: Exception) {
            null
        }
        
        if (!bluetoothName.isNullOrBlank()) {
            return bluetoothName
        }
        
        // Fallback cuối: Dùng manufacturer + model
        val manufacturer = Build.MANUFACTURER
        val model = Build.MODEL
        return if (model.startsWith(manufacturer, ignoreCase = true)) {
            model.replaceFirstChar { it.uppercase() }
        } else {
            "${manufacturer.replaceFirstChar { it.uppercase() }} $model"
        }
    }

    private fun registerCurrentDevice() {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid
        
        currentSessionId = getAndroidDeviceId()
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                val currentDevice = DeviceSession(
                    sessionId = currentSessionId,
                    deviceName = getDeviceName(),
                    deviceModel = Build.MODEL,
                    deviceOs = "Android ${Build.VERSION.RELEASE}",
                    appVersion = try { BuildConfig.VERSION_NAME } catch (e: Exception) { "1.0" },
                    lastActive = Timestamp.now(),
                    loginTime = Timestamp.now(),
                    isCurrentDevice = true
                )
                
                // Cập nhật hoặc tạo session cho thiết bị hiện tại
                db.collection("users").document(customUserId)
                    .collection("device_sessions")
                    .document(currentSessionId)
                    .set(currentDevice.toMap())
                    .addOnSuccessListener {
                        updateCurrentDeviceUI(currentDevice)
                    }
            }
    }

    private fun updateCurrentDeviceUI(device: DeviceSession) {
        // Hiển thị tên thiết bị thật, nếu rỗng thì hiển thị tên từ getDeviceName()
        val displayName = if (device.deviceName.isNotBlank()) {
            device.deviceName
        } else {
            getDeviceName()
        }
        binding.tvCurrentDeviceName.text = displayName
        binding.tvCurrentDeviceInfo.text = "${device.deviceOs} • RideGo v${device.appVersion}"
        binding.tvCurrentDeviceLocation.text = "Đang hoạt động"
    }

    private fun loadDeviceSessions() {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid
        
        // Hiển thị tên thiết bị ngay lập tức (không đợi Firestore)
        binding.tvCurrentDeviceName.text = getDeviceName()
        binding.tvCurrentDeviceInfo.text = "Android ${Build.VERSION.RELEASE} • RideGo v${try { BuildConfig.VERSION_NAME } catch (e: Exception) { "1.0" }}"
        
        showLoading(true)
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                db.collection("users").document(customUserId)
                    .collection("device_sessions")
                    .get()
                    .addOnSuccessListener { documents ->
                        showLoading(false)
                        
                        val otherDevices = mutableListOf<DeviceSession>()
                        var currentDevice: DeviceSession? = null
                        
                        for (doc in documents) {
                            val device = DeviceSession.fromMap(doc.id, doc.data)
                            if (doc.id == currentSessionId) {
                                currentDevice = device.copy(isCurrentDevice = true)
                            } else {
                                otherDevices.add(device)
                            }
                        }
                        
                        // Cập nhật UI thiết bị hiện tại
                        currentDevice?.let { updateCurrentDeviceUI(it) }
                        
                        // Cập nhật danh sách thiết bị khác
                        updateDeviceList(otherDevices)
                    }
                    .addOnFailureListener { e ->
                        showLoading(false)
                        // Xử lý lỗi permission denied
                        if (e.message?.contains("PERMISSION_DENIED") == true || 
                            e.message?.contains("Missing or insufficient permissions") == true) {
                            Toast.makeText(this, "Không có quyền truy cập. Vui lòng đăng nhập lại.", Toast.LENGTH_LONG).show()
                            // Vẫn hiển thị thiết bị hiện tại
                            updateDeviceList(emptyList())
                        } else {
                            Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
            }
    }

    private fun updateDeviceList(devices: List<DeviceSession>) {
        deviceAdapter.submitList(devices)
        
        val deviceCount = devices.size
        binding.tvDeviceCount.text = "$deviceCount thiết bị"
        
        if (devices.isEmpty()) {
            binding.rvDevices.visibility = View.GONE
            binding.emptyState.visibility = View.VISIBLE
            binding.btnLogoutAll.visibility = View.GONE
        } else {
            binding.rvDevices.visibility = View.VISIBLE
            binding.emptyState.visibility = View.GONE
            binding.btnLogoutAll.visibility = View.VISIBLE
        }
    }

    private fun showLogoutDeviceDialog(device: DeviceSession) {
        AlertDialog.Builder(this)
            .setTitle("Đăng xuất thiết bị")
            .setMessage("Bạn có chắc muốn đăng xuất khỏi \"${device.deviceName}\"?\n\nThiết bị này sẽ cần đăng nhập lại để tiếp tục sử dụng.")
            .setPositiveButton("Đăng xuất") { _, _ ->
                logoutDevice(device)
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun showLogoutAllDialog() {
        AlertDialog.Builder(this)
            .setTitle("Đăng xuất tất cả thiết bị")
            .setMessage("Bạn có chắc muốn đăng xuất khỏi TẤT CẢ các thiết bị khác?\n\nCác thiết bị đó sẽ cần đăng nhập lại để tiếp tục sử dụng.")
            .setPositiveButton("Đăng xuất tất cả") { _, _ ->
                logoutAllDevices()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun logoutDevice(device: DeviceSession) {
        showLoading(true)
        
        db.collection("users").document(customUserId)
            .collection("device_sessions")
            .document(device.sessionId)
            .delete()
            .addOnSuccessListener {
                showLoading(false)
                Toast.makeText(this, "Đã đăng xuất khỏi ${device.deviceName}", Toast.LENGTH_SHORT).show()
                loadDeviceSessions() // Reload danh sách
            }
            .addOnFailureListener { e ->
                showLoading(false)
                Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
            }
    }

    private fun logoutAllDevices() {
        showLoading(true)
        
        db.collection("users").document(customUserId)
            .collection("device_sessions")
            .get()
            .addOnSuccessListener { documents ->
                val batch = db.batch()
                var count = 0
                
                for (doc in documents) {
                    // Không xóa session của thiết bị hiện tại
                    if (doc.id != currentSessionId) {
                        batch.delete(doc.reference)
                        count++
                    }
                }
                
                if (count > 0) {
                    batch.commit()
                        .addOnSuccessListener {
                            showLoading(false)
                            Toast.makeText(this, "Đã đăng xuất khỏi $count thiết bị", Toast.LENGTH_SHORT).show()
                            loadDeviceSessions()
                        }
                        .addOnFailureListener { e ->
                            showLoading(false)
                            Toast.makeText(this, "Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                } else {
                    showLoading(false)
                    Toast.makeText(this, "Không có thiết bị nào để đăng xuất", Toast.LENGTH_SHORT).show()
                }
            }
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
    }

    override fun onResume() {
        super.onResume()
        // Cập nhật lastActive cho thiết bị hiện tại
        if (customUserId.isNotEmpty() && currentSessionId.isNotEmpty()) {
            db.collection("users").document(customUserId)
                .collection("device_sessions")
                .document(currentSessionId)
                .update("lastActive", Timestamp.now())
        }
    }
}
