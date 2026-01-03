package com.example.ridego.ui.booking

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ridego.data.api.SocketManager
import com.example.ridego.data.api.TripResponse
import com.example.ridego.data.model.Location
import com.example.ridego.data.repository.BookingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import org.json.JSONObject
import javax.inject.Inject

sealed class BookingState {
    object Idle : BookingState()
    object Loading : BookingState()
    data class BookingSuccess(val trip: TripResponse) : BookingState()
    data class Error(val message: String) : BookingState()
    data class TripUpdate(val status: String, val driverLoc: Location? = null) : BookingState()
}

@HiltViewModel
class BookingViewModel @Inject constructor(
    private val repository: BookingRepository,
    private val socketManager: SocketManager
) : ViewModel() {

    private val _bookingState = MutableLiveData<BookingState>(BookingState.Idle)
    val bookingState: LiveData<BookingState> = _bookingState

    init {
        socketManager.connect()
        listenToSocketEvents()
    }

    private fun listenToSocketEvents() {
        socketManager.on("tripUpdate") { args ->
            if (args.isNotEmpty()) {
                val data = args[0] as? JSONObject
                data?.let {
                    val status = it.optString("status")
                    // Parse driver location if available
                   // val driverLoc = ...
                    Log.d("BookingViewModel", "Trip Update: $status")
                    _bookingState.postValue(BookingState.TripUpdate(status))
                }
            }
        }
    }

    fun bookRide(pickup: Location, dropoff: Location, vehicleType: String, price: Double) {
        _bookingState.value = BookingState.Loading
        viewModelScope.launch {
            val result = repository.bookRide(pickup, dropoff, vehicleType, price)
            if (result.isSuccess) {
                val trip = result.getOrThrow()
                _bookingState.value = BookingState.BookingSuccess(trip)
                // Emit socket event if needed, but usually backend handles it after API call
                socketManager.emit("joinTrip", JSONObject().put("tripId", trip._id))
            } else {
                _bookingState.value = BookingState.Error(result.exceptionOrNull()?.message ?: "Booking failed")
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        socketManager.disconnect()
    }
}
