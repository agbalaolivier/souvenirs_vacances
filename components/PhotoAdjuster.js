import React, { useState, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Platform } from 'react-native';
import ShapedImage from './ShapedImage';
import { resolveFocus, computeFraming } from './Imageframing';
import useimageSize from './useimageSize';


export default function PhotoAdjuster({ visible, photo, shape, onClose, onSave }) {
  if (!visible) return null;

  const uri = photo ? (typeof photo === 'object' ? photo.uri : photo) : null;
  
  // États pour le zoom et la position (focusX, focusY de 0 à 1)
  const [zoom, setZoom] = useState(photo?.zoom || 1);
  const [focusX, setFocusX] = useState(photo?.focusX ?? 0.5);
  const [focusY, setFocusY] = useState(photo?.focusY ?? 0.5);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Gestion du glisser-déposer (Drag) sur le Web
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // Ajustement de la position en fonction du déplacement de la souris
    setFocusX((prev) => Math.max(0, Math.min(1, prev - dx * 0.003)));
    setFocusY((prev) => Math.max(0, Math.min(1, prev - dy * 0.003)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontFamily: 'Georgia, serif', color: '#333' }}>
            Ajuster le cadrage
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
            Glissez l'image avec la souris pour centrer le sujet dans la forme.
          </p>

          {/* Zone interactive de recadrage */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              width: '260px',
              height: '260px',
              margin: '0 auto',
              cursor: isDragging ? 'grabbing' : 'grab',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px dashed #c5a880',
              backgroundColor: '#f7f4ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            <div style={{ width: '220px', height: '220px', pointerEvents: 'none' }}>
              <ShapedImage
                uri={uri}
                shape={shape}
                size={220}
                photoObj={{ zoom, focusX, focusY }}
              />
            </div>
          </div>

          {/* Curseur de Zoom */}
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
              Zoom : {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '6px', cursor: 'pointer' }}
            />
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#333',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if (onSave) onSave({ zoom, focusX, focusY });
                onClose();
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#8b5cf6',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}