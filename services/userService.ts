import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const updateUser = async (
  uid: string,
  updatedData: UserDataType
): Promise<ResponseType> => {
  try {
    console.log("🚀 Updating Firestore User:", updatedData);

    // ✅ Upload image first if it's a local file
    if (updatedData.image && !updatedData.image.startsWith("http")) {
      console.log("🚀 Uploading Image to Cloudinary...");
      const imageUploadRes = await uploadFileToCloudinary(
        updatedData.image,
        "users"
      );

      if (!imageUploadRes.success) {
        console.log("❌ Image Upload Failed:", imageUploadRes.msg);
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload image",
        };
      }

      updatedData.image = imageUploadRes.data; // ✅ Save Cloudinary URL
      console.log("✅ Cloudinary URL:", updatedData.image);
    }

    // ✅ Check Firestore Reference
    const userRef = doc(firestore, "users", uid);
    console.log("📂 Firestore Reference:", userRef.path);

    await updateDoc(userRef, updatedData);

    console.log("✅ Firestore User Updated Successfully:", updatedData);

    return { success: true, msg: "Updated successfully", data: updatedData };
  } catch (error: any) {
    console.log("❌ Error updating user:", error);
    return { success: false, msg: error.message || "Could not update user" };
  }
};
