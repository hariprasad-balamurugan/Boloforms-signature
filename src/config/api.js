// config/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // PDF endpoints
  UPLOAD_PDF: `${API_BASE_URL}/api/pdfs/upload`,
  GET_PDF: (pdfId) => `${API_BASE_URL}/api/pdfs/${pdfId}`,
  DELETE_PDF: (pdfId) => `${API_BASE_URL}/api/pdfs/${pdfId}`,
  
  // Signature endpoints
  SIGN_PDF: `${API_BASE_URL}/api/signatures/sign-pdf`,
  SAVE_SIGNATURE: `${API_BASE_URL}/api/signatures`,
  GET_SIGNATURE: (signatureId) => `${API_BASE_URL}/api/signatures/${signatureId}`,
  
  // Signed PDF endpoint
  SIGNED_PDF_URL: (filename) => `${API_BASE_URL}${filename}`,
};

export default API_BASE_URL;