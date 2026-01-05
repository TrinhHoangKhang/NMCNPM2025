package com.example.ridego.ui.rider.main

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.example.ridego.R
import dagger.hilt.android.AndroidEntryPoint
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay

@AndroidEntryPoint
class MapFragment : Fragment() {

    private lateinit var mapView: MapView
    private var myLocationOverlay: MyLocationNewOverlay? = null
    private val viewModel: MapViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val context = requireContext()
        Configuration.getInstance().load(context, context.getSharedPreferences("osm_pref", Context.MODE_PRIVATE))
        Configuration.getInstance().userAgentValue = context.packageName

        mapView = MapView(context)
        mapView.id = View.generateViewId()
        mapView.setTileSource(TileSourceFactory.MAPNIK)
        mapView.setMultiTouchControls(true)
        mapView.zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)
        
        val startPoint = GeoPoint(10.7721, 106.6983)
        mapView.controller.setZoom(18.0)
        mapView.controller.setCenter(startPoint)

        return mapView
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupMyLocation()
        // viewModel init triggers socket connection
    }

    private fun setupMyLocation() {
        myLocationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(requireContext()), mapView)
        myLocationOverlay?.enableMyLocation()
        myLocationOverlay?.enableFollowLocation()
        myLocationOverlay?.isDrawAccuracyEnabled = true
        mapView.overlays.add(myLocationOverlay)
    }

    override fun onResume() {
        super.onResume()
        mapView.onResume()
        myLocationOverlay?.enableMyLocation()
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
        myLocationOverlay?.disableMyLocation()
    }
}