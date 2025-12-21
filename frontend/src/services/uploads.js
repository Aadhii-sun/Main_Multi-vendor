import api from './api';

// file should be a base64 data URL (e.g., from FileReader)
export const uploadImage = async (dataUrl, folder = 'products') => {
  const res = await api.post('/uploads', { file: dataUrl, folder });
  return res.data; // { url, publicId }
};

export const deleteImage = async (publicId) => {
  const res = await api.delete('/uploads', { data: { publicId } });
  return res.data;
};







