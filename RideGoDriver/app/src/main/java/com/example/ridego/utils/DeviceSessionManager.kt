package com.example.ridego.utils

import android.content.Context
import android.os.Build
import android.provider.Settings
import com.example.ridego.BuildConfig
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

object DeviceSessionManager {
    
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    
    /**
     * Đăng ký thiết bị hiện tại khi người dùng đăng nhập
     */
    fun registerCurrentDevice(context: Context, onComplete: ((Boolean) -> Unit)? = null) {
        val user = auth.currentUser ?: run {
            onComplete?.invoke(false)
            return
        }
        
        val firebaseUid = user.uid
        val deviceId = getDeviceId(context)
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                val deviceData = hashMapOf(
                    "deviceName" to getDeviceName(context),
                    "deviceModel" to Build.MODEL,
                    "deviceOs" to "Android ${Build.VERSION.RELEASE}",
                    "appVersion" to try { BuildConfig.VERSION_NAME } catch (e: Exception) { "1.0" },
                    "lastActive" to Timestamp.now(),
                    "loginTime" to Timestamp.now(),
                    "isCurrentDevice" to true
                )
                
                db.collection("users").document(customUserId)
                    .collection("device_sessions")
                    .document(deviceId)
                    .set(deviceData)
                    .addOnSuccessListener {
                        onComplete?.invoke(true)
                    }
                    .addOnFailureListener {
                        onComplete?.invoke(false)
                    }
            }
            .addOnFailureListener {
                onComplete?.invoke(false)
            }
    }
    
    /**
     * Xóa session của thiết bị hiện tại khi người dùng đăng xuất
     */
    fun removeCurrentDevice(context: Context, onComplete: ((Boolean) -> Unit)? = null) {
        val user = auth.currentUser ?: run {
            onComplete?.invoke(false)
            return
        }
        
        val firebaseUid = user.uid
        val deviceId = getDeviceId(context)
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                db.collection("users").document(customUserId)
                    .collection("device_sessions")
                    .document(deviceId)
                    .delete()
                    .addOnSuccessListener {
                        onComplete?.invoke(true)
                    }
                    .addOnFailureListener {
                        onComplete?.invoke(false)
                    }
            }
            .addOnFailureListener {
                onComplete?.invoke(false)
            }
    }
    
    /**
     * Cập nhật thời gian hoạt động gần nhất
     */
    fun updateLastActive(context: Context) {
        val user = auth.currentUser ?: return
        val firebaseUid = user.uid
        val deviceId = getDeviceId(context)
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                db.collection("users").document(customUserId)
                    .collection("device_sessions")
                    .document(deviceId)
                    .update("lastActive", Timestamp.now())
            }
    }
    
    /**
     * Lấy số lượng thiết bị đang đăng nhập
     */
    fun getDeviceCount(onResult: (Int) -> Unit) {
        val user = auth.currentUser ?: run {
            onResult(0)
            return
        }
        
        val firebaseUid = user.uid
        
        db.collection("uid_mapping").document(firebaseUid).get()
            .addOnSuccessListener { mappingDoc ->
                val customUserId = if (mappingDoc.exists()) {
                    mappingDoc.getString("customUserId") ?: firebaseUid
                } else {
                    firebaseUid
                }
                
                db.collection("users").document(customUserId)
                    .collection("device_sessions")
                    .get()
                    .addOnSuccessListener { documents ->
                        onResult(documents.size())
                    }
                    .addOnFailureListener {
                        onResult(0)
                    }
            }
            .addOnFailureListener {
                onResult(0)
            }
    }
    
    private fun getDeviceId(context: Context): String {
        return Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
    }
    
    private fun getDeviceName(context: Context): String {
        // Ưu tiên lấy tên thiết bị do người dùng đặt
        val userDeviceName = try {
            Settings.Global.getString(context.contentResolver, "device_name")
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
}
