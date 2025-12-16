import React, { useState, useRef, useEffect } from 'react';
import PDFViewer from './components/PDFViewer';
import FieldToolbar from './components/FieldToolbar';
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
      const response = await fetch('http://localhost:5000/api/pdfs/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setPdfId(data.pdfId);
        setFields([]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF');
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
      // alert('Please upload a PDF and add at least one field');
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

      
      const response = await fetch('http://localhost:5000/api/signatures/sign-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfId,
          fields: fieldsToSign,
          pageViewport,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // alert('PDF signed successfully!');
        const signedUrl = `http://localhost:5000${data.signedPdfUrl}`;
        window.open(signedUrl, '_blank');
      } else {
        alert('Failed to sign PDF: ' + data.error);
      }
    } catch (error) {
      console.error('Sign error:', error);
      alert('Failed to sign PDF');
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
