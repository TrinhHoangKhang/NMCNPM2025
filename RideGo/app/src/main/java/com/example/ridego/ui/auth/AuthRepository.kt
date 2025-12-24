package com.example.ridego.data

import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

data class UserProfile(val uid: String, val name: String?, val email: String?)

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
            // Optional: save profile in Firestore
            val profile = mapOf(
                "uid" to user.uid,
                "name" to (name ?: user.displayName ?: ""),
                "email" to user.email
            )
            db.collection("users").document(user.uid).set(profile).await()
            Result.success(UserProfile(user.uid, user.displayName, user.email))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(email: String, password: String): Result<UserProfile> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            val user = result.user ?: throw Exception("No user")
            Result.success(UserProfile(user.uid, user.displayName, user.email))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Sign in using PhoneAuthCredential (used after OTP verification)
    suspend fun signInWithCredential(credential: PhoneAuthCredential): Result<UserProfile> {
        return try {
            val result = auth.signInWithCredential(credential).await()
            val user = result.user ?: throw Exception("No user")

            val phoneNumber = user.phoneNumber ?: ""  // Lấy số điện thoại

            val profile = UserProfile(
                uid = user.uid,
                name = user.displayName,
                email = user.email
            )

            // Lưu vào Firestore, thêm phoneNumber
            db.collection("users").document(user.uid).set(mapOf(
                "uid" to profile.uid,
                "name" to (profile.name ?: ""),
                "email" to (profile.email ?: ""),
                "phone" to phoneNumber  // Thêm dòng này
            )).await()

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

    fun currentUser(): UserProfile? {
        val u = auth.currentUser ?: return null
        return UserProfile(u.uid, u.displayName, u.email)
    }
    // Mới: Link phone credential vào user hiện tại (sau khi đăng ký email)
    suspend fun linkPhoneToCurrentUser(credential: PhoneAuthCredential): Result<UserProfile> {
        return try {
            val user = auth.currentUser ?: throw Exception("No current user")
            user.linkWithCredential(credential).await()

            val phoneNumber = user.phoneNumber ?: ""

            // Cập nhật phone vào Firestore profile
            db.collection("users").document(user.uid)
                .update("phone", phoneNumber).await()

            Result.success(UserProfile(user.uid, user.displayName, user.email))
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

            // Cập nhật email vào Firestore profile
            db.collection("users").document(user.uid)
                .update("email", email).await()

            Result.success(UserProfile(user.uid, user.displayName, email))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
