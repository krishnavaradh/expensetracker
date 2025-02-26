import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  Transaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";
import { getAuth } from "firebase/auth";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { colors } from "@/constants/theme";

const auth = getAuth(); // ✅ Define Firebase Auth

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;
    if (!amount || amount < 0 || !walletId || !type) {
      return { success: true };
    }

    const auth = getAuth(); // ✅ Get the current user

    // ✅ Fetch the wallet to get its owner
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const walletData = walletSnapshot.data() as WalletType;
    const walletOwnerUid = walletData.uid; // ✅ Ensure we store the correct wallet owner

    // ✅ Include `walletOwnerUid` in the transaction data
    const newTransactionData = {
      ...transactionData,
      uid: auth.currentUser?.uid, // ✅ User who created the transaction
      walletOwnerUid, // ✅ Store the wallet owner's UID
    };

    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "transactions", id)
      );
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOriginal =
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.walletId != walletId;
      if (shouldRevertOriginal) {
        let res = await revertAndUpdateWallets(
          oldTransaction,
          Number(amount),
          type,
          walletId
        );
        if (!res.success) return res;
      }
    } else {
      //update wallet for new transaction
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      );
      if (!res.success) return res;
    }

    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        "transactions"
      );
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload image",
        };
      }
      newTransactionData.image = imageUploadRes.data; // ✅ Save Cloudinary URL
    } else {
      delete transactionData.image; // ✅ Remove image field if undefined
    }

    // ✅ Save the transaction with `walletOwnerUid`
    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    await setDoc(transactionRef, newTransactionData, { merge: true });

    return {
      success: true,
      data: { ...newTransactionData, id: transactionRef.id },
    };
  } catch (err: any) {
    console.log("error creating or updating transaction: ", err);
    return { success: false, msg: err.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    if (!walletSnapshot.exists()) {
      console.log("❌ Error: Wallet not found");
      return { success: false, msg: "Wallet not found" };
    }
    const walletData = walletSnapshot.data() as WalletType;

    console.log("🔍 Before Update - Wallet Data:", walletData);

    if (type == "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Selected wallet don't have enough balance",
      };
    }

    const updatedType = type == "income" ? "totalIncome" : "totalExpenses";
    // const updateWalletAmount =
    //   type == "income"
    //     ? Number(walletData.amount) + amount
    //     : Number(walletData.amount) - amount;

    // const updatedTotals =
    //   type == "income"
    //     ? Number(walletData.totalIncome) + amount
    //     : Number(walletData.totalExpenses) + amount;

    // await updateDoc(walletRef, {
    //   amount: updateWalletAmount,
    //   [updatedType]: updatedTotals,
    // });

    const updateWalletAmount =
      Number(walletData.amount || 0) + (type == "income" ? amount : -amount);

    const updatedTotals = Number(walletData[updatedType] || 0) + amount; // Ensures it's not undefined

    console.log("✅ After Calculation - New Amount:", updateWalletAmount);
    console.log("✅ After Calculation - New Income/Expense:", updatedTotals);

    await updateDoc(walletRef, {
      amount: updateWalletAmount,
      [updatedType]: updatedTotals,
    });

    // Fetch new wallet data after update
    const updatedWalletSnapshot = await getDoc(walletRef);
    const updatedWallet = updatedWalletSnapshot.data() as WalletType;
    console.log("🔍 After Update - Wallet Data:", updatedWallet);

    return { success: true };
  } catch (err: any) {
    console.log("error updating wallet for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
) => {
  try {
    const orignalWalletSnapshot = await getDoc(
      doc(firestore, "wallets", oldTransaction.walletId)
    );

    const orignalWallet = orignalWalletSnapshot.data() as WalletType;

    let newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId)
    );
    let newWallet = newWalletSnapshot.data() as WalletType;

    const revertType =
      oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

    const revertIncomeExpense: number =
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);

    // const revertedWalletAmount =
    //   Number(orignalWallet.amount) + revertIncomeExpense;

    // const revertedIncomeExpenseAmount =
    //   Number(orignalWallet[revertType]) - Number(oldTransaction.amount);

    const revertedWalletAmount =
      Number(orignalWallet.amount || 0) -
      (oldTransaction.type === "income"
        ? Number(oldTransaction.amount) // ✅ Subtract old income correctly
        : -Number(oldTransaction.amount)); // ✅ Add back old expense correctly

    const revertedIncomeExpenseAmount =
      Number(orignalWallet[revertType] || 0) - Number(oldTransaction.amount);

    if (newTransactionType == "expense") {
      //if user tries to convert income to expense on the same wallet
      // or if the user tries to increase the expense amount and don't have enough balance
      if (
        oldTransaction.walletId == newWalletId &&
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "The selected wallet don't have enough balance",
        };
      }

      // if user tries to add expense from a new wallet but the wallet don't have enough balance
      if (newWallet.amount! < newTransactionAmount) {
        return {
          success: false,
          msg: "The selected wallet don't have enough balance",
        };
      }
    }

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    // revert completed
    //////////////////////////////////////////////////////////////////////////

    // refetch the newwallet because we may have just updated it
    newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
    newWallet = newWalletSnapshot.data() as WalletType;

    const updateType =
      newTransactionType == "income" ? "totalIncome" : "totalExpenses";

    const updatedTransactionAmount: number =
      newTransactionType == "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

    const newIncomeExpenseAmount = Number(
      newWallet[updateType]! + Number(newTransactionAmount)
    );

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    return { success: true };
  } catch (err: any) {
    console.log("error updating wallet for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string
) => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId); // ✅ Fix collection name
    const oldTransactionSnapshot = await getDoc(transactionRef);

    if (!oldTransactionSnapshot.exists()) {
      console.log("❌ Error: Transaction not found in Firestore.");
      return { success: false, msg: "Transaction not found" };
    }

    const transactionData = oldTransactionSnapshot.data() as TransactionType;
    console.log("📄 Transaction Data:", transactionData);

    console.log("👤 Authenticated User UID:", auth.currentUser?.uid);
    console.log("📄 Transaction Owner UID:", transactionData?.uid);

    if (auth.currentUser?.uid !== transactionData?.uid) {
      console.log(
        "❌ Error: User does not have permission to delete this transaction."
      );
      return {
        success: false,
        msg: "Unauthorized to delete this transaction.",
      };
    }

    // Fetch wallet to update amount, totalIncome or totalExpenses
    const walletRef = doc(firestore, "wallets", walletId);
    const WalletSnapshot = await getDoc(walletRef);

    if (!WalletSnapshot.exists()) {
      console.log("❌ Error: Wallet not found in Firestore.");
      return { success: false, msg: "Wallet not found." };
    }

    const walletData = WalletSnapshot.data() as WalletType;
    console.log("💰 Wallet Data Before Update:", walletData);

    const transactionType = transactionData?.type;
    const transactionAmount = transactionData?.amount;
    const updateType =
      transactionType == "income" ? "totalIncome" : "totalExpenses";

    const newWalletAmount =
      walletData?.amount! -
      (transactionType == "income" ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

    if (transactionType == "expense" && newWalletAmount < 0) {
      console.log(
        "❌ Error: Cannot delete transaction, wallet balance would be negative."
      );
      return { success: false, msg: "You cannot delete this transaction" };
    }

    // Update Wallet
    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    // Delete Transaction
    await deleteDoc(transactionRef);
    console.log("✅ Transaction deleted successfully.");

    return { success: true };
  } catch (err: any) {
    console.log("❌ Error deleting transaction:", err);
    return { success: false, msg: err.message };
  }
};

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    // maping each transaction in day
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split("T")[0]; // as specific date

      const dayData = weeklyData.find((day) => day.date == transactionDate);

      if (dayData) {
        dayData.income = dayData.income || 0; // ✅ Ensure non-null income
        dayData.expense = dayData.expense || 0; // ✅ Ensure non-null expense

        if (transaction.type == "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type == "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });

    // Sort weeklyData in correct order before mapping
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    weeklyData.sort(
      (a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
    );

    // takes each day and creates two entries in an array
    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day, // ✅ Label only once
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
        gradientColor: "green",
      },
      {
        value: day.expense,

        frontColor: colors.rose,
        gradientColor: "red",
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (err: any) {
    console.log("❌ Error fetching weekly stats: ", err);
    return { success: false, msg: err.message };
  }
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setDate(today.getDate() - 12);

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const monthlyData = getLast12Months();
    const transactions: TransactionType[] = [];

    // process transactions to calculate income and expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();

      const monthName = transactionDate.toLocaleString("default", {
        month: "short",
      });
      const shortYear = transactionDate.getFullYear().toString().slice(-2);
      const monthData = monthlyData.find(
        (month) => month.month === `${monthName} ${shortYear}`
      );

      if (monthData) {
        if (transaction.type === "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthData.expense += transaction.amount;
        }
      }
    });

    // Reformat monthlyData for the bar chart with income and expense entries for each month
    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month, // ✅ Label only once
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
        gradientColor: "green",
      },
      {
        value: month.expense,

        frontColor: colors.rose,
        gradientColor: "red",
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (err) {
    console.log("❌ Error fetching weekly stats: ", err);
    return { success: false, msg: "Failed to fetch monthly transactions" };
  }
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;

    const transactionsQuery = query(
      collection(db, "transactions"),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const transactions: TransactionType[] = [];

    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
      const transactionDate = doc.data().date.toDate();
      return transactionDate < earliest ? transactionDate : earliest;
    }, new Date());

    const firstYear = firstTransaction.getFullYear();
    const currentYear = new Date().getFullYear();

    const yearlyData = getYearsRange(firstYear, currentYear);

    // process transactions to calculate income and expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionYear = (transaction.date as Timestamp)
        .toDate()
        .getFullYear();

      const yearData = yearlyData.find(
        (item: any) => item.year === transactionYear.toString()
      );

      if (yearData) {
        if (transaction.type === "income") {
          yearData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          yearData.expense += transaction.amount;
        }
      }
    });

    const stats = yearlyData.flatMap((year: any) => [
      {
        value: year.income,
        label: year.year, // ✅ Label only once
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary,
        gradientColor: "green",
      },
      {
        value: year.expense,

        frontColor: colors.rose,
        gradientColor: "red",
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (err) {
    console.log("❌ Error fetching yearly stats: ", err);
    return { success: false, msg: "Failed to fetch monthly transactions" };
  }
};
