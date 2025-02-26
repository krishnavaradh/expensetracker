import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Slot, Tabs } from "expo-router";
import CustomTabs from "@/components/CustomTabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

// ✅ Set Global Text Color
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { color: "white" };

// ✅ Set Global View Background Color (Similar to Text.defaultProps)
View.defaultProps = View.defaultProps || {};
View.defaultProps.style = { backgroundColor: colors.neutral900 };

const Layout = () => {
  return (
    <View style={styles.container}>
      <Tabs
        tabBar={CustomTabs}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.neutral800 },
        }}
      >
        {/* ✅ Manually defining the correct order */}
        <Tabs.Screen name="index" />
        <Tabs.Screen name="statistics" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({
  safeArea: {},
  container: {
    flex: 1,
  },
  slotContainer: {
    flex: 1,

    // ✅ Ensures all screens inside <Slot /> inherit black
  },
  stack: {
    // ✅ Ensures screens inside Stack inherit black background
  },
});
