import {
  putImagesOrPDFTos3,
  putLargeFilesTos3,
  getObjectFromS3,
  listObjectsFromS3,
  deleteObjectsFromS3,
} from "../services/aws.js";
import fetch from "node-fetch";
import asyncHandler from "../utils/asysnHandler.js";
import apiError from "../utils/apiError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import s3Client from "../config/aws.config.js";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

let keyGet;

// POST /api/v1/aws/upload
const uploadOnS3 = asyncHandler(async (req, res) => {
  const file = req.file; // using multer so we have access to file
  if (!file) {
    throw new apiError(400, "File not found, Please upload the required file.");
  }

  const fileSizeInBytes = file.size; // in bytes
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // in MB
  let uplURL; // for

  keyGet = file.filename;
  console.log(keyGet, "filename");
  let s3Response;
  try {
    if (fileSizeInMB > 5) {
      if (req.user.role !== "admin") {
        throw new apiError(
          403,
          "Forbidden: Only admins can upload files greater than 5 MB"
        );
      }
      uplURL = await putLargeFilesTos3(
        process.env.AWS_BUCKET,
        file.filename, //  it is the objevct key save it some where to access object later
        file.mimetype,
        60
      );
      s3Response = await fetch(uplURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.mimetype,
          "Content-Length": file.size,
        },
        body: fs.createReadStream(file.path),
      });
    } else {
      uplURL = await putImagesOrPDFTos3(
        process.env.AWS_BUCKET,
        file.filename,
        file.mimetype,
        3600
      );
      // read the file into a Buffer for smaller files
      const fileBuffer = await fs.promises.readFile(file.path);
      s3Response = await fetch(uplURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.mimetype,
          "Content-Length": file.size,
        },
        body: fileBuffer,
      });
    }
    if (!s3Response.ok) {
      //const errorText = await response.text();
      console.log(
        `\n\nStatus: ${s3Response.status} ${s3Response.statusText} \n ok : ${s3Response.ok}`
      );
      console.log(`\n\nHeaders: ${JSON.stringify(s3Response.headers)}`);
      console.log(`\n\nBody: ${await s3Response.text()}`);
      console.log("\n 2 \n");
      throw new apiError(
        s3Response.status,
        `Failed to upload file: ${s3Response.statusText}`
      );
    }
    fs.unlinkSync(file.path); // deleting local file after successful upload
    res.status(s3Response.status).json({
      message: "File uploaded successfully",
      status: s3Response.status,
      statusText: s3Response.statusText,
      // data: s3Response.body, as On uploading something with PUT method on S3 using preSigned url AWS does not respond with any data only it gives status 200 and text ok so response.body will be empty
    });
  } catch (error) {
    fs.unlinkSync(file.path); // deleting local even if upload fails
    // Throwing Error: This keeps your code DRY (Don't Repeat Yourself) so next time when  arein diubt which us better thrwoing errro or sending response always choose throwing errr and let Centralised middleware do their work of errror handiling
    throw new apiError(500, "File upload failed", null, error.message);
  }
});

// GET /api/v1/aws/object/:keyName
const getObjectS3 = asyncHandler(async (req, res) => {
  const { keyName } = req.params;
  if (!keyName) {
    throw new apiError(404, "Object keyName is required");
  }
  try {
    // to make it more faster it shouuld be accessible publicly
    const getURL = await getObjectFromS3(process.env.AWS_BUCKET, keyName, 3600);
    const data = await fetch(getURL, {
      method: "GET",
    });
    if (!data.ok) {
      console.log(
        `\n\nStatus: ${data.status} ${data.statusText} \n ok : ${data.ok}`
      );
      throw new Error(`Failed to get object: ${data.statusText}`);
    }

    /*
     // 1 Can redirect to original url
     // return res.redirect(getURL);
     */

    //1  Can Directly SEND IMAGE TO USER/CLIENT by streaming whole data to user, avoid loading the image into memory on your server, which can be more efficient and scalable
    // Set the correct headers for the response
    res.setHeader("Content-Type", data.headers.get("Content-Type"));
    res.setHeader("Content-Length", data.headers.get("Content-Length"));
    data.body.pipe(res); // stream the image data directly to the client.

    /*
    // Can also save the file locally and send
    // Define the local file path where the image will be saved
    // Get the current file path and directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Ensure that the uploads directory exists
    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Define the local file path where the image will be saved
    const filePath = path.join(uploadDir, keyName);

    // Create a write stream to save the file locally
    const fileStream = fs.createWriteStream(filePath);
    // Once the file is saved, send a response back to the client
    data.body.pipe(fileStream);
    fileStream.on("finish", () => {
      console.log(`File saved locally at ${filePath}`);
      res.status(200).json({
        message: "Object received and saved successfully",
        localPath: filePath,
      });
    });

    fileStream.on("error", (error) => {
      console.error("Error saving the file:", error);
      throw new apiError(500, `Internal Server Error - ${error?.message}`);
    });
    */

    //-3 CAN SHARE URL TO GET OBJECT
    // res.status(200).sjson({ message: "Object received succesfully", url: getURL });
  } catch (error) {
    console.error("Error getting object:", error);
    throw new apiError(500, `Internal Server Error - ${error?.message}`);
  }
});

// GET /api/v1/aws/objects/list
const getListObjectS3 = asyncHandler(async (req, res) => {});

// DELETE /api/v1/aws/object/del
// const delObjectS3 = asyncHandler(async (req, res) => {
//   const { keyName } = req.body; // keyName as an array in the request bod
//   if (!keyName || !Array.isArray(keyName) || keyName.length === 0) {
//     throw new apiError(
//       400,
//       "An array of keyNames with minimum length 1 is required"
//     );
//   }
//    // Create a new variable to store unique keys, since keyName is a constant
//    const uniqueKeyNames = [...new Set(keyName)];
//   try {
//     const delRes = await deleteObjectsFromS3(process.env.AWS_BUCKET, uniqueKeyNames);
//     console.log(delRes.Deleted, " \n \n AWS_DEletedObjectsFromS3");
//     if (!delRes || !delRes.Deleted) {
//       throw new apiError(
//         delRes.$metadata.httpStatusCode,
//         `Failed to delete objects: ${keyName.join(", ")}`
//       );
//     }
//     res.status(200).json({
//       message: "Objects deleted successfully",
//       deletedKeys: delRes.Deleted.map((obj) => obj.Key),
//       errors: delRes.Errors || [],
//     });
//   } catch (error) {
//     console.error("Error deleting object:", error);
//     throw new apiError(
//       500,
//       ` Something went wrong while deleting object: ${error.message}`
//     );
//   }
// });

// DELETE /api/v1/aws/object/del
const delObjectS3 = asyncHandler(async (req, res) => {
  const { keyName } = req.body; // Expecting keyName as an array in the request body

  // Ensure keyName is an array and has at least one element
  if (!keyName || !Array.isArray(keyName) || keyName.length === 0) {
    throw new apiError(400, "An array of object keyNames is required");
  }

  // Create a new variable to store unique keys
  const uniqueKeyNames = [...new Set(keyName)];

  // Step 1: Check existence of each object
  const existingKeys = [];
  const nonExistingKeys = [];
  for (const key of uniqueKeyNames) {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      });
      const response = await s3Client.send(command);
      console.log(`Object ${key} exists:`, response);
      // If the object exists, add it to the list
      existingKeys.push(key);
    } catch (error) {
      console.error("Error in HeadObjectCommand for key:", key, error);
      if (error.name === 'NotFound') {
        // Object does not exist
        nonExistingKeys.push(key);
      } else {
        console.error(`Error checking object ${key}: ${error.message}`);
        console.error(`Error details: Code - ${error.code}, RequestId - ${error.requestId}, HTTPStatusCode - ${error.$metadata?.httpStatusCode}`);
        // Log the whole error object for more insight
        console.error(error);
        
        const errorMessage = `Error checking object ${key}: ${error.message}, Code: ${error.code || 'Unknown'}, RequestId: ${error.requestId || 'N/A'}`;
        throw new apiError(500, errorMessage);
      }
  }

  // Step 2: Attempt to delete existing objects
  if (existingKeys.length > 0) {
    try {
      const delRes = await deleteObjectsFromS3(process.env.AWS_BUCKET, existingKeys);

      console.log(delRes, " \n\n AWS_DeletedObjectsFromS3");

      res.status(200).json({
        message: "Objects deletion completed",
        deletedKeys: delRes.Deleted.map(obj => obj.Key), // List of successfully deleted keys
        nonExistingKeys, // List of keys that did not exist
        errors: delRes.Errors || [], // Any errors (e.g., objects that didn't exist)
      });
    } catch (error) {
      throw new apiError(500, `Something went wrong while deleting objects: ${error.message}`);
    }
  } else {
    res.status(200).json({
      message: "No existing objects to delete",
      nonExistingKeys,
    });
  }
}});


export { uploadOnS3, getObjectS3, delObjectS3, getListObjectS3 };
