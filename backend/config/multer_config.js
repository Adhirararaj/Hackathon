const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(8, (err, bytes) => {
      if (err) return cb(err);

      const fileExt = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, fileExt);
      const safeName = `${bytes.toString('hex')}-${baseName}${fileExt}`;

      cb(null, safeName);
    });
  },
});

const pdfFileFilter = (req, file, cb) => {
  const allowedExtensions = new Set(['.pdf']);
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.has(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Only pdf files (.pdf) are allowed'), false);
  }
};

const pdfUpload = multer({
  storage,
  fileFilter: pdfFileFilter,
});

module.exports = { pdfUpload };
