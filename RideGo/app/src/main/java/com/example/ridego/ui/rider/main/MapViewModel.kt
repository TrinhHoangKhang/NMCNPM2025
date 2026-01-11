package com.example.ridego.ui.rider.main

import androidx.lifecycle.ViewModel
import com.example.ridego.data.api.SocketManager
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val socketManager: SocketManager
) : ViewModel() {

    init {
        socketManager.connect()
    }

    override fun onCleared() {
        super.onCleared()
        // We might not want to disconnect if shared, but for this fragment scope it's ok.
        // Actually SocketManager is singleton, so maybe don't disconnect here if we want persistent connection.
        // But for clarity/safety in this demo:
        // socketManager.disconnect() 
    }
}
