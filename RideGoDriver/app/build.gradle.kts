plugins {
    alias(libs.plugins.android.application)
    id("org.jetbrains.kotlin.android") // Tự động nhận bản 2.1.0 từ file gốc
    id("com.google.gms.google-services")
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
}

android {
    namespace = "com.example.ridego"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.ridego.driver"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        viewBinding = true
        dataBinding = true
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    val nav_version = "2.7.7" // Hoặc phiên bản mới nhất
    implementation("androidx.navigation:navigation-fragment-ktx:$nav_version")
    implementation("androidx.navigation:navigation-ui-ktx:$nav_version")
    implementation("com.google.android.gms:play-services-location:21.0.1")
    // Firebase (BOM + Auth)
    implementation(platform("com.google.firebase:firebase-bom:33.5.1"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-storage-ktx")
    implementation("com.google.android.gms:play-services-auth:20.7.0") // optional: Google Sign-In

    // hỗ trợ dùng Tasks.await() với Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.1.1")
    implementation("com.squareup.picasso:picasso:2.8")

    // Glide for image loading
    implementation("com.github.bumptech.glide:glide:4.16.0")

    // CardView
    implementation("androidx.cardview:cardview:1.0.0")

    // Map
    implementation("com.google.android.gms:play-services-maps:18.2.0")
    implementation("com.google.android.gms:play-services-location:21.0.1")
    implementation("com.google.android.libraries.places:places:3.3.0")

    implementation("com.google.dagger:hilt-android:2.51.1")
    kapt("com.google.dagger:hilt-compiler:2.51.1")

    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0") // Để tự đổi JSON sang Object

    // 2. SOCKET.IO (Để nhận thông báo Real-time)
    implementation("io.socket:socket.io-client:2.1.0")

    // Gson (Thư viện xử lý JSON của Google)
    implementation("com.google.code.gson:gson:2.10.1")

    // Supabase Storage (upload ảnh)
    implementation("io.github.jan-tennert.supabase:storage-kt:2.0.4")
    implementation("io.ktor:ktor-client-android:2.3.7")

    implementation("androidx.activity:activity-ktx:1.8.2")

    implementation("androidx.fragment:fragment-ktx:1.6.2")
}