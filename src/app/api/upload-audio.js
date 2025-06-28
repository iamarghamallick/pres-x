// pages/api/upload-audio.js

import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import nextConnect from 'next-connect';
import path from 'path';
import fs from 'fs';

// Configure multer for parsing multipart/form-data
const upload = multer({ dest: '/tmp' }); // Temp file storage

const apiRoute = nextConnect({
    onError(error, req, res) {
        res.status(501).json({ error: `Something went wrong: ${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});

// Middleware to handle single file upload under the field 'file'
apiRoute.use(upload.single('file'));

apiRoute.post(async (req, res) => {
    const storage = new Storage({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);
    const { originalname, path: tempPath } = req.file;

    const destination = `audio/${Date.now()}-${originalname}`;
    await bucket.upload(tempPath, {
        destination,
        metadata: {
            contentType: req.file.mimetype,
        },
    });

    // Clean up temp file
    fs.unlinkSync(tempPath);

    res.status(200).json({ message: 'Uploaded successfully', path: destination });
});

export const config = {
    api: {
        bodyParser: false, // Disallow Next.js's built-in body parser
    },
};

export default apiRoute;
