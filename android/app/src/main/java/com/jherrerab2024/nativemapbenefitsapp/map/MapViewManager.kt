package com.jherrerab2024.nativemapbenefitsapp.map

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions

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
        googleMap?.let { map ->
            map.clear()

            val currentLocation = LatLng(currentLat, currentLng)
            val currentMarker =
                map.addMarker(MarkerOptions().position(currentLocation).title("Ubicación Actual"))
            currentMarker?.tag = reactContext

            for (i in 0 until stores.size()) {
                val store: ReadableMap = stores.getMap(i)
                val storeLat = store.getDouble("lat")
                val storeLng = store.getDouble("lng")
                val storeName = store.getString("name") ?: "Tienda"

                val storeLocation = LatLng(storeLat, storeLng)
                val storeMarker =
                    map.addMarker(MarkerOptions().position(storeLocation).title(storeName))
                storeMarker?.tag = reactContext
            }

            map.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLocation, 15f))
        }
    }

    override fun onMarkerClick(marker: Marker): Boolean {
        Log.d("MapViewManager", "Marker clicked: ${marker.title}")
        val event: WritableMap = Arguments.createMap()
        event.putString("title", marker.title)
        event.putDouble("latitude", marker.position.latitude)
        event.putDouble("longitude", marker.position.longitude)

        val reactContext = marker.tag as? ThemedReactContext

        if (reactContext != null) {
            Log.d("reactContext", reactContext.toString())
            Log.d("HAS CODE 1", marker.hashCode().toString())
            reactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(marker.hashCode(), "onMarkerPress", event)
            Log.d("HAS CODE 2", marker.hashCode().toString())
        } else {
            Log.e("MapViewManager", "ReactContext no encontrado en marker.tag")
        }

        return false
    }

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.of(
            "setMapLocation", COMMAND_SET_LOCATION,
            "setMarkers", COMMAND_SET_MARKERS
        )
    }

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

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.of(
            "onMarkerPress", MapBuilder.of("registrationName", "onMarkerPress")
        )
    }

    override fun onDropViewInstance(view: MapView) {
        view.onDestroy()
        super.onDropViewInstance(view)
    }
}
