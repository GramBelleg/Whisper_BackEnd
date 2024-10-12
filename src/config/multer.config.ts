// src/config/multerConfig.ts
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Specify your upload folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Rename the file
    },
});
const upload = multer({ storage: storage });
export default upload;
