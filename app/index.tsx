import { BenefitCarousel, MapMarketView, Title } from "@/components";
import { BenefitDetail, BenefitMarker } from "@/interfaces";
import { getBenefits } from "@/services";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [benefits, setBenefits] = useState<BenefitDetail[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<
    BenefitMarker | undefined
  >();

  const handleBenefits = () => {
    getBenefits()
      .then((response: any) => {
        setBenefits((response.data as BenefitDetail[]) || []);
      })
      .catch((e) => {
        console.warn("SERVICE_ERROR: ", e);
      });
  };

  const handleMarkerPress = (event: BenefitMarker): void => {
    const { latitude, longitude, title } = event;
    setSelectedMarker(event);
  };

  useEffect(() => {
    handleBenefits();
  }, []);

  useEffect(() => {
    if (selectedMarker) {
      const foundBenefit: BenefitDetail | undefined = benefits.find(
        (benefit: BenefitDetail) => benefit.name === selectedMarker.title
      );
      if (foundBenefit) {
        setSelectedIndex(foundBenefit.id);
      }
    }
  }, [selectedMarker]);

  return (
    <View className="flex-1 relative">
      <MapMarketView
        benefits={benefits}
        handleMarkerPress={handleMarkerPress}
      />

      <View className="flex flex-col justify-center items-center absolute top-0 left-0 w-full box-border px-4 py-2">
        <Title text="Beneficios iO" />
      </View>

      <View className="absolute bottom-0 left-0 py-2 w-full box-border">
        <BenefitCarousel benefits={benefits} selectedIndex={selectedIndex} />
      </View>
    </View>
  );
}
