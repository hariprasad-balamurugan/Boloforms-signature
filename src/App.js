import React, { useState, useRef } from 'react';
import PDFViewer from './components/PDFViewer';
import FieldToolbar from './components/FieldToolbar';
import apiService from './services/advancedApiService';
import './App.css';

function App() {
  const [pdfId, setPdfId] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageViewport, setPageViewport] = useState(null);
  const fileInputRef = useRef();

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const data = await apiService.uploadPdf(formData);
      
      if (data.success) {
        setPdfId(data.pdfId);
        setFields([]);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = (fieldType) => {
    const newField = {
      id: Date.now(),
      type: fieldType,
      value: fieldType === 'radio' ? 'radio' : '',
      coordinates: {
        x: 100,
        y: 100,
        width: 150,
        height: 50,
        page: 1,
      },
      metadata: fieldType === 'radio' ? { checked: false } : {},
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (fieldId, updatedField) => {
    setFields(fields.map(f => f.id === fieldId ? updatedField : f));
  };

  const handleDeleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleSign = async () => {
    if (!pdfId || fields.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const fieldsToSign = fields.map(f => ({
        type: f.type,
        value: f.value,
        coordinates: f.coordinates,
        metadata: f.metadata,
      }));

      const data = await apiService.signPdf(pdfId, fieldsToSign, pageViewport);
      
      if (data.success) {
        const signedUrl = apiService.getSignedPdfUrl(data.signedPdfUrl);
        window.open(signedUrl, '_blank');
      } else {
        alert('Failed to sign PDF: ' + data.error);
      }
    } catch (error) {
      console.error('Sign error:', error);
      alert('Failed to sign PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>BoloForms - Signature Injection Engine</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current.click()}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload PDF'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-success"
            onClick={handleSign}
            disabled={!pdfId || fields.length === 0 || isLoading}
          >
            {isLoading ? 'Signing...' : 'Sign & Download'}
          </button>
        </div>
      </header>

      <div className="app-container">
        <FieldToolbar
          onAddField={handleAddField}
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onUpdateField={handleUpdateField}
          onDeleteField={handleDeleteField}
        />

        {pdfId && (
          <PDFViewer
            pdfId={pdfId}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onUpdateField={handleUpdateField}
            onSelectField={setSelectedFieldId}
            onPageViewportChange={setPageViewport}
          />
        )}

        {!pdfId && (
          <div className="empty-state">
            <p>Upload a PDF to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;