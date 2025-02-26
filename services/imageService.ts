import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import axios from "axios";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

import * as FileSystem from "expo-file-system";

/**
 * Uploads an image to Cloudinary and returns the URL.
 * @param file - The image file (URI or Cloudinary URL).
 * @param folderName - The folder where the image will be stored.
 * @returns A promise resolving to the Cloudinary URL or an error message.
 */
export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string
): Promise<ResponseType> => {
  try {
    if (!file) return { success: true, data: null };
    // ✅ If already a Cloudinary URL, no need to upload
    if (typeof file === "string" && file.startsWith("http")) {
      console.log("🔄 Image is already a Cloudinary URL, skipping upload.");
      return { success: true, data: file };
    }

    if (file && file.uri) {
      console.log("📂 Checking file existence...");
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        console.log("❌ File does not exist:", file.uri);
        return { success: false, msg: "Selected file does not exist." };
      }

      console.log("📂 Converting file to Base64...");
      const base64File = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64File) {
        console.log("❌ Failed to read file data.");
        return { success: false, msg: "Could not process file." };
      }

      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${base64File}`);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folderName);

      console.log("🚀 Uploading image to Cloudinary...");
      // const uploadResponse = await fetch(CLOUDINARY_API_URL, {
      //   method: "POST",
      //   body: formData,
      //   headers: {
      //     Accept: "application/json",
      //   },
      // });

      const { data } = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.secure_url) {
        console.log("✅ Cloudinary Upload Response:", data.secure_url);
        return { success: true, data: data.secure_url };
      } else {
        console.log("❌ Cloudinary Upload Error:", data);
        return { success: false, msg: "Cloudinary upload failed." };
      }

      //const uploadResult = await uploadResponse.json();
      //console.log("✅ Cloudinary Upload Response:", uploadResult);

      // if (uploadResult.secure_url) {
      //   return { success: true, data: uploadResult.secure_url };
      // } else {
      //   console.log("❌ Cloudinary Response Error:", uploadResult);
      //   return {
      //     success: false,
      //     msg:
      //       uploadResult.error?.message ||
      //       "Cloudinary did not return a secure URL.",
      //   };
      // }
    }

    //return { success: false, msg: "No valid file to upload." };
  } catch (error: any) {
    console.log("❌ Cloudinary Upload Error:", error);
    return { success: false, msg: error.message || "Upload failed." };
  }
};

/**
 * Retrieves the profile image URL.
 * @param file - Image file URL or object.
 * @returns The correct image URI.
 */
export const getProfileImage = (file: any) => {
  if (!file) return require("../assets/images/defaultAvatar.png");

  if (typeof file === "string" && file.startsWith("http")) {
    return { uri: file }; // ✅ Firebase Storage URL
  }

  if (typeof file === "string") {
    return { uri: file }; // ✅ Local file URI
  }

  return require("../assets/images/defaultAvatar.png");
};

/**
 * Extracts the file path from a file object or string.
 * @param file - The file object or string.
 * @returns The file path (URI) or null if invalid.
 */
export const getFilePath = (file: string | { uri?: string } | null) => {
  return typeof file === "string" ? file : file?.uri || null;
};
// export const getFilePath = (file: any) => {
//   if (file && typeof file === "string") return file;
//   if (file && typeof file === "object") return file.uri;

//   return null;
// };
