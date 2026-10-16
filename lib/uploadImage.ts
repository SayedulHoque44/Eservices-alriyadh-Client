"use client";
/**
 * Direct image upload (same presigned-URL flow as the previous project).
 *
 *   1. POST /api/admin/akama/upload-url { fileName, fileType, fileSize, folderName }
 *      -> { presignedUrl, Key }   (Key = "<folderName>/<timestamp>_<fileName>")
 *   2. PUT the file to presignedUrl      -> straight to S3
 *   3. the returned Key is sent with the record (imageKey) when it is saved
 *
 * The server re-checks the stored file before the record may use it.
 */
import axios from "axios";
import api from "./api";

// Folder inside the S3 bucket that holds this project's Akama images
export const AKAMA_FOLDER = "eservices-alriyadh/akama";

export async function uploadImage(
  file: File,
  folderName: string = AKAMA_FOLDER,
  onProgress?: (percent: number) => void,
): Promise<string> {
  // 1. Ask the API for a one-time upload URL (also validates type and size)
  const res = await api.post<{ data: { presignedUrl: string; Key: string } }>("/admin/akama/upload-url", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    folderName,
  });
  const { presignedUrl, Key } = res.data.data;

  // 2. Upload straight to S3. Content-Type must match what the URL was signed for.
  //    Plain axios (not `api`): the S3 URL is absolute and must not get our /api base URL.
  await axios.put(presignedUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: e => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  // 3. Key to save with the record
  return Key;
}
