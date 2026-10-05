// fileUpload.middleware.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Credentials come only from the environment (Backend/.env); never hardcode them.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG files are allowed.'), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    }
});

// Function to upload buffer to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder = "assignments") => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            const readableStream = Readable.from(fileBuffer);
            readableStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error("Error uploading to cloudinary:", error);
        throw error;
    }
};

// Class photos for face recognition (kept in memory and forwarded to the face service).
const imageUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
        else cb(new Error("Please upload a JPG or PNG photo."), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});

export { upload, imageUpload, uploadToCloudinary };