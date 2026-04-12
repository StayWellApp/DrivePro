# DrivePro Video Infrastructure Plan (GCS Implementation)

## 1. Hosting Strategy: Google Cloud Storage (GCS)
We will use Google Cloud Storage for hosting all dashcam video assets. This provides high availability, scalability, and integration with the Google Cloud ecosystem.

### Bucket Configuration:
- **Bucket Name:** `drivepro-dashcam-assets-${environment}`
- **Location:** `europe-west3` (Frankfurt) for low latency to CZ/SK/PL.
- **Storage Class:** `Standard` for active lesson replays, `Nearline` for lessons older than 90 days.
- **CORS:** Configure to allow requests from `admin.drivepro.io` and `student.drivepro.io`.

## 2. Large File Upload Handling
Dashcam videos are typically large (200MB - 1GB+). We will use **GCS Signed URLs** for direct browser-to-bucket uploads to avoid bottlenecking the API service.

### Upload Flow:
1. **Request:** Instructor app requests a Signed URL from `POST /lessons/:id/upload-url`.
2. **Permission:** API verifies the instructor is assigned to the lesson and returns a PUT Signed URL with `Content-Type: video/mp4`.
3. **Upload:** Instructor app performs a multi-part or resumable upload directly to GCS.
4. **Completion:** Instructor app pings `PATCH /lessons/:id/finish` with the resulting GCS file path.

## 3. Metadata & Processing
The `Lesson` model in Prisma stores the `videoUrl` and `videoStartTime`.
- **Sync Logic:** The `videoProcessor.ts` service calculates offsets by comparing the `FaultPin.timestamp` with `Lesson.videoStartTime`.
- **Performance:** For long lessons, we may implement server-side clipping using Cloud Functions (FFmpeg) to generate the 10-second "Incident Clips" if client-side seeking is too slow.

## 4. Security
- **Private Buckets:** Videos are NOT public.
- **Playback:** The API will generate short-lived (1-hour) GET Signed URLs when a student loads the Replay page.
- **Access Control:** Verified via NextAuth sessions in the API layer.

## 5. Roadmap
- **Phase 1:** Direct playback of raw dashcam MP4s via Signed URLs (Current).
- **Phase 2:** Automated thumbnail generation via Cloud Functions.
- **Phase 3:** HLS Transcoding for adaptive bitrate streaming in low-bandwidth areas.
