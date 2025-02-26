import { Slot, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StatusBar, StyleSheet, Text } from "react-native";
import { useEffect, useState } from "react";
import { colors } from "@/constants/theme";
import { AuthProvider } from "@/contexts/authContext";

// ✅ Apply global white text color to ALL text components
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { color: "white" };
//const TEST_MODE = "true";

const Layout = () => {
  const router = useRouter();
  // const [isMounted, setIsMounted] = useState(false);
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // useEffect(() => {
  //   if (isMounted && TEST_MODE) {
  //     router.replace("../(models)/profileModels");
  //   }
  // }, [isMounted, router]);

  // if (TEST_MODE && !isMounted) {
  //   // Prevent rendering until the layout is mounted
  //   return null;
  // }

  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.stack, // ✅ Ensures all screens inherit black background
            }}
          >
            {/* ✅ Ensures Slot properly renders all child screens */}
            <Slot />
          </Stack>
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
};

export default Layout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral900, // ✅ Ensures SafeAreaView has a black background
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral900, // ✅ Enforces black background for all screens
  },
  stack: {
    backgroundColor: "black", // ✅ Ensures screens inside Stack inherit black background
  },
});
