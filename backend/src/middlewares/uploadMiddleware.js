import multer from 'multer';

// TODO: Swap out for AWS S3 direct upload or Lambda trigger.
// When ready, replace memoryStorage with a multer-s3 storage engine or
// emit an event/message to a Lambda function that handles the S3 put operation.
const storage = multer.memoryStorage();

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',   // some clients send image/jpg instead of image/jpeg
    'image/png',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
});

export default upload;
