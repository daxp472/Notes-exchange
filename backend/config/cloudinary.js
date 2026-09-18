import crypto from 'crypto';
import axios from 'axios';

/**
 * Upload an image buffer directly to Cloudinary using Signed REST API
 * @param {Buffer} buffer - The image buffer from Multer
 * @param {string} mimeType - The mimetype of the image
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} The secure HTTPS URL from Cloudinary
 */
export const uploadImageToCloudinary = async (buffer, mimeType = 'image/jpeg', folder = 'college_notes_avatars') => {
  const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET;

  const base64Data = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Cloudinary] Missing credentials, using Data URI fallback');
    return dataUri;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('file', dataUri);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      }
    );

    if (response.data && response.data.secure_url) {
      console.log('[Cloudinary] 🟢 Image uploaded successfully:', response.data.secure_url);
      return response.data.secure_url;
    }

    return dataUri;
  } catch (error) {
    console.warn('[Cloudinary] Upload failed, falling back to data URI:', error.response?.data?.error?.message || error.message);
    return dataUri;
  }
};
