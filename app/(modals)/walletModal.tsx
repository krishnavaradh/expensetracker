import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacingX, spacingY } from "@/constants/theme";
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
import { UserDataType, WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/userService";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import ImageUpload from "@/components/ImageUpload";
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

const WalletModel = () => {
  // const { refreshKey } = useLocalSearchParams(); // ✅ Detect refresh change
  // useEffect(() => {
  //   console.log("Profile modal refreshed:", refreshKey);
  // }, [refreshKey]);

  const { user, setUser, updateUserData } = useAuth();
  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const oldWallet: { name: string; image: string; id: string } =
    useLocalSearchParams();

  useEffect(() => {
    if (oldWallet?.id) {
      setWallet({
        name: oldWallet?.name,
        image: oldWallet?.image,
      });
    }
  }, []);

  // useEffect(() => {
  //   if (!user) {
  //     console.log("🔄 Waiting for authentication...");
  //   } else {
  //     console.log("✅ User Loaded:", user);
  //   }
  // }, [user]);

  // const onPickImage = async () => {
  //   console.log("🔥 onPickImage() Triggered!");

  //   try {
  //     // ✅ Step 1: Request permission
  //     const { status } =
  //       await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     console.log("🛑 Permission Status:", status);

  //     if (status !== "granted") {
  //       Alert.alert("Permission Denied", "You need to allow access to photos.");
  //       return;
  //     }

  //     console.log("📂 Opening Image Picker...");

  //     // ✅ Step 2: Open Image Picker
  //     let result = await ImagePicker.launchImageLibraryAsync({
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 0.5,
  //     });

  //     console.log("🚀 Image Picker Result:", JSON.stringify(result, null, 2)); // Log full result

  //     if (result.canceled) {
  //       console.log("❌ Image Picker was canceled by the user");
  //       return;
  //     }

  //     const imageUri = result.assets?.[0]?.uri; // ✅ Extract image URI
  //     console.log("✅ Selected Image URI:", imageUri);

  //     if (!imageUri) {
  //       console.log("❌ No image URI found, something went wrong");
  //       return;
  //     }

  //     // ✅ Step 3: Update UI state with new image URI
  //     setUserData((prev) => {
  //       console.log("🛠 Updating state with:", imageUri); // ✅ Debugging log
  //       return { ...prev, image: imageUri };
  //     });
  //   } catch (error) {
  //     console.log("❌ Error in onPickImage():", error);
  //   }
  // };

  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy 'at' hh:mm:ss a 'UTC'XXX");
  };

  const onSubmit = async () => {
    let { name, image } = wallet;

    if (!name.trim() || !image) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }

    // Store raw timestamp in Firestore
    const createdAt = Timestamp.now(); // Firestore Timestamp format

    const data: WalletType = {
      name,
      image,
      uid: user?.uid,
      created: createdAt, // ✅ Store timestamp instead of a formatted string
      totalIncome: 0,
      totalExpenses: 0,
    };
    if (oldWallet?.id) data.id = oldWallet?.id;
    setLoading(true);
    console.log("🚀 Creating wallet entry in Firestore...");

    const res = await createOrUpdateWallet(data);
    if (res.success) {
      console.log("✅ Firestore Wallet Created:", res.data);
      router.back();
    } else {
      console.log("❌ Wallet creation failed:", res.msg);
    }

    setLoading(false);
  };

  const onDelete = async () => {
    if (!oldWallet?.id) return;
    setLoading(true);
    const res = await deleteWallet(oldWallet?.id);
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this wallet? \nThis will remove all the transaction related to this wallet",
      [
        {
          text: "Cancel",
          onPress: () => console.log("cancel delete"),
          style: "destructive",
        },
        {
          text: "Delete",
          onPress: () => onDelete(),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Header
          title={oldWallet?.id ? "Update Wallet" : "New Wallet"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        {/* form */}

        <View style={styles.inputContainer}>
          <Typo color={colors.neutral200}>Wallet Name</Typo>
          <Input
            placeholder="Salary"
            value={wallet.name}
            onChangeText={(value) => setWallet({ ...wallet, name: value })}
          />
        </View>
        <View style={styles.inputContainer}>
          <Typo color={colors.neutral200}>Wallet Icon</Typo>
          <ImageUpload
            file={wallet.image}
            onClear={() => setWallet({ ...wallet, image: null })}
            onSelect={(file) => setWallet({ ...wallet, image: file })}
            placeholder="Upload Image"
          />
        </View>
      </View>

      <View style={styles.footer}>
        {oldWallet?.id && !loading && (
          <Button
            onPress={showDeleteAlert}
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15,
            }}
          >
            <Icons.Trash
              color={colors.white}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={"700"}>
            {oldWallet?.id ? "Update Wallet" : "Add Wallet"}
          </Typo>
        </Button>
      </View>
    </View>
  );
};

export default WalletModel;

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
