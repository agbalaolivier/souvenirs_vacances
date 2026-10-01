import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { Video } from 'expo-av';
import ShapedImage from './ShapedImage';
import PhotoAdjuster from './PhotoAdjuster';
import useimageSize from './useimageSize';
import fairePartReference from '../assets/faire-part-reference.webp';
import printempsReference from '../assets/printemps-frais-reference.jpg';

// ============================================================
// CONFIGURATION DES THÈMES
// Même style de carte (sobre, cadre fin, badge, séparateur + message) pour tous,
// mais chaque thème a sa propre couleur, sa propre police et son propre contour
// (rayon, épaisseur, style de trait, petites accroches d'angle) pour rester dans
// le même esprit tout en étant visuellement unique.
// ============================================================
const themesConfig = {
  tropical: {
    cardBg: '#f0fbff',
    textColor: '#0c4a6e',
    accentColor: '#0ea5e9',
    borderColor: '#7dd3fc',
    badgeBg: 'rgba(255, 255, 255, 0.9)',
    font: { web: "'Trebuchet MS', Verdana, sans-serif", ios: 'Trebuchet MS', android: 'sans-serif' },
    letterSpacing: 1,
    fontWeight: '600',
    cornerRadius: 22,
    outerBorderWidth: 2,
    innerGap: 10,
    innerBorderStyle: 'dashed',
    cornerAccents: false,
  },
  noel: {
    cardBg: '#fffaf5',
    textColor: '#450a0a',
    accentColor: '#9f1239',
    borderColor: '#d4af37',
    badgeBg: 'rgba(255, 255, 255, 0.9)',
    font: { web: "Georgia, 'Times New Roman', serif", ios: 'Georgia', android: 'serif' },
    letterSpacing: 2,
    fontWeight: '400',
    cornerRadius: 12,
    outerBorderWidth: 3,
    innerGap: 9,
    innerBorderStyle: 'dashed',
    cornerAccents: true,
  },
  romantique: {
    cardBg: '#fff5f7',
    textColor: '#831843',
    accentColor: '#db2777',
    borderColor: '#f9a8c9',
    badgeBg: 'rgba(255, 255, 255, 0.9)',
    font: { web: "'Brush Script MT', cursive", ios: 'Snell Roundhand', android: 'cursive' },
    letterSpacing: 0.5,
    fontWeight: '400',
    cornerRadius: 28,
    outerBorderWidth: 2,
    innerGap: 14,
    innerBorderStyle: 'dotted',
    cornerAccents: false,
  },
  chic: {
    cardBg: '#f5f5f5',
    textColor: '#18181b',
    accentColor: '#52525b',
    borderColor: '#a1a1aa',
    badgeBg: 'rgba(255, 255, 255, 0.9)',
    font: { web: "'Helvetica Neue', Arial, sans-serif", ios: 'Helvetica Neue', android: 'sans-serif' },
    letterSpacing: 3,
    fontWeight: '300',
    cornerRadius: 4,
    outerBorderWidth: 1,
    innerGap: 7,
    innerBorderStyle: 'solid',
    cornerAccents: false,
  },
  anniversaire: {
    cardBg: '#fdf4ff',
    textColor: '#581c87',
    accentColor: '#a21caf',
    borderColor: '#e9d5ff',
    badgeBg: 'rgba(255, 255, 255, 0.9)',
    font: { web: "'Arial Rounded MT Bold', Arial, sans-serif", ios: 'Arial Rounded MT Bold', android: 'sans-serif' },
    letterSpacing: 1,
    fontWeight: '700',
    cornerRadius: 24,
    outerBorderWidth: 3,
    innerGap: 8,
    innerBorderStyle: 'dashed',
    cornerAccents: true,
  },
  automne: {
    cardBg: '#fffbeb',
    textColor: '#7c2d12',
    accentColor: '#b45309',
    borderColor: '#d9b382',
    badgeBg: 'rgba(255, 255, 255, 0.9)',
    font: { web: "'Palatino Linotype', Palatino, 'Book Antiqua', serif", ios: 'Palatino', android: 'serif' },
    letterSpacing: 1,
    fontWeight: '400',
    cornerRadius: 16,
    outerBorderWidth: 2,
    innerGap: 10,
    innerBorderStyle: 'dashed',
    cornerAccents: false,
  },
  printemps: {
    cardBg: '#eadfd7',
    textColor: '#765346',
    accentColor: '#b78369',
    borderColor: '#d4b9a8',
    badgeBg: 'rgba(252, 248, 242, 0.88)',
    backgroundImage: printempsReference,
    font: { web: "'Cormorant Garamond', Georgia, serif", ios: 'Georgia', android: 'serif' },
    letterSpacing: 1,
    fontWeight: '400',
    cornerRadius: 8,
    outerBorderWidth: 1,
    innerGap: 12,
    innerBorderStyle: 'solid',
    cornerAccents: false,
  },
  luxe: {
    cardBg: '#14121c',
    textColor: '#f5f0e6',
    accentColor: '#d4af37',
    borderColor: '#d4af37',
    badgeBg: 'rgba(255, 255, 255, 0.08)',
    font: { web: "Didot, 'Bodoni MT', Georgia, serif", ios: 'Didot', android: 'serif' },
    letterSpacing: 2.5,
    fontWeight: '400',
    cornerRadius: 10,
    outerBorderWidth: 1,
    innerGap: 16,
    innerBorderStyle: 'solid',
    cornerAccents: true,
  },
  fairepart: {
    cardBg: '#8f1d1d',
    textColor: '#f8e8bd',
    accentColor: '#d9aa55',
    borderColor: '#d9aa55',
    badgeBg: 'rgba(60, 15, 16, 0.78)',
    backgroundImage: fairePartReference,
    font: { web: "'Cormorant Garamond', Georgia, serif", ios: 'Georgia', android: 'serif' },
    letterSpacing: 1.5,
    fontWeight: '400',
    cornerRadius: 4,
    outerBorderWidth: 1,
    innerGap: 14,
    innerBorderStyle: 'solid',
    cornerAccents: false,
  },
};

export default function CardPreview({
  cardRef,
  title,
  period,
  subtitle,
  location,
  photos,
  shape,
  message,
  theme = 'tropical',
  onRemovePhoto,
  onAiProcess,
  compact = false,
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const currentTheme = themesConfig[theme] || themesConfig.tropical;
  const nativeFontFamily = Platform.select({ ios: currentTheme.font.ios, android: currentTheme.font.android, default: currentTheme.font.android });

  // Gestion de la navigation Lightbox (partagée web + mobile)
  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const activeItem = lightboxIndex !== null && photos[lightboxIndex] !== undefined ? photos[lightboxIndex] : null;
  const activeUri = activeItem ? (typeof activeItem === 'object' ? activeItem.uri : activeItem) : '';
  const activeType = activeItem ? (typeof activeItem === 'object' ? (activeItem.type || '') : '') : '';
  const isLightboxVideo = activeType.includes('video') || activeUri.endsWith('.mp4') || activeUri.endsWith('.webm') || activeUri.endsWith('.mov');

  // ============================================================
  // RENDU WEB
  // ============================================================
  if (Platform.OS === 'web') {
    const isSingle = photos.length === 1;
    const mediaSize = compact ? (isSingle ? 88 : 52) : (isSingle ? 220 : 120);
    const gap = compact ? 5 : currentTheme.innerGap;

    const cornerAccentStyleBase = {
      position: 'absolute',
      width: '18px',
      height: '18px',
      pointerEvents: 'none',
      zIndex: 4,
    };

    return (
      <div
        ref={cardRef}
        style={{
          width: '100%',
          backgroundColor: currentTheme.cardBg,
          backgroundImage: currentTheme.backgroundImage ? `url(${currentTheme.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'soft-light',
          borderRadius: `${currentTheme.cornerRadius}px`,
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          border: `${currentTheme.outerBorderWidth}px solid ${currentTheme.borderColor}`,
          position: 'relative',
        }}
      >
        {/* Cadre décoratif interne (contour "dynamique" propre à chaque thème) */}
        <div
          style={{
            position: 'absolute',
            top: `${gap}px`,
            left: `${gap}px`,
            right: `${gap}px`,
            bottom: `${gap}px`,
            border: `1px ${currentTheme.innerBorderStyle} ${currentTheme.accentColor}`,
            borderRadius: `${Math.max(currentTheme.cornerRadius - 6, 4)}px`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Petites accroches d'angle (uniquement pour les thèmes qui en ont) */}
        {currentTheme.cornerAccents && (
          <>
            <div style={{ ...cornerAccentStyleBase, top: '6px', left: '6px', borderTop: `2px solid ${currentTheme.accentColor}`, borderLeft: `2px solid ${currentTheme.accentColor}` }} />
            <div style={{ ...cornerAccentStyleBase, top: '6px', right: '6px', borderTop: `2px solid ${currentTheme.accentColor}`, borderRight: `2px solid ${currentTheme.accentColor}` }} />
            <div style={{ ...cornerAccentStyleBase, bottom: '6px', left: '6px', borderBottom: `2px solid ${currentTheme.accentColor}`, borderLeft: `2px solid ${currentTheme.accentColor}` }} />
            <div style={{ ...cornerAccentStyleBase, bottom: '6px', right: '6px', borderBottom: `2px solid ${currentTheme.accentColor}`, borderRight: `2px solid ${currentTheme.accentColor}` }} />
          </>
        )}

        <div style={{ position: 'relative', zIndex: 3, padding: compact ? '8px' : '20px' }}>
          {/* En-tête */}
          <div style={{ textAlign: 'center', marginBottom: compact ? '5px' : '20px', paddingTop: compact ? '0' : '10px' }}>
            {location ? (
              <div style={{ display: 'inline-block', maxWidth: '100%', boxSizing: 'border-box', backgroundColor: currentTheme.badgeBg, padding: compact ? '2px 8px' : '4px 12px', borderRadius: '15px', marginBottom: compact ? '3px' : '12px', whiteSpace: compact ? 'nowrap' : 'normal', overflow: compact ? 'hidden' : 'visible', textOverflow: compact ? 'ellipsis' : 'clip', overflowWrap: 'anywhere' }}>
                <span style={{ fontSize: compact ? '9px' : '11px', fontWeight: '600', color: currentTheme.accentColor, letterSpacing: compact ? '0' : '1px', textTransform: 'uppercase', overflowWrap: 'anywhere' }}>
                  📍 {location}
                </span>
              </div>
            ) : null}

            <h2 style={{ fontSize: compact ? '16px' : '27px', fontWeight: currentTheme.fontWeight, fontFamily: currentTheme.font.web, color: currentTheme.textColor, margin: compact ? '0 0 2px 0' : '0 0 8px 0', letterSpacing: compact ? '0' : `${currentTheme.letterSpacing}px`, whiteSpace: compact ? 'nowrap' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title || 'Événement'}
            </h2>

            <p style={{ fontSize: compact ? '9px' : '13px', fontWeight: '500', color: currentTheme.textColor, opacity: 0.8, margin: 0, fontStyle: 'italic', letterSpacing: compact ? '0' : '0.5px', whiteSpace: compact ? 'nowrap' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {period ? `${period} • ` : ''}{subtitle || 'Moments partagés'}
            </p>
          </div>

          {/* Galerie Photos / Vidéos */}
          <div style={{ padding: compact ? '3px 0' : '10px 0', minHeight: compact ? '62px' : '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {photos.length === 0 ? (
              <div style={{ width: '100%', height: compact ? '56px' : '140px', border: `1.5px dashed ${currentTheme.accentColor}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.4)', color: currentTheme.textColor, fontSize: compact ? '10px' : '13px', fontWeight: '500', fontStyle: 'italic' }}>
                ✨ Ajoutez vos photos ou vidéos souvenirs...
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: compact ? '6px' : '14px', maxWidth: '460px', width: '100%' }}>
                {(compact ? photos.slice(0, 3) : photos).map((item, index) => {
                  const uri = typeof item === 'object' ? item.uri : item;
                  const type = typeof item === 'object' ? (item.type || '') : '';
                  const isVideo = type.includes('video') || uri.endsWith('.mp4') || uri.endsWith('.webm') || uri.endsWith('.mov');
                  const rotation = index % 2 === 0 ? '-1deg' : '1deg';

                  return (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        backgroundColor: 'transparent',
                        padding: 0,
                        borderRadius: 0,
                        boxShadow: compact ? 'none' : '0 6px 15px rgba(0,0,0,0.08)',
                        transform: isSingle ? 'none' : `rotate(${rotation})`,
                        display: 'inline-block',
                      }}
                    >
                      {/* Bouton suppression */}
                      {!compact && <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRemovePhoto) onRemovePhoto(index);
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        title="Supprimer ce média"
                      >
                        ✕
                      </button>}

                      {/* Aperçu cliquable */}
                      <div onClick={() => setLightboxIndex(index)} style={{ cursor: 'pointer' }}>
                        {isVideo ? (
                          <video
                            src={uri}
                            style={{ width: mediaSize, height: mediaSize, objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                            muted
                            playsInline
                          />
                        ) : (
                          <ShapedImage uri={uri} shape={shape} size={mediaSize} />
                        )}
                      </div>
                    </div>
                  );
                })}
                {compact && photos.length > 3 && (
                  <div style={{ width: mediaSize, height: mediaSize, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme.textColor, fontSize: '12px', fontWeight: '700' }}>
                    +{photos.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message personnel */}
          <div style={{ padding: compact ? '5px 4px 2px' : '20px 10px 10px 10px', textAlign: 'center' }}>
            <div style={{ width: compact ? '24px' : '40px', height: '1px', backgroundColor: currentTheme.accentColor, margin: compact ? '0 auto 4px auto' : '0 auto 12px auto' }} />
            <p style={{ fontSize: compact ? '10px' : '15px', fontWeight: currentTheme.fontWeight, fontFamily: currentTheme.font.web, fontStyle: 'italic', color: currentTheme.textColor, margin: 0, letterSpacing: '0.5px', lineHeight: 1.35, maxWidth: '100%', maxHeight: compact ? '2.7em' : 'none', overflow: 'hidden', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {message || 'Avec tout notre amour.'}
            </p>
          </div>
        </div>

        {/* MODALE LIGHTBOX WEB */}
        {lightboxIndex !== null && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 99999,
            }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '30px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 100000,
              }}
            >
              ✕
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRemovePhoto) {
                  onRemovePhoto(lightboxIndex);
                  setLightboxIndex(null);
                }
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '85px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 100000,
              }}
            >
              🗑️ Supprimer
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAiProcess) onAiProcess(lightboxIndex);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '200px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                zIndex: 100000,
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.5)',
              }}
            >
              ✨ Magie IA
            </button>

            {photos.length > 1 && (
              <button
                onClick={handlePrev}
                style={{
                  position: 'absolute',
                  left: '20px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  zIndex: 100000,
                }}
              >
                ‹
              </button>
            )}

            <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              {isLightboxVideo ? (
                <video src={activeUri} controls autoPlay style={{ maxWidth: '85vw', maxHeight: '80vh', borderRadius: '12px', display: 'block' }} />
              ) : (
                <img src={activeUri} alt="Agrandissement" style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
              )}
              <div style={{ color: '#ffffff', marginTop: '10px', fontSize: '13px', fontWeight: '600' }}>
                {lightboxIndex + 1} / {photos.length}
              </div>
            </div>

            {photos.length > 1 && (
              <button
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: '20px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  zIndex: 100000,
                }}
              >
                ›
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDU MOBILE NATIF (iOS / Android)
  // ============================================================
  const isSingleNative = photos.length === 1;
  const nativeMediaSize = compact ? (isSingleNative ? 88 : 52) : (isSingleNative ? 200 : 110);
  const lightboxMediaWidth = screenWidth * 0.88;
  const lightboxMediaHeight = screenHeight * 0.55;
  const gap = compact ? 5 : currentTheme.innerGap;

  return (
    <View
      ref={cardRef}
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.borderColor,
          borderWidth: currentTheme.outerBorderWidth,
          borderRadius: currentTheme.cornerRadius,
        },
      ]}
      collapsable={false}
    >
      <View
        style={[
          styles.innerFrame,
          {
            borderColor: currentTheme.accentColor,
            borderStyle: currentTheme.innerBorderStyle,
            borderRadius: Math.max(currentTheme.cornerRadius - 6, 4),
            top: gap,
            left: gap,
            right: gap,
            bottom: gap,
          },
        ]}
        pointerEvents="none"
      />

      {currentTheme.cornerAccents && (
        <React.Fragment>
          <View style={[styles.cornerAccent, { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2, borderColor: currentTheme.accentColor }]} pointerEvents="none" />
          <View style={[styles.cornerAccent, { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2, borderColor: currentTheme.accentColor }]} pointerEvents="none" />
          <View style={[styles.cornerAccent, { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: currentTheme.accentColor }]} pointerEvents="none" />
          <View style={[styles.cornerAccent, { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2, borderColor: currentTheme.accentColor }]} pointerEvents="none" />
        </React.Fragment>
      )}

      <View style={{ padding: compact ? 8 : 20 }}>
        {/* En-tête */}
        <View style={[styles.header, compact && { paddingTop: 0, marginBottom: 5 }]}>
          {location ? (
            <View style={[styles.badge, compact && { paddingVertical: 2, marginBottom: 3 }, { backgroundColor: currentTheme.badgeBg }]}>
              <Text numberOfLines={compact ? 1 : undefined} style={[styles.badgeText, compact && { fontSize: 9, letterSpacing: 0 }, { color: currentTheme.accentColor }]}>📍 {location}</Text>
            </View>
          ) : null}
          <Text
            numberOfLines={compact ? 1 : undefined}
            style={[
              styles.title,
              compact && { fontSize: 16, marginBottom: 2, letterSpacing: 0 },
              {
                color: currentTheme.textColor,
                fontFamily: nativeFontFamily,
                fontWeight: currentTheme.fontWeight,
                letterSpacing: currentTheme.letterSpacing,
              },
            ]}
          >
            {title || 'Événement'}
          </Text>
          <Text numberOfLines={compact ? 1 : undefined} style={[styles.subtitle, compact && { fontSize: 9, letterSpacing: 0 }, { color: currentTheme.textColor }]}>
            {period ? `${period} • ` : ''}{subtitle || 'Moments partagés'}
          </Text>
        </View>

        {/* Galerie Photos / Vidéos */}
        <View style={[styles.gallery, compact && { minHeight: 62 }]}>
          {photos.length === 0 ? (
            <View style={[styles.emptyPlaceholder, compact && { height: 56 }, { borderColor: currentTheme.accentColor }]}>
              <Text style={[styles.emptyPlaceholderText, compact && { fontSize: 10 }, { color: currentTheme.textColor }]}>
                ✨ Ajoutez vos photos ou vidéos souvenirs...
              </Text>
            </View>
          ) : (
            <View style={[styles.galleryGrid, compact && { gap: 6 }]}>
              {(compact ? photos.slice(0, 3) : photos).map((item, index) => {
                const uri = typeof item === 'object' ? item.uri : item;
                const type = typeof item === 'object' ? (item.type || '') : '';
                const isVideo = type.includes('video') || uri.endsWith('.mp4') || uri.endsWith('.webm') || uri.endsWith('.mov');
                const rotation = index % 2 === 0 ? '-1deg' : '1deg';

                return (
                  <View
                    key={index}
                    style={[styles.mediaFrame, !isSingleNative && { transform: [{ rotate: rotation }] }]}
                  >
                    {!compact && <TouchableOpacity
                      style={styles.deleteBadge}
                      onPress={() => onRemovePhoto && onRemovePhoto(index)}
                    >
                      <Text style={styles.deleteBadgeText}>✕</Text>
                    </TouchableOpacity>}

                    <TouchableOpacity activeOpacity={0.85} onPress={() => setLightboxIndex(index)}>
                      {isVideo ? (
                        <Video
                          source={{ uri }}
                          style={{ width: nativeMediaSize, height: nativeMediaSize, borderRadius: 6 }}
                          resizeMode="cover"
                          isMuted
                          useNativeControls={false}
                        />
                      ) : (
                        <ShapedImage uri={uri} shape={shape} size={nativeMediaSize} instanceId={index} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
              {compact && photos.length > 3 && (
                <View style={[styles.morePhotos, { width: nativeMediaSize, height: nativeMediaSize }]}>
                  <Text style={styles.morePhotosText}>+{photos.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Message personnel */}
        <View style={[styles.messageWrap, compact && { paddingTop: 5, paddingBottom: 2 }]}>
          <View style={[styles.divider, compact && { width: 24, marginBottom: 4 }, { backgroundColor: currentTheme.accentColor }]} />
          <Text
            numberOfLines={compact ? 2 : undefined}
            style={[
              styles.message,
              compact && { fontSize: 10, lineHeight: 14 },
              { color: currentTheme.textColor, fontFamily: nativeFontFamily, fontWeight: currentTheme.fontWeight },
            ]}
          >
            {message || 'Avec tout notre amour.'}
          </Text>
        </View>
      </View>

      {/* LIGHTBOX MOBILE */}
      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxIndex(null)}
      >
        <TouchableOpacity style={styles.lightboxOverlay} activeOpacity={1} onPress={() => setLightboxIndex(null)}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxIndex(null)}>
            <Text style={styles.lightboxCloseText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.lightboxActionsRow}>
            <TouchableOpacity
              style={styles.lightboxDeleteBtn}
              onPress={() => {
                if (onRemovePhoto) {
                  onRemovePhoto(lightboxIndex);
                  setLightboxIndex(null);
                }
              }}
            >
              <Text style={styles.lightboxBtnText}>🗑️ Supprimer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.lightboxAiBtn}
              onPress={() => {
                if (onAiProcess) onAiProcess(lightboxIndex);
              }}
            >
              <Text style={styles.lightboxBtnText}>✨ Magie IA</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 1 && (
            <TouchableOpacity style={[styles.lightboxArrow, styles.lightboxArrowLeft]} onPress={handlePrev}>
              <Text style={styles.lightboxArrowText}>‹</Text>
            </TouchableOpacity>
          )}

          <View style={styles.lightboxContent} pointerEvents="box-none">
            {isLightboxVideo ? (
              <Video
                source={{ uri: activeUri }}
                style={{ width: lightboxMediaWidth, height: lightboxMediaHeight }}
                resizeMode="contain"
                useNativeControls
                shouldPlay
              />
            ) : (
              <Image
                source={{ uri: activeUri }}
                style={{ width: lightboxMediaWidth, height: lightboxMediaHeight }}
                resizeMode="contain"
              />
            )}
            {photos.length > 0 && (
              <Text style={styles.lightboxCounter}>
                {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {photos.length}
              </Text>
            )}
          </View>

          {photos.length > 1 && (
            <TouchableOpacity style={[styles.lightboxArrow, styles.lightboxArrowRight]} onPress={handleNext}>
              <Text style={styles.lightboxArrowText}>›</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  innerFrame: {
    position: 'absolute',
    borderWidth: 1,
  },
  cornerAccent: {
    position: 'absolute',
    width: 16,
    height: 16,
    zIndex: 4,
  },
  header: { alignItems: 'center', paddingTop: 10, marginBottom: 16 },
  badge: { maxWidth: '100%', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginBottom: 14 },
  badgeText: { flexShrink: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 25, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, fontWeight: '500', fontStyle: 'italic', textAlign: 'center', opacity: 0.8, letterSpacing: 0.5 },
  gallery: { minHeight: 160, alignItems: 'center', justifyContent: 'center' },
  emptyPlaceholder: {
    width: '100%',
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  emptyPlaceholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, maxWidth: 460 },
  mediaFrame: {
    position: 'relative',
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 11,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  deleteBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  morePhotos: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.08)', borderRadius: 8 },
  morePhotosText: { color: '#334155', fontSize: 14, fontWeight: '700' },
  messageWrap: { alignItems: 'center', width: '100%', paddingTop: 20, paddingBottom: 4 },
  divider: { width: 40, height: 1, marginBottom: 12 },
  message: { maxWidth: '100%', alignSelf: 'stretch', flexShrink: 1, fontSize: 15, fontStyle: 'italic', textAlign: 'left', letterSpacing: 0.5, lineHeight: 23 },
  lightboxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  lightboxClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lightboxCloseText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  lightboxActionsRow: { position: 'absolute', top: 40, left: 20, flexDirection: 'row', gap: 8, zIndex: 10 },
  lightboxDeleteBtn: { backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  lightboxAiBtn: { backgroundColor: '#a855f7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  lightboxBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  lightboxArrow: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lightboxArrowLeft: { left: 12 },
  lightboxArrowRight: { right: 12 },
  lightboxArrowText: { color: '#ffffff', fontSize: 26, fontWeight: 'bold' },
  lightboxContent: { alignItems: 'center' },
  lightboxCounter: { color: '#ffffff', marginTop: 10, fontSize: 13, fontWeight: '600' },
});