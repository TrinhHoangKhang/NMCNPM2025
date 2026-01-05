package com.example.ridego.data

import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import kotlinx.coroutines.tasks.await

data class UserProfile(val uid: String, val name: String?, val email: String?)

// Helper function to generate custom user ID
fun generateCustomUserId(phone: String?, email: String?): String {
    val phoneStr = if (phone.isNullOrEmpty()) "none" else phone.replace("[^0-9]".toRegex(), "")
    val emailPrefix = if (email.isNullOrEmpty()) "none" else {
        email.substringBefore("@").lowercase().replace("[^a-z0-9]".toRegex(), "")
    }
    return "uid_${phoneStr}_${emailPrefix}"
}

class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    suspend fun register(email: String, password: String, name: String?): Result<UserProfile> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user ?: throw Exception("No user")
            if (!name.isNullOrBlank()) {
                val profileUpdates = UserProfileChangeRequest.Builder()
                    .setDisplayName(name)
                    .build()
                user.updateProfile(profileUpdates).await()
            }

            val firebaseUid = user.uid
            val phoneNumber = user.phoneNumber ?: ""
            val emailStr = user.email ?: email
            val userName = name ?: user.displayName ?: ""

            // Generate custom user ID
            val customUserId = generateCustomUserId(phoneNumber, emailStr)

            // Prepare user document with full format
            val userDoc = hashMapOf(
                "customUserId" to customUserId,
                "firebaseUid" to firebaseUid,
                "email" to emailStr,
                "name" to userName,
                "phone" to phoneNumber,
                "role" to "RIDER",
                "isVerified" to false,
                "authMethod" to "email",
                "createdAt" to FieldValue.serverTimestamp(),
                "createdAtISO" to System.currentTimeMillis().toString(),
                "createdAtUnix" to System.currentTimeMillis(),
                "updatedAt" to FieldValue.serverTimestamp()
            )

            // Save to Firestore using customUserId as Document ID
            db.collection("users").document(customUserId).set(userDoc).await()

            // Create mapping Firebase UID -> customUserId
            val mapping = hashMapOf(
                "customUserId" to customUserId,
                "createdAt" to FieldValue.serverTimestamp()
            )
            db.collection("uid_mapping").document(firebaseUid).set(mapping).await()

            Result.success(UserProfile(customUserId, userName, emailStr))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(email: String, password: String): Result<UserProfile> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            val user = result.user ?: throw Exception("No user")
            
            val firebaseUid = user.uid
            
            // Get customUserId from uid_mapping
            val mappingDoc = db.collection("uid_mapping").document(firebaseUid).get().await()
            val customUserId = if (mappingDoc.exists()) {
                mappingDoc.getString("customUserId") ?: firebaseUid
            } else {
                // Fallback: nếu chưa có mapping (user cũ), tạo mới
                val phoneNumber = user.phoneNumber ?: ""
                val emailStr = user.email ?: email
                val newCustomUserId = generateCustomUserId(phoneNumber, emailStr)
                
                // Create mapping
                val mapping = hashMapOf(
                    "customUserId" to newCustomUserId,
                    "createdAt" to FieldValue.serverTimestamp()
                )
                db.collection("uid_mapping").document(firebaseUid).set(mapping).await()
                
                newCustomUserId
            }
            
            // Update lastLogin
            db.collection("users").document(customUserId)
                .update("lastLogin", FieldValue.serverTimestamp()).await()
            
            Result.success(UserProfile(customUserId, user.displayName, user.email))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Sign in with Google
    suspend fun signInWithGoogle(idToken: String): Result<UserProfile> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            val result = auth.signInWithCredential(credential).await()
            val user = result.user ?: throw Exception("No user")

            val firebaseUid = user.uid
            val phoneNumber = user.phoneNumber ?: ""
            val emailStr = user.email ?: ""
            val userName = user.displayName ?: ""

            // Generate custom user ID
            val customUserId = generateCustomUserId(phoneNumber, emailStr)

            // Kiểm tra xem user đã tồn tại trong Firestore chưa
            val userDoc = db.collection("users").document(customUserId).get().await()
            
            if (!userDoc.exists()) {
                // Chưa có → Tạo mới với thông tin từ Google
                val userDocData = hashMapOf(
                    "customUserId" to customUserId,
                    "firebaseUid" to firebaseUid,
                    "email" to emailStr,
                    "name" to userName,
                    "phone" to phoneNumber,
                    "photoUrl" to (user.photoUrl?.toString() ?: ""),
                    "role" to "RIDER",
                    "isVerified" to true,
                    "authMethod" to "google",
                    "createdAt" to FieldValue.serverTimestamp(),
                    "createdAtISO" to System.currentTimeMillis().toString(),
                    "createdAtUnix" to System.currentTimeMillis(),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                db.collection("users").document(customUserId).set(userDocData).await()

                // Create mapping Firebase UID -> customUserId
                val mapping = hashMapOf(
                    "customUserId" to customUserId,
                    "createdAt" to FieldValue.serverTimestamp()
                )
                db.collection("uid_mapping").document(firebaseUid).set(mapping).await()
            } else {
                // Đã có → Chỉ update photoUrl và lastLogin
                val updates = hashMapOf<String, Any>(
                    "photoUrl" to (user.photoUrl?.toString() ?: ""),
                    "lastLogin" to FieldValue.serverTimestamp()
                )
                db.collection("users").document(customUserId).update(updates).await()
            }

            Result.success(UserProfile(customUserId, userName, emailStr))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Sign in using PhoneAuthCredential (used after OTP verification)
    suspend fun signInWithCredential(credential: PhoneAuthCredential): Result<UserProfile> {
        return try {
            val result = auth.signInWithCredential(credential).await()
            val user = result.user ?: throw Exception("No user")

            val firebaseUid = user.uid
            val phoneNumber = user.phoneNumber ?: ""
            val email = user.email ?: ""
            val name = user.displayName ?: ""

            // Generate custom user ID
            val customUserId = generateCustomUserId(phoneNumber, email)

            // Kiểm tra xem user đã tồn tại chưa
            val userDoc = db.collection("users").document(customUserId).get().await()
            
            if (!userDoc.exists()) {
                // Chưa có → Tạo mới
                val newUserDoc = hashMapOf(
                    "customUserId" to customUserId,
                    "firebaseUid" to firebaseUid,
                    "email" to email,
                    "name" to name,
                    "phone" to phoneNumber,
                    "role" to "RIDER",
                    "isVerified" to true,
                    "authMethod" to "phone",
                    "createdAt" to FieldValue.serverTimestamp(),
                    "createdAtISO" to System.currentTimeMillis().toString(),
                    "createdAtUnix" to System.currentTimeMillis(),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                db.collection("users").document(customUserId).set(newUserDoc).await()

                // Create mapping Firebase UID -> customUserId
                val mapping = hashMapOf(
                    "customUserId" to customUserId,
                    "createdAt" to FieldValue.serverTimestamp()
                )
                db.collection("uid_mapping").document(firebaseUid).set(mapping).await()
            } else {
                // Đã có → Chỉ update lastLogin
                db.collection("users").document(customUserId)
                    .update("lastLogin", FieldValue.serverTimestamp()).await()
            }

            val profile = UserProfile(
                uid = customUserId,
                name = name.ifEmpty { null },
                email = email.ifEmpty { null }
            )

            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun sendEmailVerification(): Result<Unit> {
        return try {
            val user = auth.currentUser ?: throw Exception("No user")
            user.sendEmailVerification().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun isEmailVerified(): Result<Boolean> {
        return try {
            val user = auth.currentUser ?: throw Exception("No user")
            user.reload().await()
            Result.success(user.isEmailVerified)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        auth.signOut()
    }

    suspend fun currentUser(): UserProfile? {
        return try {
            val u = auth.currentUser ?: return null
            val firebaseUid = u.uid
            
            // Get customUserId from uid_mapping
            val mappingDoc = db.collection("uid_mapping").document(firebaseUid).get().await()
            val customUserId = if (mappingDoc.exists()) {
                mappingDoc.getString("customUserId") ?: firebaseUid
            } else {
                firebaseUid
            }
            
            UserProfile(customUserId, u.displayName, u.email)
        } catch (e: Exception) {
            null
        }
    }
    // Mới: Link phone credential vào user hiện tại (sau khi đăng ký email)
    suspend fun linkPhoneToCurrentUser(credential: PhoneAuthCredential): Result<UserProfile> {
        return try {
            val user = auth.currentUser ?: throw Exception("No current user")
            user.linkWithCredential(credential).await()

            val firebaseUid = user.uid
            val phoneNumber = user.phoneNumber ?: ""
            val emailStr = user.email ?: ""

            // Get old customUserId from uid_mapping
            val mappingDoc = db.collection("uid_mapping").document(firebaseUid).get().await()
            val oldCustomUserId = mappingDoc.getString("customUserId") ?: firebaseUid

            // Generate NEW customUserId with phone
            val newCustomUserId = generateCustomUserId(phoneNumber, emailStr)

            if (oldCustomUserId != newCustomUserId) {
                // Lấy data cũ
                val oldDoc = db.collection("users").document(oldCustomUserId).get().await()
                if (oldDoc.exists()) {
                    val oldData = oldDoc.data?.toMutableMap() ?: mutableMapOf()
                    
                    // Update data với phone mới và customUserId mới
                    oldData["customUserId"] = newCustomUserId
                    oldData["phone"] = phoneNumber
                    oldData["updatedAt"] = FieldValue.serverTimestamp()
                    
                    // Tạo document mới với customUserId mới
                    db.collection("users").document(newCustomUserId).set(oldData).await()
                    
                    // Xóa document cũ
                    db.collection("users").document(oldCustomUserId).delete().await()
                    
                    // Update mapping
                    db.collection("uid_mapping").document(firebaseUid)
                        .update("customUserId", newCustomUserId).await()
                }
                
                Result.success(UserProfile(newCustomUserId, user.displayName, emailStr))
            } else {
                // Nếu customUserId không đổi (trường hợp đã có phone), chỉ update phone
                db.collection("users").document(oldCustomUserId)
                    .update("phone", phoneNumber, "updatedAt", FieldValue.serverTimestamp()).await()
                
                Result.success(UserProfile(oldCustomUserId, user.displayName, emailStr))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Mới: Link email credential vào user hiện tại (sau khi đăng ký phone)
    suspend fun linkEmailToCurrentUser(email: String, password: String): Result<UserProfile> {
        return try {
            val user = auth.currentUser ?: throw Exception("No current user")
            val credential = EmailAuthProvider.getCredential(email, password)
            user.linkWithCredential(credential).await()

            val firebaseUid = user.uid
            val phoneNumber = user.phoneNumber ?: ""

            // Get old customUserId from uid_mapping
            val mappingDoc = db.collection("uid_mapping").document(firebaseUid).get().await()
            val oldCustomUserId = mappingDoc.getString("customUserId") ?: firebaseUid

            // Generate NEW customUserId with email
            val newCustomUserId = generateCustomUserId(phoneNumber, email)

            if (oldCustomUserId != newCustomUserId) {
                // Lấy data cũ
                val oldDoc = db.collection("users").document(oldCustomUserId).get().await()
                if (oldDoc.exists()) {
                    val oldData = oldDoc.data?.toMutableMap() ?: mutableMapOf()
                    
                    // Update data với email mới và customUserId mới
                    oldData["customUserId"] = newCustomUserId
                    oldData["email"] = email
                    oldData["updatedAt"] = FieldValue.serverTimestamp()
                    
                    // Tạo document mới với customUserId mới
                    db.collection("users").document(newCustomUserId).set(oldData).await()
                    
                    // Xóa document cũ
                    db.collection("users").document(oldCustomUserId).delete().await()
                    
                    // Update mapping
                    db.collection("uid_mapping").document(firebaseUid)
                        .update("customUserId", newCustomUserId).await()
                }
                
                Result.success(UserProfile(newCustomUserId, user.displayName, email))
            } else {
                // Nếu customUserId không đổi, chỉ update email
                db.collection("users").document(oldCustomUserId)
                    .update("email", email, "updatedAt", FieldValue.serverTimestamp()).await()
                
                Result.success(UserProfile(oldCustomUserId, user.displayName, email))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
