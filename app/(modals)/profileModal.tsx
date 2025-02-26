import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacingY } from "@/constants/theme";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Image } from "expo-image";
import {
  getProfileImage,
  uploadFileToCloudinary,
} from "@/services/imageService";
import { scale, verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { UserDataType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/userService";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const ProfileModel = () => {
  //const { refreshKey } = useLocalSearchParams(); // ✅ Detect refresh change
  // useEffect(() => {
  //   console.log("Profile modal refreshed:", refreshKey);
  // }, [refreshKey]);
  const router = useRouter();
  const { user, setUser, updateUserData } = useAuth();

  const [userData, setUserData] = useState<UserDataType>({
    name: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // ✅ Force UI re-render

  useEffect(() => {
    console.log("🔄 Running useEffect - Checking User Data...");
    console.log("👤 User in Auth Context:", user);
    console.log("🖼️ Image from Firestore:", user?.image);

    setUserData((prev) => {
      console.log("🔄 Setting User Data in Update Profile...");
      console.log("📷 Previous Image:", prev.image);
      console.log("🆕 New Image:", user?.image);

      return {
        name: user?.name || "",
        image: user?.image
          ? `${user.image}?timestamp=${new Date().getTime()}`
          : "",
      };
    });
  }, [user]);

  const onPickImage = async () => {
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

      const imageUri = result.assets[0]?.uri; // ✅ Extract image URI
      console.log("✅ Selected Image URI:", imageUri);

      if (!imageUri) {
        console.log("❌ No image URI found, something went wrong");
        return;
      }

      // ✅ Step 3: Update UI state with new image URI
      setUserData((prev) => {
        console.log("🛠 Updating state with:", imageUri); // ✅ Debugging log
        return { ...prev, image: imageUri };
      });
    } catch (error) {
      console.log("❌ Error in onPickImage():", error);
    }
  };

  const onSubmit = async () => {
    let { name, image } = userData;

    if (!name.trim()) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }

    setLoading(true);
    console.log("🚀 Uploading new profile image...");

    let finalImageUri = image;

    // ✅ Log original file size
    if (image && !image.startsWith("http")) {
      const originalFile = await FileSystem.getInfoAsync(image);
      console.log("📂 Original File Size:", originalFile.size, "bytes");
    }

    // ✅ Compress Image
    if (image && !image.startsWith("http")) {
      try {
        console.log("🔧 Running Image Compression...");
        const compressed = await ImageManipulator.manipulateAsync(
          image,
          [{ resize: { width: 800 } }], // Resize to 800px
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        finalImageUri = compressed.uri;
        console.log("✅ Image compressed:", finalImageUri);

        // ✅ Log compressed file size
        const compressedFile = await FileSystem.getInfoAsync(finalImageUri);
        console.log("📂 Compressed File Size:", compressedFile.size, "bytes");
      } catch (error) {
        console.error("❌ Image compression failed:", error);
      }
    }

    // ✅ Upload to Cloudinary if needed
    if (finalImageUri && !finalImageUri.startsWith("http")) {
      console.log("🚀 Sending image to Cloudinary...");
      const uploadRes = await uploadFileToCloudinary(
        { uri: finalImageUri },
        "users"
      );

      if (!uploadRes.success) {
        setLoading(false);
        Alert.alert("Upload Error", uploadRes.msg);
        return;
      }

      console.log("✅ Image uploaded to Cloudinary:", uploadRes.data);
      finalImageUri = uploadRes.data;
    }

    // ✅ Update Firestore
    const res = await updateUser(user?.uid as string, {
      name,
      image: finalImageUri,
    });

    if (res.success) {
      console.log("✅ Firestore Updated:", res.data);

      // 🔥 Cache Busting: Add a timestamp to force React Native to reload the image
      setUser((prev) => ({
        ...prev,
        name: res.data?.name || prev.name,
        image: res.data?.image
          ? `${res.data.image}?timestamp=${new Date().getTime()}`
          : prev.image, // ✅ Forces fresh load
      }));

      console.log("✅ UI Updated with New Image");
    } else {
      console.log("❌ Firestore update failed:", res.msg);
    }

    setLoading(false);
    router.back(); // ✅ Navigate back instantly
  };

  return (
    <View style={styles.container}>
      <View>
        <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        {/* form */}
        <View style={styles.avatarContainer}>
          <Image
            key={userData.image} // 🔥 Ensures UI refreshes
            style={styles.avatar}
            source={{
              uri: userData.image
                ? `${userData.image}?timestamp=${new Date().getTime()}`
                : "",
            }}
          />

          <TouchableOpacity
            onPress={() => {
              console.log("📸 Edit Icon Clicked!"); // ✅ Debugging
              onPickImage();
            }}
            style={styles.editIcon}
          >
            <Icons.Pencil size={verticalScale(20)} color={colors.neutral800} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Typo color={colors.neutral200}>Name</Typo>
          <Input
            placeholder="Name"
            value={userData.name}
            onChangeText={(value) => setUserData({ ...userData, name: value })}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={"700"}>
            Update
          </Typo>
        </Button>
      </View>
    </View>
  );
};

export default ProfileModel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
    paddingVertical: spacingY._20,
    backgroundColor: colors.neutral900,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    backgroundColor: colors.neutral900,
    alignSelf: "center",
    position: "relative",
  },
  avatar: {
    backgroundColor: colors.neutral300,
    width: verticalScale(135),
    height: verticalScale(135),
    alignSelf: "center",
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },

  inputContainer: {
    gap: spacingY._10,
  },
  footer: {
    alignContent: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingY._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
});
