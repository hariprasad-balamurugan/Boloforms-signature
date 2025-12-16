// services/advancedApiService.js
import { API_ENDPOINTS } from '../config/api';

class AdvancedApiService {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Add error interceptor
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  // Apply request interceptors
  async applyRequestInterceptors(url, options) {
    let modifiedOptions = { ...options };
    
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await interceptor(url, modifiedOptions);
    }
    
    return modifiedOptions;
  }

  // Apply response interceptors
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  // Apply error interceptors
  async applyErrorInterceptors(error) {
    let modifiedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    
    return modifiedError;
  }

  // Generic request handler with interceptors
  async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      // Apply request interceptors
      const config = await this.applyRequestInterceptors(
        url,
        { ...defaultOptions, ...options }
      );

      const response = await fetch(url, config);
      let data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      // Apply response interceptors
      data = await this.applyResponseInterceptors(data);

      return data;
    } catch (error) {
      // Apply error interceptors
      const modifiedError = await this.applyErrorInterceptors(error);
      throw modifiedError;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const url = new URL(endpoint);
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );
    
    return this.request(url.toString(), { method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  async uploadFile(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // PDF Methods
  async uploadPdf(formData) {
    return this.uploadFile(API_ENDPOINTS.UPLOAD_PDF, formData);
  }

  async getPdf(pdfId) {
    return this.get(API_ENDPOINTS.GET_PDF(pdfId));
  }

  async deletePdf(pdfId) {
    return this.delete(API_ENDPOINTS.DELETE_PDF(pdfId));
  }

  // Signature Methods
  async signPdf(pdfId, fields, pageViewport) {
    return this.post(API_ENDPOINTS.SIGN_PDF, {
      pdfId,
      fields,
      pageViewport,
    });
  }

  async saveSignature(signatureData) {
    return this.post(API_ENDPOINTS.SAVE_SIGNATURE, signatureData);
  }

  async getSignature(signatureId) {
    return this.get(API_ENDPOINTS.GET_SIGNATURE(signatureId));
  }

  getSignedPdfUrl(filename) {
    return API_ENDPOINTS.SIGNED_PDF_URL(filename);
  }
}

// Create singleton instance
const apiService = new AdvancedApiService();

// Example: Add logging interceptor
apiService.addRequestInterceptor(async (url, options) => {
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  return options;
});

// Example: Add response logging interceptor
apiService.addResponseInterceptor(async (response) => {
  console.log('[API Response]', response);
  return response;
});

// Example: Add error handling interceptor
apiService.addErrorInterceptor(async (error) => {
  console.error('[API Error]', error.message);
  
  // You can add custom error handling here
  // For example, redirect to login on 401
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // window.location.href = '/login';
  }
  
  return error;
});

export default apiService;