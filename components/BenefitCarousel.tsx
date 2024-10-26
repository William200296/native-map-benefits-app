import { BenefitDetail } from "@/interfaces";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";
import CarouselItem from "./CarouselItem";

export type BenefitCarouselProps = {
  className?: string;
  benefits: BenefitDetail[];
  selectedIndex: number;
};

const BenefitCarousel = ({
  benefits,
  selectedIndex = 1,
}: BenefitCarouselProps) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const { width } = Dimensions.get("window");

  const animateSlide = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const applyBullets = (index: number) => {
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
        className="h-2 rounded-[4] bg-neutral-600 mx-1"
        style={{
          width: dotWidth,
          opacity,
        }}
      />
    );
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      const offset = (selectedIndex - 1) * width;
      (scrollViewRef.current as any).scrollTo({ x: offset, animated: true });
    }
  }, [selectedIndex, width]);

  return (
    <>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={animateSlide}
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
      <View className="flex flex-row justify-center mt-2 w-full">
        {benefits.map((_, index) => applyBullets(index))}
      </View>
    </>
  );
};

export default BenefitCarousel;
