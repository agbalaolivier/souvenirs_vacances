import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import ShapedImage from './ShapedImage';

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
  onAiProcess, // Prop pour déclencher l'action magique IA
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const themesConfig = {
    tropical: {
      bgHeader: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
      colors: ['#0284c7', '#0d9488'],
      cardBg: '#ffffff',
      textColor: '#0f172a',
      accentColor: '#38bdf8',
      badgeBg: 'rgba(255, 255, 255, 0.95)',
    },
    noel: {
      bgHeader: 'linear-gradient(135deg, #881337 0%, #991b1b 100%)',
      colors: ['#881337', '#991b1b'],
      cardBg: '#fffdfa',
      textColor: '#450a0a',
      accentColor: '#facc15',
      badgeBg: 'rgba(254, 243, 199, 0.95)',
    },
    romantique: {
      bgHeader: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
      colors: ['#be185d', '#e11d48'],
      cardBg: '#fff1f2',
      textColor: '#881337',
      accentColor: '#fb7185',
      badgeBg: 'rgba(255, 228, 230, 0.95)',
    },
    chic: {
      bgHeader: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      colors: ['#18181b', '#27272a'],
      cardBg: '#fafafa',
      textColor: '#18181b',
      accentColor: '#d4d4d8',
      badgeBg: 'rgba(39, 39, 42, 0.9)',
    },
  };

  const currentTheme = themesConfig[theme] || themesConfig.tropical;

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

  if (Platform.OS === 'web') {
    const isSingle = photos.length === 1;
    const mediaSize = isSingle ? '220px' : '120px';

    return (
      <div
        ref={cardRef}
        style={{
          width: '100%',
          backgroundColor: currentTheme.cardBg,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
        }}
      >
        {/* En-tête */}
        <div style={{ background: currentTheme.bgHeader, padding: '24px', paddingTop: '45px', textAlign: 'center', position: 'relative' }}>
          {location ? (
            <div style={{ display: 'inline-block', backgroundColor: currentTheme.badgeBg, padding: '6px 14px', borderRadius: '20px', marginBottom: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: currentTheme.accentColor, textTransform: 'uppercase' }}>✨ coucou, je suis ici ! 📍</div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: currentTheme.textColor }}>{location}</div>
            </div>
          ) : null}

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
              {title || 'Meilleurs Vœux !'}
            </h2>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              {period ? `${period} • ` : ''}{subtitle || 'Des moments inoubliables'}
            </p>
          </div>
        </div>

        {/* Galerie Photos / Vidéos */}
        <div style={{ padding: '20px', minHeight: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {photos.length === 0 ? (
            <div style={{ width: '100%', height: '130px', border: '2px dashed #cbd5e1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.5)', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
              📸 Vos photos ou vidéos apparaîtront ici...
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', maxWidth: '460px', width: '100%' }}>
              {photos.map((item, index) => {
                const uri = typeof item === 'object' ? item.uri : item;
                const type = typeof item === 'object' ? (item.type || '') : '';
                const isVideo = type.includes('video') || uri.endsWith('.mp4') || uri.endsWith('.webm') || uri.endsWith('.mov');
                const rotation = index % 2 === 0 ? '-1.5deg' : '1.5deg';

                return (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      backgroundColor: '#ffffff',
                      padding: '8px 8px 14px 8px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: isSingle ? 'none' : `rotate(${rotation})`,
                      display: 'inline-block',
                    }}
                  >
                    {/* Bouton de suppression rapide (Corbeille) */}
                    <button
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
                        width: '24px',
                        height: '24px',
                        fontSize: '12px',
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
                    </button>

                    {/* Conteneur cliquable pour la Lightbox */}
                    <div
                      onClick={() => setLightboxIndex(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isVideo ? (
                        <video
                          src={uri}
                          style={{ width: mediaSize, height: mediaSize, objectFit: 'cover', borderRadius: '8px', display: 'block', pointerEvents: 'none' }}
                          muted
                          playsInline
                        />
                      ) : (
                        <ShapedImage uri={uri} shape={shape} size={isSingle ? 220 : 120} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message personnalisé */}
        <div style={{ padding: '0 20px 24px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: '800', fontStyle: 'italic', color: currentTheme.textColor, margin: 0 }}>
            {message || 'Plein de bonheur !'}
          </p>
        </div>

        {/* MODALE LIGHTBOX WEB AVEC NAVIGATION & SUPPRESSION */}
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
            {/* Bouton Fermer */}
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

            {/* Bouton Supprimer dans la Lightbox */}
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

            {/* Bouton Magie IA (Design Pro Studio) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAiProcess) {
                  onAiProcess(lightboxIndex);
                } else {
                  alert("Traitement IA en cours de préparation...");
                }
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
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '0.5px',
              }}
            >
              ✨ Magie IA
            </button>

            {/* Flèche Précédent */}
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

            {/* Contenu Affiché (Image ou Vidéo) */}
            <div
              style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              {isLightboxVideo ? (
                <video
                  src={activeUri}
                  controls
                  autoPlay
                  style={{ maxWidth: '85vw', maxHeight: '80vh', borderRadius: '12px', display: 'block' }}
                />
              ) : (
                <img
                  src={activeUri}
                  alt="Agrandissement"
                  style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
                />
              )}
              <div style={{ color: '#ffffff', marginTop: '10px', fontSize: '13px', fontWeight: '600' }}>
                {lightboxIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Flèche Suivant */}
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
  // RENDU MOBILE NATIF (iOS / Android) — parité avec la version web
  // ============================================================
  const isSingleNative = photos.length === 1;
  const nativeMediaSize = isSingleNative ? 200 : 110;
  const lightboxMediaWidth = screenWidth * 0.88;
  const lightboxMediaHeight = screenHeight * 0.55;

  return (
    <View ref={cardRef} style={[styles.card, { backgroundColor: currentTheme.cardBg }]} collapsable={false}>
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={currentTheme.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {location ? (
          <View style={[styles.locationBadge, { backgroundColor: currentTheme.badgeBg }]}>
            <Text style={[styles.locationLabel, { color: currentTheme.accentColor }]}>
              ✨ coucou, je suis ici ! 📍
            </Text>
            <Text style={[styles.locationValue, { color: currentTheme.textColor }]}>{location}</Text>
          </View>
        ) : null}

        <Text style={styles.title}>{title || 'Meilleurs Vœux !'}</Text>
        <Text style={styles.subtitle}>
          {period ? `${period} • ` : ''}{subtitle || 'Des moments inoubliables'}
        </Text>
      </LinearGradient>

      {/* Galerie Photos / Vidéos */}
      <View style={styles.gallery}>
        {photos.length === 0 ? (
          <View style={styles.emptyPlaceholder}>
            <Text style={styles.emptyPlaceholderText}>📸 Vos photos ou vidéos apparaîtront ici...</Text>
          </View>
        ) : (
          <View style={styles.galleryGrid}>
            {photos.map((item, index) => {
              const uri = typeof item === 'object' ? item.uri : item;
              const type = typeof item === 'object' ? (item.type || '') : '';
              const isVideo = type.includes('video') || uri.endsWith('.mp4') || uri.endsWith('.webm') || uri.endsWith('.mov');
              const rotation = index % 2 === 0 ? '-1.5deg' : '1.5deg';

              return (
                <View
                  key={index}
                  style={[
                    styles.mediaFrame,
                    !isSingleNative && { transform: [{ rotate: rotation }] },
                  ]}
                >
                  {/* Bouton de suppression rapide */}
                  <TouchableOpacity
                    style={styles.deleteBadge}
                    onPress={() => onRemovePhoto && onRemovePhoto(index)}
                  >
                    <Text style={styles.deleteBadgeText}>✕</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.85} onPress={() => setLightboxIndex(index)}>
                    {isVideo ? (
                      <Video
                        source={{ uri }}
                        style={{ width: nativeMediaSize, height: nativeMediaSize, borderRadius: 8 }}
                        resizeMode="cover"
                        isMuted
                        useNativeControls={false}
                      />
                    ) : (
                      <ShapedImage
                        uri={uri}
                        shape={shape}
                        size={nativeMediaSize}
                        instanceId={index}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Message personnalisé */}
      <View style={styles.messageWrap}>
        <Text style={[styles.messageText, { color: currentTheme.textColor }]}>
          {message || 'Plein de bonheur !'}
        </Text>
      </View>

      {/* LIGHTBOX MOBILE */}
      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxIndex(null)}
      >
        <TouchableOpacity
          style={styles.lightboxOverlay}
          activeOpacity={1}
          onPress={() => setLightboxIndex(null)}
        >
          {/* Bouton Fermer */}
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxIndex(null)}>
            <Text style={styles.lightboxCloseText}>✕</Text>
          </TouchableOpacity>

          {/* Actions : Supprimer + Magie IA */}
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

          {/* Flèche Précédent */}
          {photos.length > 1 && (
            <TouchableOpacity style={[styles.lightboxArrow, styles.lightboxArrowLeft]} onPress={handlePrev}>
              <Text style={styles.lightboxArrowText}>‹</Text>
            </TouchableOpacity>
          )}

          {/* Contenu (Image ou Vidéo) */}
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

          {/* Flèche Suivant */}
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
    borderRadius: 20,
    overflow: 'hidden',
    // Ombre iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    // Ombre Android
    elevation: 8,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  locationBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  gallery: {
    padding: 20,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlaceholder: {
    width: '100%',
    height: 130,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  emptyPlaceholderText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    maxWidth: 460,
  },
  mediaFrame: {
    position: 'relative',
    backgroundColor: '#ffffff',
    padding: 8,
    paddingBottom: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  deleteBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageWrap: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  lightboxCloseText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lightboxActionsRow: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  lightboxDeleteBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lightboxAiBtn: {
    backgroundColor: '#a855f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lightboxBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  lightboxArrowText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  lightboxContent: {
    alignItems: 'center',
  },
  lightboxCounter: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
});