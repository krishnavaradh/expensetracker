import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacingX, spacingY } from "@/constants/theme";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { TransactionType, UserDataType, WalletType } from "@/types";
import { useAuth } from "@/contexts/authContext";
import { limit, orderBy, Timestamp, where } from "firebase/firestore";
import useFetchData from "@/hooks/useFetchData";
import TransactionList from "@/components/TransactionList";

const SearchModel = () => {
  const { user, setUser, updateUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const constraints = [where("uid", "==", user?.uid), orderBy("date", "desc")];

  const {
    data: allTransactions,
    error,
    loading: transactionLoading,
  } = useFetchData<TransactionType>("transactions", constraints);

  const filteredTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      if (
        item.category?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.type?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.description?.toLowerCase()?.includes(search?.toLowerCase())
      ) {
        return true;
      }
      return false;
    }
    return true;
  });
  //const [transactions, setTransactions] = useState<TransactionType[]>([]); // ✅ Add state
  const [transactions, setTransactions] = useState<TransactionType[]>([]);

  useEffect(() => {
    // ✅ Convert to string for deep equality check
    const oldTransactionsString = JSON.stringify(transactions);
    const newTransactionsString = JSON.stringify(allTransactions);

    if (oldTransactionsString !== newTransactionsString) {
      console.log("total transactions:", allTransactions.length);
      setTransactions(allTransactions);
    }
  }, [allTransactions]);

  return (
    <View style={styles.container}>
      <View>
        <Header
          title={"Search"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        {/* form */}

        <View style={styles.inputContainer}>
          {/* <Typo color={colors.neutral200}>Search</Typo> */}
          <Input
            placeholder="rental..."
            value={search}
            containerStyle={{ backgroundColor: colors.neutral800 }}
            placeholderTextColor={colors.neutral200}
            onChangeText={(value) => setSearch(value)}
          />
        </View>

        {/* <View style={{ flex: 1 }}>
          <TransactionList
            loading={transactionLoading}
            data={allTransactions}
            emptyListMessage="No transactions match your search keywords"
          />
        </View> */}

        <View
          style={[styles.container, { flex: 1, minHeight: "100%" }]}
          key={allTransactions.length}
        >
          {transactionLoading ? (
            <ActivityIndicator size="large" color={colors.primary} /> // ✅ Show a loader while data is fetching
          ) : (
            <TransactionList
              loading={transactionLoading}
              data={filteredTransactions || []} // ✅ Ensure it's always an array
              emptyListMessage="No transactions found"
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default SearchModel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingX._10,
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

  inputContainer: {
    gap: spacingY._10,
    paddingHorizontal: spacingX._10,
  },
});
