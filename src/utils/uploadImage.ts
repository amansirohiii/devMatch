import multer from 'multer';
import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024, //  5MB
  },
});

export const uploadImage = ({file, user}: any): Promise<any> =>{
  return new Promise((resolve, reject) => {

  try {
    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME + "/devmatch",
      Key: user._id + "/" + file.originalname,
      Body: fileContent,
    };

    s3.upload(params, (err: Error, data: any) => {
      if (err) {
        console.error(err);
        return reject(new Error('Error uploading file'));
      }
      fs.unlinkSync(file.path);
      resolve(data);
    });
  } catch (error) {
    console.error(error);
    reject(new Error('Error uploading file'));

  }
  });
};