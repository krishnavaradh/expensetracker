import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useReducer } from "react";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";

const Index = () => {
  const router = useRouter();
  const { user, loading } = useAuth(); // ✅ Get authentication state

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (user) {
          router.replace("/(tabs)"); // ✅ Redirect to home if user is logged in
        } else {
          router.replace("/(auth)/welcome"); // ✅ Otherwise, go to Welcome
        }
      }, 1000);
    }
  }, [loading, user]); // ✅ Ensures it only runs when authentication is ready

  // useEffect(() => {
  //   setTimeout(() => {
  //     router.push("/(auth)/welcome");
  //   }, 1000);
  // }, []);
  return (
    <View style={styles.container}>
      <Image
        resizeMode="contain"
        style={styles.logo}
        source={require("../assets/images/splashImage.png")}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  logo: {
    height: "20%",
    aspectRatio: 1,
  },
});
