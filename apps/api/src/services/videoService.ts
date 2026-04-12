import { Storage } from '@google-cloud/storage';
import { prisma } from '@repo/database';

const storage = new Storage({
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});

const bucketName = process.env.GCS_VIDEO_BUCKET_NAME || 'drivepro-videos';

export async function generateUploadUrl(lessonId: string, fileName: string) {
  const [url] = await storage
    .bucket(bucketName)
    .file(`lessons/${lessonId}/${fileName}`)
    .getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour for upload
      contentType: 'video/mp4',
    });

  return url;
}

export async function generateReadUrl(lessonId: string, fileName: string) {
  const [url] = await storage
    .bucket(bucketName)
    .file(`lessons/${lessonId}/${fileName}`)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours for viewing
    });

  return url;
}
