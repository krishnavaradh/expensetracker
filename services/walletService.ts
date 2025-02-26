import { format } from "date-fns";
import {
  Timestamp,
  doc,
  setDoc,
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore"; // ✅ Add Timestamp import
import { firestore } from "@/config/firebase";
import { uploadFileToCloudinary } from "@/services/imageService"; // Ensure correct path
import { ResponseType, WalletType } from "@/types";
import { getAuth } from "firebase/auth";

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    let walletToSave = { ...walletData };

    // ✅ Upload Image to Cloudinary
    if (
      walletData.image &&
      typeof walletData.image === "object" &&
      walletData.image.uri
    ) {
      console.log("🚀 Uploading Wallet Image to Cloudinary...");
      const imageUploadRes = await uploadFileToCloudinary(
        { uri: walletData.image.uri },
        "wallets"
      );

      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload image",
        };
      }
      walletToSave.image = imageUploadRes.data; // ✅ Store Cloudinary URL
    }

    // ✅ Default values for new wallet
    if (!walletData?.id) {
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;

      // ✅ Store Firestore Timestamp
      walletToSave.created = Timestamp.now(); // ✅ Fixed Timestamp issue
    }

    const walletRef = walletData?.id
      ? doc(firestore, "wallets", walletData?.id)
      : doc(collection(firestore, "wallets"));

    await setDoc(walletRef, walletToSave, { merge: true });

    console.log("✅ Firestore Wallet Created:", {
      ...walletToSave,
      id: walletRef.id,
    });

    return { success: true, data: { ...walletToSave, id: walletRef.id } };
  } catch (error: any) {
    console.log("❌ Error creating or updating wallet:", error);
    return { success: false, msg: error.message };
  }
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    await deleteDoc(walletRef);
    deleteTransactionsByWalletId(walletId);

    return { success: true, msg: "Wallet deleted successfully" };
  } catch (err: any) {
    console.log("error deteting wallet: ", err);
    return { success: false, msg: err.message };
  }
};

export const deleteTransactionsByWalletId = async (
  walletId: string
): Promise<ResponseType> => {
  try {
    console.log("📡 Deleting transactions for wallet:", walletId);

    let hasMoreTransactions = true;

    while (hasMoreTransactions) {
      console.log("🔍 Checking walletId before query:", walletId);

      const transactionsQuery = query(
        collection(firestore, "transactions"),
        where("walletId", "==", walletId)
      );

      console.log("👀 Running Firestore query...");
      const transactionsSnapshot = await getDocs(transactionsQuery);
      console.log(
        "📡 Firestore Query Results:",
        transactionsSnapshot.docs.map((doc) => doc.data())
      );

      if (transactionsSnapshot.empty) {
        console.log(
          "🚨 No transactions found. Firestore might be blocking READ access."
        );
        hasMoreTransactions = false;
        break;
      }

      const batch = writeBatch(firestore);
      transactionsSnapshot.forEach((transactionDoc) => {
        console.log("✅ Deleting transaction:", transactionDoc.id);
        batch.delete(transactionDoc.ref);
      });

      await batch.commit();
      console.log("✅ Transactions deleted successfully.");
    }

    return { success: true, msg: "Transactions deleted successfully" };
  } catch (err: any) {
    console.log("❌ Error deleting wallet transactions:", err);
    return { success: false, msg: err.message };
  }
};
