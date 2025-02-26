import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { orderBy, where } from "firebase/firestore";
import { useAuth } from "@/contexts/authContext";
import Loading from "@/components/Loading";
import WalletListItem from "@/components/WalletListItem";

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: wallets,
    error,
    loading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);
  //console.log("wallets: ", wallets.length);
  // const getTotalBalance = () =>
  //   wallets.reduce((total, item) => {
  //     total = total + (item.amount || 0);
  //     return total;
  //   }, 0);

  const getTotals = useMemo(() => {
    if (!wallets || wallets.length === 0)
      return { balance: 0, income: 0, expenses: 0 };

    let totalIncome = wallets.reduce(
      (sum, wallet) => sum + (wallet.totalIncome || 0),
      0
    );
    let totalExpenses = wallets.reduce(
      (sum, wallet) => sum + (wallet.totalExpenses || 0),
      0
    );
    let calculatedBalance = totalIncome - totalExpenses; // ✅ Correct balance calculation

    console.log("💰 Total Income:", totalIncome);
    console.log("💸 Total Expenses:", totalExpenses);
    console.log("✅ Calculated Balance:", calculatedBalance);

    return {
      balance: calculatedBalance,
      income: totalIncome,
      expenses: totalExpenses,
    };
  }, [wallets]); // ✅ Only re-compute when `wallets` data changes

  return (
    <View style={styles.container}>
      {/* balance view */}
      <View style={styles.balanceView}>
        <View style={{ alignItems: "center" }}>
          <Typo size={45} fontWeight={"500"}>
            ${getTotals?.balance.toFixed(2)}
          </Typo>
          <Typo size={16} color={colors.neutral300}>
            Total Balance
          </Typo>
        </View>
      </View>

      {/* Wallet */}
      <View style={styles.wallets}>
        {/* header */}
        <View style={styles.flexRow}>
          <Typo size={20} fontWeight={"500"}>
            My Wallets
          </Typo>
          <TouchableOpacity
            onPress={() => router.push("/(modals)/walletModal")}
          >
            <Icons.PlusCircle color={colors.primary} size={verticalScale(33)} />
          </TouchableOpacity>
        </View>

        {loading && <Loading />}
        <FlatList
          data={wallets}
          renderItem={({ item, index }) => {
            return <WalletListItem item={item} index={index} router={router} />;
          }}
          contentContainerStyle={styles.listStyle}
        />
      </View>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
    justifyContent: "space-between",
  },
  balanceView: {
    backgroundColor: colors.black,
    height: verticalScale(160),
    justifyContent: "center",
    alignContent: "center",
  },
  wallets: {
    backgroundColor: colors.neutral900,
    flex: 1,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});
