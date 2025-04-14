import { uploadToCloudinary } from './cloudinary'

export const onImagesUpload = async (files: File[]) => {
  try {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    // Call server action
    return await uploadToCloudinary(formData)
  } catch (error) {
    console.error('Cloudinary Upload Error:', error)
  }
}
