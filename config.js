exports.port = 8000;
exports.upload_dir = './uploads';

exports.s3 = {
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET_NAME
};

exports.s3_enabled = !!(process.env.S3_BUCKET_NAME);
