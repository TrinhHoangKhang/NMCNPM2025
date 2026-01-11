# Kotlin App Implementation Guide

This guide outlines how to implement the Rider application features in Kotlin for Android, based on the `RideGo` project structure.

## 1. Project Architecture

The application follows the **MVVM (Model-View-ViewModel)** architectural pattern combined with **Clean Architecture** principles.

- **UI Layer**: Activities and Fragments (e.g., `BookingActivity`, `HomeFragment`) handle user interactions.
- **ViewModel Layer**: Manages UI-related data and communication with the Repository (e.g., `BookingViewModel`).
- **Data Layer**:
    - **Repository**: Single source of truth for data (e.g., `BookingRepository`).
    - **API**: Retrofit interfaces for REST communication (`RideGoApiService`).
    - **Local**: Room database for caching if necessary.
    - **Real-time**: Socket.io manager (`SocketManager`).

## 2. Core Dependencies

Add the following to your `build.gradle.kts`:

```kotlin
dependencies {
    // Dependency Injection
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-android-compiler:2.50")

    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // Real-time
    implementation("io.socket:socket.io-client:2.1.0")

    // Maps (OpenStreetMap)
    implementation("org.osmdroid:osmdroid-android:6.1.16")
    
    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:33.5.1"))
    implementation("com.google.firebase:firebase-auth-ktx")
}
```

## 3. Real-time Implementation (WebSockets)

Use the `SocketManager` singleton to handle persistent connections and events.

```kotlin
@Singleton
class SocketManager @Inject constructor() {
    private var socket: Socket? = null

    fun connect() {
        socket = IO.socket("http://your-backend-url")
        socket?.connect()
    }

    fun onTripAccepted(listener: (JSONObject) -> Unit) {
        socket?.on("trip_accepted") { args ->
            val data = args[0] as JSONObject
            listener(data)
        }
    }
}
```

## 4. UI Flow: Booking a Ride

1. **Location Selection**: Use `osmdroid` to let users pick coordinates.
2. **API Call**: Call `bookRide` in the `BookingViewModel`.
3. **State Management**: Observe a `LiveData` or `StateFlow` in the Activity to show loading, success, or driver matched states.
4. **Socket Listening**: Once requested, listen for `trip_accepted` to update the UI with driver information.

## 5. Security

The app uses **Firebase Authentication** for user login. The ID token obtained from Firebase should be sent in the `Authorization` header for all REST requests (handled via an `AuthInterceptor` in Retrofit).
