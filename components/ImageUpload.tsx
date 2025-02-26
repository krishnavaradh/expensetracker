import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ImageUploadProps } from "@/types";
import * as Icons from "phosphor-react-native";
import { colors, radius } from "@/constants/theme";
import Typo from "./Typo";
import { scale, verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import { getFilePath } from "@/services/imageService";
import * as ImagePicker from "expo-image-picker";

const ImageUpload = ({
  file = null,
  onSelect,
  onClear,
  containerStyle,
  imageStyle,
  placeholder = "",
}: ImageUploadProps) => {
  const pickImage = async () => {
    console.log("🔥 onPickImage() Triggered!");

    try {
      // ✅ Step 1: Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("🛑 Permission Status:", status);

      if (status !== "granted") {
        Alert.alert("Permission Denied", "You need to allow access to photos.");
        return;
      }

      console.log("📂 Opening Image Picker...");

      // ✅ Step 2: Open Image Picker
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      console.log("🚀 Image Picker Result:", JSON.stringify(result, null, 2)); // Log full result

      if (result.canceled) {
        console.log("❌ Image Picker was canceled by the user");
        return;
      }

      const imageUri = result.assets?.[0]?.uri; // ✅ Extract image URI
      console.log("✅ Selected Image URI:", imageUri);

      if (!imageUri) {
        console.log("❌ No image URI found, something went wrong");
        return;
      }

      // ✅ Step 3: Update UI state with new image URI

      onSelect(result.assets[0]);
    } catch (error) {
      console.log("❌ Error in onPickImage():", error);
    }
  };
  return (
    <View>
      {!file && (
        <TouchableOpacity
          onPress={pickImage}
          style={[styles.inputContainer, containerStyle && containerStyle]}
        >
          <Icons.UploadSimple color={colors.neutral200} />
          {placeholder && <Typo size={15}>{placeholder}</Typo>}
        </TouchableOpacity>
      )}
      {file && (
        <View style={[styles.image, imageStyle && imageStyle]}>
          <Image
            style={{ flex: 1 }}
            source={getFilePath(file)}
            contentFit="cover"
            transition={100}
          />
          <TouchableOpacity onPress={onClear} style={styles.deleteIcon}>
            <Icons.XCircle
              size={verticalScale(24)}
              weight="fill"
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ImageUpload;

const styles = StyleSheet.create({
  inputContainer: {
    height: verticalScale(54),
    backgroundColor: colors.neutral700,
    borderRadius: radius._15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.neutral500,
    borderStyle: "dashed",
  },
  image: {
    height: scale(150),
    width: scale(150),
    borderRadius: radius._15,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  deleteIcon: {
    position: "absolute",
    top: scale(6),
    right: scale(6),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
