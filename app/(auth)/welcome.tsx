import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import Button from "@/components/Button";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { router, useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        {/* "Sign In" text at top-right */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.loginButton}
        >
          <Typo fontWeight={500}>Sign In</Typo>
        </TouchableOpacity>

        {/* Centered image near the top */}
        <Animated.Image
          entering={FadeIn.duration(500)}
          source={require("../../assets/images/welcome.png")}
          style={styles.welcomeImage}
        />
      </View>

      <View style={styles.footer}>
        <Animated.View
          entering={FadeInDown.duration(1000).springify().damping(12)}
          style={{ alignItems: "center" }}
        >
          <Typo size={30} fontWeight={"800"}>
            Always take control
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            of your finances
          </Typo>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(1000)
            .delay(100)
            .springify()
            .damping(12)}
          style={{ alignItems: "center", gap: 2 }}
        >
          <Typo size={17} color={colors.textLight}>
            Finances must be arranged to set a better
          </Typo>
          <Typo size={17} color={colors.textLight}>
            Lifestyle in future
          </Typo>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(1000)
            .delay(200)
            .springify()
            .damping(12)}
          style={styles.buttonContainer}
        >
          <Button onPress={() => router.push("/(auth)/login")}>
            <Typo size={22} color={colors.neutral900} fontWeight={600}>
              Get Started
            </Typo>
          </Button>
        </Animated.View>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._7, // Adds space from the top
    justifyContent: "space-between",
  },
  innerContainer: {
    width: "100%",
    paddingHorizontal: 20, // Ensures spacing from the screen edges
  },
  signInContainer: {
    alignSelf: "flex-end", // Moves "Sign In" to the right
  },
  signInText: {
    fontWeight: "500",
    fontSize: 16,
    color: "white",
  },
  topSection: {
    flex: 1,
    backgroundColor: "black", // ✅ Ensures background is not overridden
  },
  welcomeImage: {
    alignSelf: "center", // Centers the image horizontally
    marginTop: verticalScale(100), // Adds spacing between "Sign In" and image
    width: "100%", // Adjust size as needed
    height: verticalScale(300),
    resizeMode: "contain",
    backgroundColor: "black",
  },
  loginButton: {
    alignSelf: "flex-end", // Moves "Login" to the right
    marginRight: spacingX._20,
  },
  footer: {
    backgroundColor: colors.neutral900,
    shadowColor: "white",
    shadowOffset: { width: 0, height: -10 },
    alignItems: "center",
    marginTop: 40,
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(65),
    gap: spacingY._20,

    elevation: 10,
    shadowRadius: 25,
    shadowOpacity: 0.15,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
});
