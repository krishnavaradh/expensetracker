import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-gifted-charts";
import Typo from "@/components/Typo";
import Loading from "@/components/Loading";
import { useAuth } from "@/contexts/authContext";
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from "@/services/transactionService";
import TransactionList from "@/components/TransactionList";
import { useFocusEffect } from "expo-router";

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  // {
  //   value: 40,
  //   label: "Mon",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  //   topLabelComponent: () => (
  //     <Typo
  //       size={10}
  //       style={{
  //         paddingBottom: 18,
  //         width: 25,
  //         textAlign: "center",
  //         color: "white",
  //       }}
  //       fontWeight={"bold"}
  //     >
  //       50
  //     </Typo>
  //   ),
  // },
  // {
  //   value: 20,
  //   frontColor: colors.rose,
  //   gradientColor: "red",
  //   topLabelComponent: () => (
  //     <Typo
  //       size={10}
  //       style={{
  //         paddingBottom: 18,
  //         width: 25,
  //         textAlign: "center",
  //         color: "pink",
  //       }}
  //       fontWeight={"bold"}
  //     >
  //       50
  //     </Typo>
  //   ),
  // },
  // {
  //   value: 50,
  //   label: "Tue",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  // },
  // { value: 40, frontColor: colors.rose, gradientColor: "red" },
  // {
  //   value: 75,
  //   label: "Wed",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  // },
  // { value: 60, frontColor: colors.rose, gradientColor: "red" },
  // {
  //   value: 80,
  //   label: "Thu",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  // },
  // { value: 20, frontColor: colors.rose, gradientColor: "red" },
  // {
  //   value: 45,
  //   label: "Fri",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  // },
  // { value: 70, frontColor: colors.rose, gradientColor: "red" },
  // {
  //   value: 35,
  //   label: "Sat",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  // },
  // { value: 70, frontColor: colors.rose, gradientColor: "red" },
  // {
  //   value: 35,
  //   label: "Sun",
  //   spacing: scale(4),
  //   labelWidth: scale(30),
  //   frontColor: colors.primary,
  //   gradientColor: "green",
  // },
  // { value: 70, frontColor: colors.rose, gradientColor: "red" },

  useFocusEffect(
    useCallback(() => {
      getWeeklyStats(); // ✅ Always fetch fresh data when Statistics is focused
    }, [])
  );

  useEffect(() => {
    if (activeIndex == 0) {
      getWeeklyStats();
    }
    if (activeIndex == 1) {
      getMonthlyStats();
    }
    if (activeIndex == 2) {
      getYearlyStats();
    }
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    let res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      if (Array.isArray(res?.data?.stats)) {
        const flatData = res.data.stats.flat(); // ✅ Define flatData here

        setChartData(flatData); // ✅ Use flatData
        setTransactions(res?.data?.transactions);
      } else {
        console.error(
          "❌ stats is undefined or not an array:",
          res?.data?.stats
        );
        setChartData([]); // Set empty array to prevent errors
      }
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getMonthlyStats = async () => {
    setChartLoading(true);
    let res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      if (Array.isArray(res?.data?.stats)) {
        const flatData = res.data.stats.flat(); // ✅ Define flatData here

        setChartData(flatData); // ✅ Use flatData
        setTransactions(res?.data?.transactions);
      } else {
        console.error(
          "❌ stats is undefined or not an array:",
          res?.data?.stats
        );
        setChartData([]); // Set empty array to prevent errors
      }
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getYearlyStats = async () => {
    setChartLoading(true);
    let res = await fetchYearlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      if (Array.isArray(res?.data?.stats)) {
        const flatData = res.data.stats.flat(); // ✅ Define flatData here

        setChartData(flatData); // ✅ Use flatData
        setTransactions(res?.data?.transactions);
      } else {
        console.error(
          "❌ stats is undefined or not an array:",
          res?.data?.stats
        );
        setChartData([]); // Set empty array to prevent errors
      }
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Statistics" />
      </View>

      <ScrollView>
        <SegmentedControl
          values={["Week", "Month", "Year"]}
          selectedIndex={activeIndex}
          onChange={(event) => {
            setActiveIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          style={styles.segmentStyle}
          activeFontStyle={styles.segmentFontStyle}
          tintColor={colors.neutral200}
          backgroundColor={colors.neutral800}
          fontStyle={{ ...styles.segmentFontStyle, color: colors.neutral200 }}
        />

        <View style={styles.chartContainer}>
          {chartData.length > 0 && !chartLoading ? (
            <BarChart
              data={chartData}
              barWidth={scale(12)}
              //spacing={scale(15)}
              spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
              barBorderRadius={2}
              hideRules
              yAxisLabelPrefix="$"
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisLabelWidth={
                [1, 2].includes(activeIndex) ? scale(38) : scale(35)
              }
              yAxisTextStyle={{ color: colors.neutral350 }}
              xAxisLabelTextStyle={{
                color: colors.neutral350,
                fontSize: verticalScale(10),
              }}
              noOfSections={4}
              minHeight={5}
              isAnimated
              //animationDuration={1000}
              showGradient
            />
          ) : (
            <View style={styles.noChart} />
          )}

          {chartLoading && (
            <View style={styles.chartLoadingContainer}>
              <Loading color={colors.white} />
            </View>
          )}
        </View>

        {/* transactions */}
        <View style={{ marginTop: 20 }}>
          <TransactionList
            title="Transactions"
            //emptyListMessage="No transactions found"
            data={transactions}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    //position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  header: {},
  noChart: {
    backgroundColor: "rgba(0,0,0,0.6)",
    height: verticalScale(210),
  },
  container: {
    backgroundColor: colors.neutral900,
    flex: 1,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black,
  },
  searchIcon: {
    // backgroundColor: colors.neutral700,
    // alignItems: "center",
    // justifyContent: "center",
    // borderRadius: 100,
    // height: verticalScale(35),
    // width: verticalScale(35),
    // borderCurve: "continuous"
  },
});
