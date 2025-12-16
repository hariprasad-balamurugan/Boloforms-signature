import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Field from './Field';
import './PDFViewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function PDFViewer({ pdfId, fields, selectedFieldId, onUpdateField, onSelectField, onPageViewportChange }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const canvasRef = useRef();
  const containerRef = useRef();
  const renderTaskRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(612);
  const [pageHeight, setPageHeight] = useState(792);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(`http://localhost:5000/api/pdfs/${pdfId}`).promise;
        setPdfDoc(pdf);
      } catch (error) {
        console.error('PDF load error:', error);
      }
    };
    loadPdf();
  }, [pdfId]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });
        const fixedScale = 2;

        const renderViewport = page.getViewport({ scale: fixedScale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;

        setPageWidth(baseViewport.width);
        setPageHeight(baseViewport.height);

        const viewportData = {
          width: baseViewport.width,
          height: baseViewport.height,
          scale: fixedScale,
          canvasWidth: renderViewport.width,
          canvasHeight: renderViewport.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
        };
        if (onPageViewportChange) {
          onPageViewportChange(viewportData);
        }

        const renderTask = page.render({
          canvasContext: context,
          viewport: renderViewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (error) {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Render error:', error);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum, onPageViewportChange]);

  const handleFieldDragEnd = (e, fieldId, newCoordinates) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      onUpdateField(fieldId, {
        ...field,
        coordinates: newCoordinates,
      });
    }
  };

  const getCanvasScale = () => {
    if (!canvasRef.current || !containerRef.current) return 1;
    return containerRef.current.clientWidth / canvasRef.current.width;
  };

  if (!pdfDoc) {
    return <div className="pdf-viewer">Loading PDF...</div>;
  }

  return (
    <div className="pdf-viewer" ref={containerRef}>
      <div className="pdf-canvas-wrapper">
        <div className="pdf-canvas-container">
          <canvas ref={canvasRef} className="pdf-canvas"></canvas>
          <div className="fields-overlay">
            {fields
              .filter(f => f.coordinates.page === pageNum)
              .map(field => (
                <Field
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onSelectField(field.id)}
                  onDragEnd={(newCoords) => handleFieldDragEnd(null, field.id, newCoords)}
                  onUpdate={(updated) => onUpdateField(field.id, updated)}
                  scale={getCanvasScale()}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="pdf-controls">
        <button
          disabled={pageNum <= 1}
          onClick={() => setPageNum(p => Math.max(1, p - 1))}
        >
          ← Previous
        </button>
        <span>
          Page {pageNum} of {pdfDoc.numPages}
        </span>
        <button
          disabled={pageNum >= pdfDoc.numPages}
          onClick={() => setPageNum(p => Math.min(pdfDoc.numPages, p + 1))}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default PDFViewer;
