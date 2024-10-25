import CarouselItem from "@/components/CarouselItem";
import MapMarketView from "@/components/MapMarketView";
import { BenefitDetail } from "@/interfaces";
import { getBenefits } from "@/services";
import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function Index() {
  const [benefits, setBenefits] = useState<BenefitDetail[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const handleBenefits = () => {
    getBenefits()
      .then((response: any) => {
        setBenefits((response.data as BenefitDetail[]) || []);
      })
      .catch((e) => {
        console.log("(E): ", e);
      });
  };

  useEffect(() => {
    handleBenefits();
  }, []);

  return (
    <View className="flex-1 relative">
      <MapMarketView benefits={benefits} />

      <View className="flex flex-col justify-center items-center absolute top-0 left-0 w-full box-border px-4 py-2">
        <View className="bg-neutral-400 p-[2] box-border w-full rounded-[10]">
          <View className="flex flex-col justify-center items-center w-full bg-white rounded-[8] px-4 py-2 box-border">
            <Text className="text-neutral-600 uppercase font-semibold">
              Beneficios
            </Text>
          </View>
        </View>
      </View>

      {/* <View className="absolute bottom-0 left-0 py-2 w-full box-border">
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {benefits.map((benefit: BenefitDetail, index: number) => (
            <CarouselItem benefit={benefit} key={index} />
          ))}
        </ScrollView>
      </View> */}
      <View className="absolute bottom-0 left-0 py-2 w-full box-border">
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {benefits.map((benefit, index) => (
            <View
              className="flex justify-center items-center"
              key={index}
              style={{ width }}
            >
              <CarouselItem benefit={benefit} />
            </View>
          ))}
        </Animated.ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {benefits.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={index}
                style={{
                  width: dotWidth,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#2BBA14",
                  marginHorizontal: 4,
                  opacity,
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
