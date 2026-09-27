import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Video } from 'expo-av';
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
  onRemovePhoto, // Fonction pour supprimer un média par son index
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const themesConfig = {
    tropical: {
      bgHeader: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      accentColor: '#38bdf8',
      badgeBg: 'rgba(255, 255, 255, 0.95)',
    },
    noel: {
      bgHeader: 'linear-gradient(135deg, #881337 0%, #991b1b 100%)',
      cardBg: '#fffdfa',
      textColor: '#450a0a',
      accentColor: '#facc15',
      badgeBg: 'rgba(254, 243, 199, 0.95)',
    },
    romantique: {
      bgHeader: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
      cardBg: '#fff1f2',
      textColor: '#881337',
      accentColor: '#fb7185',
      badgeBg: 'rgba(255, 228, 230, 0.95)',
    },
    chic: {
      bgHeader: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      cardBg: '#fafafa',
      textColor: '#18181b',
      accentColor: '#d4d4d8',
      badgeBg: 'rgba(39, 39, 42, 0.9)',
    },
  };

  const currentTheme = themesConfig[theme] || themesConfig.tropical;

  // Gestion de la navigation Lightbox
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
  const activeType = activeItem ? (typeof activeItem === 'object' ? activeItem.type : '') : '';
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
          <div style={{ position: 'absolute', top: '14px', right: '14px', border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: '6px', padding: '4px 8px', transform: 'rotate(4deg)', color: 'rgba(255,255,255,0.95)', fontSize: '9px', fontWeight: '800', letterSpacing: '1px' }}>
            ✨ SOUVENIR UNIQUE
          </div>

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
                const type = typeof item === 'object' ? item.type : '';
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
                        isSingle ? (
                          <img
                            src={uri}
                            alt="Souvenir"
                            style={{ width: mediaSize, height: mediaSize, objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                          />
                        ) : (
                          <div style={{ width: mediaSize, height: mediaSize, overflow: 'hidden', borderRadius: '8px' }}>
                            <ShapedImage uri={uri} shape={shape} />
                          </div>
                        )
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
                  setLightboxIndex(null); // Ferme ou réinitialise
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

            {/* Flèche Précédent (si plus d'une photo) */}
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

            {/* Flèche Suivant (si plus d'une photo) */}
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

  // Rendu Mobile Natif
  return (
    <View ref={cardRef} style={[styles.flyerCard, { backgroundColor: currentTheme.cardBg }]} collapsable={false}>
      <View style={[styles.flyerHeader, { backgroundColor: '#0284c7' }]}>
        <View style={styles.postmarkStamp}><Text style={styles.postmarkText}>✨ SOUVENIR UNIQUE</Text></View>
        <View style={styles.mediaGallery}>
          {photos.length === 0 ? (
            <Text style={styles.placeholderText}>📸 Vos photos ici...</Text>
          ) : (
            photos.map((item, index) => {
              const uri = typeof item === 'object' ? item.uri : item;
              return (
                <View key={index} style={styles.polaroidFrame}>
                  <Video source={{ uri }} style={{ width: 105, height: 105, borderRadius: 6 }} resizeMode="cover" />
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flyerCard: { width: '100%', borderRadius: 20, overflow: 'hidden', elevation: 8 },
  flyerHeader: { padding: 24, alignItems: 'center' },
  postmarkStamp: { position: 'absolute', top: 14, right: 14, borderWidth: 1.5, borderColor: '#fff', borderRadius: 6, padding: 4 },
  postmarkText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  mediaGallery: { padding: 20, alignItems: 'center' },
  polaroidFrame: { backgroundColor: '#ffffff', padding: 8, borderRadius: 8 },
  placeholderText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
});