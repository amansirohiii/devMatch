import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
dotenv.config();

const client = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
      region: process.env.AWS_REGION,
});

export const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024, //  5MB
  },
});

export const uploadImage = async({file, user}: any) =>{

  try {
    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: "devmatch/" + user._id + "/" + file.originalname,
      Body: fileContent,
    };
    return await new Upload({
      client,
      params,
    }).done();


  } catch (error) {
    console.error(error);
    throw new Error('Error uploading file');
  }finally{
    fs.unlinkSync(file.path);
  }

};



