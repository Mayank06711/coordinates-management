import { putImagesOrPDFTos3, putLargeFilesTos3 } from "../services/aws.js";
import axios from "axios";
import fetch from "node-fetch";
import asyncHandler from "../utils/asysnHandler.js";
import apiError from "../utils/apiError.js";
import fs from "fs"

// POST /api/v1/aws/upload
const uploadOnS3 = asyncHandler(async (req, res) => {
    const file = req.file; // using multer so we have access to file
    if (!file) {
      throw new apiError(400, "File not found, Please upload the required file.");
    }
  
    const fileSizeInBytes = file.size; // in bytes
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // in MB
    let uplURL; // for
  
    if (fileSizeInMB > 5) {
      if (req.user.role !== "admin") {
        throw new apiError(403, "Forbidden: Only admins can upload large files");
      }
      uplURL = await putLargeFilesTos3(
        process.env.AWS_BUCKET,
        file.filename,
        file.mimetype,
        file.path,
        40
      );
    } else {
      uplURL = await putImagesOrPDFTos3(
        process.env.AWS_BUCKET,
        file.filename,
        file.mimetype,
        file.path,
        3600
      );
    }
  
    try {
      const response = await fetch(uplURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.mimetype,
          'Content-Length': file.size,
        },
        body: file,
       // duplex: 'half', // Ensure this is set for streams
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload file: ${response.statusText} - ${errorText}`);
      }
  
      console.log("Upload successful");
      fs.unlinkSync(file.path); // delete the local file after successful upload
      res.status(200).json({ message: "File uploaded successfully", URL: uplURL });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "File upload failed", error: error.message });
    }
});

// GET /api/v1/aws/object/:filename
const getObjectFromS3 = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  if(!filename){
    throw new apiError(404, "Object key is required");
  }
  try {
    
    res.status(200).json({ message: "Object received succesfully", obj: object });
  } catch (error) {
    console.error("Error getting object:", error);
    throw new apiError(500, "Internal Server Error");
  }})

export { uploadOnS3, getObjectFromS3 };
