// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false

    // SỬA DÒNG NÀY: Nâng từ "2.0.0" lên "2.1.0"
    id("org.jetbrains.kotlin.android") version "2.1.0" apply false

    id("com.google.gms.google-services") version "4.4.2" apply false
    id("com.google.dagger.hilt.android") version "2.51.1" apply false
}