import s3Client from "../config/aws.config.js";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import apiError from "../utils/apiError.js";
import fs from "fs";
import retryOperation from "../helper/retryMech.js";

// Upload a Largefiles  to AWS S3 bucket i will make it multipart upload
const putLargeFilesTos3 = async (bucket, fileName, contentType, expiresIn) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    //Body: fileStream, // Stream data (used for large files/ like uploading all cutomer data file at once)
    ContentType: contentType,
  });

  try {
    const preSignedUrlForPuttingObject = await getSignedUrl(s3Client, command, {
      expiresIn: expiresIn,
    });
    console.log(
      "preSignedUrlForPuttingObject generated and returned successsfully from putLarge file on S3"
    );
    return preSignedUrlForPuttingObject;
  } catch (error) {
    console.error(error);
    throw new apiError(500, error?.message, error);
  }
};

// Upload Multiple File to AWS S3 bucket
const putImagesOrPDFTos3 = async (bucket, fileName, contentType, expiresIn) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    // Body: fileContent, // Buffer data
    ContentType: contentType,
  });
  console.log("ExpiresIn: ", expiresIn);
  try {
    const preSignedUrlForPuttingObject = await getSignedUrl(s3Client, command, {
      expiresIn: expiresIn,
    });
    console.log(
      "\n \n preSignedUrlForPuttingObject Has been generated Succcessfully from PutImageOrPdfOnS3 \n \n \n"
    );
    return preSignedUrlForPuttingObject;
  } catch (error) {
    console.error(
      error,
      "\n \n Error generating preSignedUrlForPuttingObject \n \n"
    );
    throw new apiError(500, error?.message, error);
  }
};

// to getObject from s3 , objectKey is string and expires is Number
const getObjectFromS3 = async (bucketName, objectKey, expiresIn) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });
  try {
    const preSignedUrlForGettingObject = await getSignedUrl(
      s3Client,
      getObjectCommand,
      { expiresIn: expiresIn }
    );
    console.log(
      preSignedUrlForGettingObject,
      " \n \n preSignedUrlForGettingObject has been genertaed succesfully from getObjectFromS3 \n \n "
    );
    return preSignedUrlForGettingObject;
  } catch (error) {
    console.error(error);
    throw new apiError(500, error?.message, error);
  }
};

// list evrything from s3 // objectKey must be a string
const listObjectsFromS3 = async (bucketName, objectKey, maxKeys = 200) => {
  let params;
  let isTruncated = true;
  let continuationToken = undefined;
  const allObjects = [];
  let objKey = objectKey ? objectKey : ""
  // Ensure maxKeys is within valid range (1 to 1000)
  const validatedMaxKeys = Math.min(maxKeys, 1000);
  while (isTruncated) {
    params =
      objKey.length > 0
        ? {
            Bucket: bucketName,
            Prefix: objKey,
            MaxKeys: validatedMaxKeys,
            ContinuationToken: continuationToken,
          }
        : {
            Bucket: bucketName,
            MaxKeys: validatedMaxKeys,
            ContinuationToken: continuationToken,
          };
    try {
      const data = await retryOperation(() => s3Client.send(new ListObjectsV2Command(params)),3);
      allObjects.push(...data.Contents); // Add the current batch of objects to the list
      isTruncated = data.IsTruncated; // Check if there are more objects to retrieve
      continuationToken = data.NextContinuationToken; // Update the continuation token for next request
    } catch (error) {
      console.error("Error listing objects:", error);
      throw new apiError(error.code, "Error listing objects");
    }
  }
  return allObjects;
};

// to delete a sinlge or multiple objects from aws s3 bucket, object keys should be array of string
const deleteObjectsFromS3 = async (bucketName, objectKeys) => {
  const objectsToDelete = objectKeys.map((key) => ({ Key: key }));
  const command = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: {
      Objects: objectsToDelete,
    },
  });
  try {
    const response = await s3Client.send(command);
    console.log(response);
    return response;
  } catch (err) {
    winstonLogger.info(err.code, err.message);
    throw new apiError(500, err?.message);
  }
};




// below function are for case where server do wants to handle file uploads without presignedUrl

// Upload Large Files Directly to S3 (Without Pre-Signed URL)
const uploadLargeFileWithoutPreSignedUrl = async (
  bucket,
  key,
  filePath,
  contentType
) => {
  const fileStream = fs.createReadStream(filePath); // Create a stream for the large file

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Large file uploaded successfully!", response);
    return response;
  } catch (error) {
    console.error("Error uploading large file to S3:", error);
    throw new apiError(500, error?.message);
  }
};

//Upload Small Files (Images, PDFs) to S3 (Without Pre-Signed URL)
const uploadSmallFileWithoutPreSignedUrl = async (
  bucket,
  key,
  filePath,
  contentType
) => {
  const fileContent = fs.readFileSync(filePath); // Read file content

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent, // File as buffer
    ContentType: contentType,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Small file uploaded successfully!", response);
    return response;
  } catch (error) {
    console.error("Error uploading small file to S3:", error);
    throw new apiError(500, error?.message);
  }
};

//Get Object from S3 (Without Pre-Signed URL)
const getObjectWithoutPreSignedUrl = async (bucket, key) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const data = await s3Client.send(command);
    console.log(
      "Object downloaded successfully from S3",
      data.Body,
      data.Metadata
    );

    // Optional: Writing the data to a file or processing the stream
    const writeStream = fs.createWriteStream(`./${key}`);
    data.Body.pipe(writeStream); // Save file locally

    return data.Body; // Returns a readable stream
  } catch (error) {
    console.error("Error downloading object from S3:", error);
    throw new apiError(500, error?.message);
  }
};

//List All Objects in S3 Bucket (Without Pre-Signed URL)
const listObjectsWithoutPreSignedUrl = async (bucket) => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
  });

  try {
    const data = await s3Client.send(command);
    console.log("Listing objects in bucket", data.Contents);
    return data.Contents; // Array of objects
  } catch (error) {
    console.error("Error listing objects from S3:", error);
    throw new apiError(500, error?.message);
  }
};

// Delete Objects from S3 (Without Pre-Signed URL)
const deleteObjectsWithoutPreSignedUrl = async (bucket, keys) => {
  const objectsToDelete = keys.map((key) => ({ Key: key }));

  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: objectsToDelete,
    },
  });

  try {
    const response = await s3Client.send(command);
    console.log("Objects deleted successfully!", response);
    return response;
  } catch (error) {
    console.error("Error deleting objects from S3:", error);
    throw new apiError(500, error?.message);
  }
};

export {
  putLargeFilesTos3,
  putImagesOrPDFTos3,
  getObjectFromS3,
  listObjectsFromS3,
  deleteObjectsFromS3,
  getObjectWithoutPreSignedUrl,
  uploadSmallFileWithoutPreSignedUrl,
  uploadLargeFileWithoutPreSignedUrl,
  deleteObjectsWithoutPreSignedUrl,
  listObjectsWithoutPreSignedUrl,
};
