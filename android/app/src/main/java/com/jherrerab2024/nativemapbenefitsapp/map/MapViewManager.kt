package com.jherrerab2024.nativemapbenefitsapp.map

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.PolygonOptions
import kotlin.math.atan2


class MapViewManager : SimpleViewManager<MapView>(), OnMapReadyCallback,
    GoogleMap.OnMarkerClickListener {
    private var googleMap: GoogleMap? = null
    private lateinit var reactContext: ThemedReactContext
    private val COMMAND_SET_LOCATION = 1
    private val COMMAND_SET_MARKERS = 2

    override fun getName(): String {
        return "RCTMapView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): MapView {
        this.reactContext = reactContext
        val mapView = MapView(reactContext)
        mapView.onCreate(null)
        mapView.getMapAsync(this)
        return mapView
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        googleMap?.setOnMarkerClickListener(this)
    }

    private fun setMapLocation(lat: Double, lng: Double) {
        googleMap?.let {
            val location = LatLng(lat, lng)
            it.moveCamera(CameraUpdateFactory.newLatLngZoom(location, 15f))
        }
    }

    private fun setMarkers(currentLat: Double, currentLng: Double, stores: ReadableArray) {
        val location = "Ubicación Actual"
        googleMap?.let { map ->
            map.clear()
            val markerPositions = mutableListOf<LatLng>()
            val currentLocation = LatLng(currentLat, currentLng)
            val currentMarker = map.addMarker(
                MarkerOptions()
                    .position(currentLocation)
                    .title(location)
            )
            currentMarker?.tag = reactContext

            for (i in 0 until stores.size()) {
                val store: ReadableMap = stores.getMap(i)
                val storeLat = store.getDouble("lat")
                val storeLng = store.getDouble("lng")
                val storeName = store.getString("name")

                val storeLocation = LatLng(storeLat, storeLng)
                val storeMarker = map.addMarker(
                    MarkerOptions()
                        .position(storeLocation)
                        .title(storeName)
                )
                storeMarker?.tag = reactContext
                markerPositions.add(storeLocation)
            }

            map.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLocation, 15f))

            if (markerPositions.size >= 3) {
                val centroid = LatLng(
                    markerPositions.map { it.latitude }.average(),
                    markerPositions.map { it.longitude }.average()
                )

                val sortedPositions = markerPositions.sortedBy { position ->
                    atan2(
                        position.longitude - centroid.longitude,
                        position.latitude - centroid.latitude
                    )
                }

                val polygonOptions = PolygonOptions()
                    .addAll(sortedPositions)
                    .strokeColor(0xFF72C8C1.toInt())
                    .fillColor(0x5072C8C1)
                    .strokeWidth(3f)

                map.addPolygon(polygonOptions)
            }
        }
    }

    override fun onMarkerClick(marker: Marker): Boolean {
        val event: WritableMap = Arguments.createMap()
        val reactContext = marker.tag as? ThemedReactContext

        event.putString("title", marker.title)
        event.putDouble("latitude", marker.position.latitude)
        event.putDouble("longitude", marker.position.longitude)

        if (reactContext != null) {
            sendEvent(reactContext, "onMarkerPress", event)
        } else {
            Log.e("MapViewManager", "ReactContext doest not exist in <marker.tag> Object")
        }

        return false
    }

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.of(
            "setMapLocation", COMMAND_SET_LOCATION,
            "setMarkers", COMMAND_SET_MARKERS
        )
    }

    @Deprecated("Deprecated in Java")
    override fun receiveCommand(view: MapView, commandId: Int, args: ReadableArray?) {
        when (commandId) {
            COMMAND_SET_LOCATION -> {
                args?.let {
                    val lat = it.getDouble(0)
                    val lng = it.getDouble(1)
                    setMapLocation(lat, lng)
                }
            }

            COMMAND_SET_MARKERS -> {
                args?.let {
                    val currentLat = it.getDouble(0)
                    val currentLng = it.getDouble(1)
                    val stores = it.getArray(2)
                    setMarkers(currentLat, currentLng, stores)
                }
            }
        }
    }

    override fun onDropViewInstance(view: MapView) {
        view.onDestroy()
        super.onDropViewInstance(view)
    }
}
