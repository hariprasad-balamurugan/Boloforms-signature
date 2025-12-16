import React, { useState } from 'react';
import SignaturePad from './SignaturePad';
import './FieldToolbar.css';

function FieldToolbar({
  onAddField,
  fields,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
}) {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleFieldValueChange = (e) => {
    if (!selectedField) return;
    onUpdateField(selectedFieldId, {
      ...selectedField,
      value: e.target.value,
    });
  };

  const handleMetadataChange = (key, value) => {
    if (!selectedField) return;
    onUpdateField(selectedFieldId, {
      ...selectedField,
      metadata: {
        ...selectedField.metadata,
        [key]: value,
      },
    });
  };

  return (
    <div className="field-toolbar">
      <div className="toolbar-section">
        <h3>Add Fields</h3>
        <div className="field-buttons">
          <button
            className="field-btn"
            onClick={() => onAddField('signature')}
            title="Add signature field"
          >
            ✍️ Signature
          </button>
          <button
            className="field-btn"
            onClick={() => onAddField('text')}
            title="Add text field"
          >
            📝 Text
          </button>
          <button
            className="field-btn"
            onClick={() => onAddField('image')}
            title="Add image field"
          >
            🖼️ Image
          </button>
          <button
            className="field-btn"
            onClick={() => onAddField('date')}
            title="Add date field"
          >
            📅 Date
          </button>
          <button
            className="field-btn"
            onClick={() => onAddField('radio')}
            title="Add radio button"
          >
            ⭕ Radio
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Fields ({fields.length})</h3>
        <div className="fields-list">
          {fields.length === 0 ? (
            <p className="empty-message">No fields added yet</p>
          ) : (
            fields.map(field => (
              <div
                key={field.id}
                className={`field-item ${selectedFieldId === field.id ? 'selected' : ''}`}
              >
                <div
                  className="field-item-header"
                  onClick={() => onSelectField(field.id)}
                >
                  <span className="field-item-type">
                    {field.type === 'signature' && '✍️'}
                    {field.type === 'text' && '📝'}
                    {field.type === 'image' && '🖼️'}
                    {field.type === 'date' && '📅'}
                    {field.type === 'radio' && '⭕'}
                  </span>
                  <span className="field-item-label">{field.type}</span>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteField(field.id);
                    }}
                  >
                    ✕
                  </button>
                </div>

                {selectedFieldId === field.id && (
                  <div className="field-editor">
                    {(field.type === 'text' || field.type === 'date') && (
                      <div className="editor-group">
                        <label>Value:</label>
                        <input
                          type={field.type === 'date' ? 'date' : 'text'}
                          value={field.value}
                          onChange={handleFieldValueChange}
                          placeholder="Enter value"
                        />
                      </div>
                    )}

                    {field.type === 'signature' && (
                      <div className="editor-group">
                        <label>Signature:</label>
                        <div className="signature-options">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setShowSignaturePad(true)}
                          >
                            ✍️ Draw Signature
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  onUpdateField(selectedFieldId, {
                                    ...field,
                                    value: event.target.result,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                            id="signature-upload"
                          />
                          <label htmlFor="signature-upload" className="btn btn-secondary">
                            📁 Upload Image
                          </label>
                        </div>
                        {field.value && <span className="value-indicator">✓ Signature added</span>}
                      </div>
                    )}

                    {field.type === 'image' && (
                      <div className="editor-group">
                        <label>Upload image:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                onUpdateField(selectedFieldId, {
                                  ...field,
                                  value: event.target.result,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {field.value && <span className="value-indicator">✓ Image uploaded</span>}
                      </div>
                    )}

                    {field.type === 'radio' && (
                      <div className="editor-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={field.metadata?.checked || false}
                            onChange={(e) => {
                              handleMetadataChange('checked', e.target.checked);
                              onUpdateField(selectedFieldId, {
                                ...field,
                                value: 'radio',
                                metadata: {
                                  ...field.metadata,
                                  checked: e.target.checked,
                                },
                              });
                            }}
                          />
                          Checked
                        </label>
                      </div>
                    )}

                    <div className="editor-group">
                      <label>Page:</label>
                      <input
                        type="number"
                        min="1"
                        value={field.coordinates.page}
                        onChange={(e) => {
                          const page = Math.max(1, parseInt(e.target.value) || 1);
                          onUpdateField(selectedFieldId, {
                            ...field,
                            coordinates: {
                              ...field.coordinates,
                              page,
                            },
                          });
                        }}
                        placeholder="Page number"
                      />
                    </div>

                    <div className="editor-group">
                      <label>Coordinates:</label>
                      <div className="coords-display">
                        <span>
                          X: {field.coordinates.x.toFixed(0)}, Y: {field.coordinates.y.toFixed(0)}
                        </span>
                        <span>
                          W: {field.coordinates.width.toFixed(0)}, H:{' '}
                          {field.coordinates.height.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={(signatureData) => {
          if (selectedField) {
            onUpdateField(selectedFieldId, {
              ...selectedField,
              value: signatureData,
            });
          }
        }}
      />
    </div>
  );
}

export default FieldToolbar;
