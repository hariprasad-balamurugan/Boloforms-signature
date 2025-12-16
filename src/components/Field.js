import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Field.css';

function Field({ field, isSelected, onSelect, onDragEnd, onUpdate, scale = 1, pageWidth, pageHeight }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const fieldRef = useRef();

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;

    e.preventDefault();
    onSelect();
    setIsDragging(true);
    const fieldRect = fieldRef.current.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - fieldRect.left,
      y: e.clientY - fieldRect.top,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && fieldRef.current) {
      
      const canvasContainer = fieldRef.current.closest('.fields-overlay');
      const containerRect = canvasContainer.getBoundingClientRect();
      
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;
      
      const canvas = canvasContainer.previousElementSibling;
      const canvasRect = canvas ? canvas.getBoundingClientRect() : containerRect;
      const maxX = canvasRect.width - field.coordinates.width;
      const maxY = canvasRect.height - field.coordinates.height;

      onUpdate({
        ...field,
        coordinates: {
          ...field.coordinates,
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        },
      });
    }

    if (isResizing && fieldRef.current) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const newWidth = Math.max(30, field.coordinates.width + deltaX);
      const newHeight = Math.max(30, field.coordinates.height + deltaY);

      onUpdate({
        ...field,
        coordinates: {
          ...field.coordinates,
          width: newWidth,
          height: newHeight,
        },
      });

      setResizeStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, field, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const getFieldLabel = () => {
    const labels = {
      signature: '✍️ Signature',
      text: '📝 Text',
      image: '🖼️ Image',
      date: '📅 Date',
      radio: '⭕ Radio',
    };
    return labels[field.type] || field.type;
  };

  return (
    <div
      ref={fieldRef}
      className={`field ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${field.coordinates.x}px`,
        top: `${field.coordinates.y}px`,
        width: `${field.coordinates.width}px`,
        height: `${field.coordinates.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="field-content">
        <div className="field-label">{getFieldLabel()}</div>
        {field.value && <div className="field-preview">{field.value.substring(0, 20)}</div>}
      </div>

      {isSelected && (
        <>
          <div className="resize-handle resize-handle-br" onMouseDown={handleResizeStart}></div>
          <div className="field-info">
            Page {field.coordinates.page}
          </div>
        </>
      )}
    </div>
  );
}

export default Field;
