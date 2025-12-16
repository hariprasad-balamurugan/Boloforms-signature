import React, { useRef, useState, useEffect } from 'react';
import './SignaturePad.css';

function SignaturePad({ isOpen, onClose, onSave }) {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      clearCanvas();
    }
  }, [isOpen]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    setIsEmpty(false);
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (isEmpty) return;
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSave(event.target.result);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="signature-pad-overlay">
      <div className="signature-pad-modal">
        <div className="signature-pad-header">
          <h3>Create Signature</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="signature-pad-content">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          
          <div className="signature-pad-actions">
            <button className="btn btn-secondary"  onClick={clearCanvas}>
              Clear
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="signature-file-input"
            />
            <label htmlFor="signature-file-input" className="btn btn-secondary" >
              Upload Image
            </label>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={isEmpty}
            >
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignaturePad;