import {
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Button from "@/components/Button";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { verticalScale } from "@/utils/styling";
import { useAuth } from "@/contexts/authContext";
import { Colors } from "@/constants/Colors";
import * as Icons from "phosphor-react-native";
import HomeCard from "@/components/HomeCard";
import TransactionList from "@/components/TransactionList";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(30),
  ];

  const {
    data: recentTransactions,
    error: walletError,
    loading: transactionLoading,
  } = useFetchData<WalletType>("transactions", constraints);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ gap: 4 }}>
          <Typo size={16} color={colors.neutral400}>
            Hello,
          </Typo>
          <Typo size={20} fontWeight={"500"}>
            {user?.name}
          </Typo>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(modals)/searchModel")}
          style={styles.searchIcon}
        >
          <Icons.MagnifyingGlass
            size={verticalScale(22)}
            color={colors.neutral200}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* card */}
        <View>
          <HomeCard />
        </View>

        <TransactionList
          data={recentTransactions}
          loading={transactionLoading}
          title="Recent Transactions"
        />
      </ScrollView>

      <Button
        style={styles.floatingButton}
        onPress={() => router.push("/(modals)/transactionModal")}
      >
        <Icons.Plus
          color={colors.black}
          weight="bold"
          size={verticalScale(24)}
        />
      </Button>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral900,
    flex: 1,
    paddingHorizontal: spacingX._20,
    paddingTop: verticalScale(8), // Use padding instead of margin
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
