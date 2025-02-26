import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  TransactionItemProps,
  TransactionListType,
  TransactionType,
} from "@/types";
import Typo from "./Typo";
import { FlashList } from "@shopify/flash-list";
import { expenseCategories, incomeCategory } from "@/constants/data";
import { verticalScale } from "@/utils/styling";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "expo-router";
const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage,
}: TransactionListType) => {
  const router = useRouter();

  const handleClick = (item: TransactionType) => {
    router.push({
      pathname: "/(modals)/transactionModal",
      params: {
        id: item?.id,
        type: item?.type,
        amount: item?.amount?.toString(),
        category: item?.category,
        date: (item.date as Timestamp)?.toDate()?.toISOString(),
        description: item?.description,
        image: item?.image,
        uid: item?.uid,
        walletId: item?.walletId,
      },
    });
  };
  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} fontWeight={"500"}>
          {title}
        </Typo>
      )}

      {/* <View style={styles.list}>
        <FlashList
          key={data.length} // ✅ Add key
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem
              item={item}
              index={index}
              handleClick={handleClick}
            />
          )}
          estimatedItemSize={60}
          contentContainerStyle={{ paddingBottom: 20 }} // ✅ Allowed properties
        />
      </View> */}

      <View
        style={{
          flex: 1,
        }}
      >
        {Array.isArray(data) && data.length > 0 ? ( // ✅ Prevents FlashList from rendering if empty
          <FlashList
            data={data}
            renderItem={({ item, index }) => (
              <TransactionItem
                item={item}
                index={index}
                handleClick={handleClick}
              />
            )}
            estimatedItemSize={60}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Typo style={{ textAlign: "center", marginTop: 20 }}>
            No transactions found
          </Typo>
        )}
      </View>

      {/* {!loading && data.length == 0 && <Typo>{emptyListMessage}</Typo>} */}
      {!loading && data.length === 0 && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Typo>{emptyListMessage}</Typo>
        </View>
      )}
    </View>
  );
};

const TransactionItem = ({
  item,
  index,
  handleClick,
}: TransactionItemProps) => {
  //console.log("item.descriptions", item?.description);
  //let category = expenseCategories["utilities"];
  let category =
    item?.type == "income" ? incomeCategory : expenseCategories[item.category!];
  const IconComponent = category.icon;

  const date = (item?.date as Timestamp)
    ?.toDate()
    ?.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "short",
    });
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity style={styles.row} onPress={() => handleClick(item)}>
        <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
          {IconComponent && (
            <IconComponent
              size={verticalScale(25)}
              weight="fill"
              color={colors.white}
            />
          )}
        </View>
        <View style={styles.categoryDec}>
          <Typo size={17}>{category.label}</Typo>
          <Typo
            size={12}
            color={colors.neutral400}
            textProps={{ numberOfLines: 1 }}
          >
            {item?.description}
          </Typo>
        </View>
        <View style={styles.amountDate}>
          <Typo
            fontWeight={"500"}
            color={item?.type == "income" ? colors.primary : colors.rose}
          >
            {`${item?.type == "income" ? "+ $" : "- $"}${item?.amount}`}
          </Typo>
          <Typo size={13} color={colors.neutral400}>
            {date}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  list: {
    flex: 1, // ✅ Ensure FlashList has enough space
  },
  row: {
    width: "100%",
    gap: spacingX._12,
    marginBottom: spacingX._12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // list with background color
    backgroundColor: colors.neutral800,
    padding: spacingY._10,
    paddingHorizontal: spacingX._10,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
  },
  categoryDec: { flex: 1, gap: 2.5 },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
});
