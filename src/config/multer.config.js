import multer from "multer";
export const multerStorageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + "-" + file.originalname);
    },
  });