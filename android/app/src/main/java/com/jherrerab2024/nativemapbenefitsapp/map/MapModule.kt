package com.jherrerab2024.nativemapbenefitsapp.map

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task

class MapModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(reactContext)

    override fun getName(): String {
        return "MapModule"
    }

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        if (ActivityCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED || ActivityCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            promise.reject("LOCATION_PERMISSION_DENIED", "Permission denied for location access")
            return
        }

        val locationTask: Task<Location?> = fusedLocationClient.lastLocation
        locationTask.addOnSuccessListener(reactContext.currentActivity!!) { location ->
            Log.d("LOCATION VALUE: ", location.toString())
            if (location != null) {
                val locationArray: WritableArray = Arguments.createArray()
                locationArray.pushDouble(location.latitude)
                locationArray.pushDouble(location.longitude)
                promise.resolve(locationArray)
            } else {
                promise.reject("LOCATION_NOT_FOUND", "Location not found")
            }
        }.addOnFailureListener { e ->
            promise.reject("LOCATION_ERROR", "Error getting location: ${e.message}")
        }
    }
}
