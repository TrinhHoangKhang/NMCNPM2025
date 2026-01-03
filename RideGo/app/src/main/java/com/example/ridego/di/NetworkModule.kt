package com.example.ridego.di

import com.example.ridego.data.api.RideGoApiService
import com.example.ridego.data.api.SocketManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "http://10.0.2.2:3001/" // Emulator localhost for 3001

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): RideGoApiService {
        return retrofit.create(RideGoApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideSocketManager(): SocketManager {
        return SocketManager()
    }
}