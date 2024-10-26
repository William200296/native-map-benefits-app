import { useEffect, useRef } from "react";
import {
  findNodeHandle,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  UIManager,
  DeviceEventEmitter,
} from "react-native";
import NativeMapView from "./MapView";
import { BenefitDetail, BenefitMarker } from "@/interfaces";

export type MapMarketViewProps = {
  className?: string;
  benefits: BenefitDetail[];
  handleMarkerPress: (benefit: BenefitMarker) => void;
};

const requestPermissionData = {
  title: "Acceder a la ubicación",
  message: "Esta aplicación necesita acceder a tu ubicación",
  buttonNeutral: "Ask Me Later",
  buttonNegative: "Cancel",
  buttonPositive: "OK",
};

const MapMarketView = ({ benefits, handleMarkerPress }: MapMarketViewProps) => {
  const { MapModule } = NativeModules;
  const eventEmitter = new NativeEventEmitter(undefined);
  const mapViewRef = useRef(null);

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
            [lat, lng, benefits]
          );
        }
      }
    } catch (error) {
      console.warn("* LOCATION_ERROR: ", error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        requestPermissionData
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        fetchLocation();
      }
    } catch (err) {
      console.warn("* PERMISSION_ERROR: ", err);
    }
  };

  useEffect(() => {
    DeviceEventEmitter.addListener("onMarkerPress", (event: BenefitMarker) => {
      handleMarkerPress(event);
    });

    return () => {
      eventEmitter.removeAllListeners("onMarkerPress");
    };
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [mapViewRef.current]);

  return <NativeMapView ref={mapViewRef} style={{ flex: 1 }} />;
};

export default MapMarketView;
