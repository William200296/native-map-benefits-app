import { useEffect, useRef } from "react";
import {
  findNodeHandle,
  NativeModules,
  PermissionsAndroid,
  UIManager,
} from "react-native";
import NativeMapView from "./MapView";
import { BenefitDetail } from "@/interfaces";

export type MapMarketViewProps = {
  className?: string;
  benefits: BenefitDetail[];
};

const MapMarketView = (props: MapMarketViewProps) => {
  const { MapModule } = NativeModules;
  const mapViewRef = useRef(null);
  const latitude = -12.122978;
  const longitude = -76.9856739;

  const fetchLocation = async () => {
    try {
      if (mapViewRef.current) {
        const location = await MapModule.getCurrentLocation();
        const { lat, lng } = { lat: location[0], lng: location[1] };
        const reactTag = findNodeHandle(mapViewRef.current);

        if (reactTag) {
          UIManager.dispatchViewManagerCommand(
            reactTag,
            UIManager.getViewManagerConfig("RCTMapView").Commands.setMarkers,
            [lat, lng, props.benefits]
          );
        }
      }
    } catch (error) {
      console.error("* LOCATION_ERROR: ", error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Acceder a la ubicación",
          message: "Esta aplicación necesita acceder a tu ubicación",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        fetchLocation();
      }
    } catch (err) {
      console.warn("* PERMISSION_ERROR: ", err);
    }
  };

  const handleMarkerPress = (event: any) => {
    const { title, latitude, longitude } = event.nativeEvent;
    console.log(
      `Marcador presionado: ${title}, Lat: ${latitude}, Lng: ${longitude}`
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, [mapViewRef.current]);

  return (
    <NativeMapView
      ref={mapViewRef}
      style={{ flex: 1 }}
      onMarkerPress={(event: any) => {
        handleMarkerPress(event);
      }}
    />
  );
};

export default MapMarketView;
