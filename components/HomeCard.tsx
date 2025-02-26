import { ImageBackground, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import Typo from "./Typo";
import { scale, verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { orderBy, where } from "firebase/firestore";

const HomeCard = () => {
  const { user } = useAuth();
  const {
    data: wallets,
    error,
    loading: walletLoading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  // const getTotals = () => {
  //   return wallets.reduce(
  //     (totals: any, item: WalletType) => {
  //       totals.balance = totals.balance + Number(item.amount);
  //       totals.income = totals.income + Number(item.totalIncome);
  //       totals.expenses = totals.expenses + Number(item.totalExpenses);
  //       return totals;
  //     },
  //     { balance: 0, income: 0, expenses: 0 }
  //   );
  // };

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
    <ImageBackground
      source={require("../assets/images/card.png")}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        {/* Content inside the card */}
        <View style={styles.content}>
          {/* total balance */}
          <View style={styles.totalBalanceRow}>
            <Typo color={colors.neutral800} size={17} fontWeight={"500"}>
              Total Balance
            </Typo>
            <Icons.DotsThreeOutline
              color={colors.black}
              size={verticalScale(23)}
              weight="fill"
            />
          </View>
          <Typo color={colors.black} size={30} fontWeight={"bold"}>
            $ {walletLoading ? "----" : getTotals?.balance?.toFixed(2)}
          </Typo>
        </View>

        {/* total balance and income */}
        <View style={styles.stats}>
          {/* income */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Income
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} color={colors.green} fontWeight={"600"}>
                $ {walletLoading ? "----" : getTotals?.income?.toFixed(2)}
              </Typo>
            </View>
          </View>

          {/* expense */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Expense
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} color={colors.rose} fontWeight={"600"}>
                $ {walletLoading ? "----" : getTotals?.expenses?.toFixed(2)}
              </Typo>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
    overflow: "hidden", // ✅ Prevents content from breaking out
  },
  container: {
    //flex: 1,
    paddingHorizontal: scale(23),
    paddingVertical: spacingX._15,
    //marginTop: verticalScale(2),
    //gap: 10,
    width: "100%",
    height: "87%",
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._5,
  },
  content: {
    width: "99%",
    paddingVertical: spacingX._10,
  },
  balanceText: {
    fontSize: verticalScale(20),
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
  statsIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
});
