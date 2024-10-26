import { Text, View } from "react-native";

export interface TitleProps {
  text: string;
}

const Title = ({ text }: TitleProps) => {
  return (
    <View className="elevation-lg p-[2] box-border w-full rounded-[10]">
      <View className="flex flex-col justify-center items-center w-full bg-white rounded-[8] px-4 py-2 box-border">
        <Text className="text-neutral-600 uppercase font-semibold">{text}</Text>
      </View>
    </View>
  );
};
export default Title;
