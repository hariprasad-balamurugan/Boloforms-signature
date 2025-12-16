const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  UPLOAD_PDF: `${API_BASE_URL}/api/pdfs/upload`,
  GET_PDF: (pdfId) => `${API_BASE_URL}/api/pdfs/${pdfId}`,
  SAVE_SIGNATURE: `${API_BASE_URL}/api/signatures`,
  // Add more endpoints as needed
};

export default API_BASE_URL;