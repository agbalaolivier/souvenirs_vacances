import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CardPreview from '../CardPreview';

const TOOLS = [
  { id: 'photos', icon: '▧', label: 'Photos' },
  { id: 'style', icon: '✦', label: 'Style' },
  { id: 'text', icon: 'T', label: 'Texte' },
  { id: 'audio', icon: '♫', label: 'Audio' },
  { id: 'more', icon: '•••', label: 'Plus' },
];

export default function MobileEditor({
  cardRef,
  title,
  period,
  subtitle,
  message,
  location,
  photos,
  shape,
  shapes,
  theme,
  themes,
  audioName,
  isRecording,
  isExporting,
  isExportModalVisible,
  hasCustomAudio,
  onTitleChange,
  onSubtitleChange,
  onMessageChange,
  onThemeChange,
  onShapeChange,
  onPickImages,
  onWebMediaChange,
  onAudioFileChange,
  onToggleRecording,
  onLocation,
  onRemovePhoto,
  onAiProcess,
  onOpenExport,
  onCloseExport,
  onDownloadJPG,
  onExportMP4,
}) {
  const [activeTool, setActiveTool] = useState(null);

  const closeSheet = () => setActiveTool(null);
  const selectTool = (toolId) => setActiveTool((current) => (current === toolId ? null : toolId));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NOUVEAU SOUVENIR</Text>
          <Text style={styles.headerTitle}>Ma carte</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={onOpenExport} accessibilityLabel="Partager la carte">
          <Text style={styles.headerActionIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.canvasFrame}>
          <CardPreview
            cardRef={cardRef}
            title={title}
            period={period}
            subtitle={subtitle}
            location={location}
            photos={photos}
            shape={shape}
            message={message}
            theme={theme}
            onRemovePhoto={onRemovePhoto}
            onAiProcess={onAiProcess}
            hideControls={isExporting}
          />
        </View>

        <View style={styles.canvasHint}>
          <View style={styles.liveDot} />
          <Text style={styles.canvasHintText}>{photos.length} photo{photos.length > 1 ? 's' : ''} dans la carte</Text>
          <Text style={styles.canvasHintText}>•</Text>
          <Text style={styles.canvasHintText}>Modifiable</Text>
        </View>
      </ScrollView>

      {activeTool && (
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{TOOLS.find((tool) => tool.id === activeTool)?.label}</Text>
            <TouchableOpacity onPress={closeSheet} accessibilityLabel="Fermer le panneau">
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>
          {activeTool === 'photos' && (
            <View style={styles.sheetBody}>
              {Platform.OS === 'web' ? (
                <label style={styles.primaryAction}>
                  <span>＋ Ajouter des photos</span>
                  <input type="file" accept="image/*,video/*" multiple onChange={onWebMediaChange} style={{ display: 'none' }} />
                </label>
              ) : (
                <TouchableOpacity style={styles.primaryAction} onPress={onPickImages}>
                  <Text style={styles.primaryActionText}>＋ Ajouter des photos</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.helperText}>Les photos apparaissent directement dans ton collage.</Text>
            </View>
          )}
          {activeTool === 'style' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stylePanel}>
              <Text style={styles.optionTitle}>Ambiance</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
                {themes.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.themeItem, theme === item.id && styles.themeItemActive]} onPress={() => onThemeChange(item.id)}>
                    <View style={[styles.themeSwatch, { backgroundColor: item.color }]} />
                    <Text style={[styles.themeLabel, theme === item.id && styles.themeLabelActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.optionTitle}>Forme des photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shapeRow}>
                {shapes.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.shapeItem, shape === item.id && styles.shapeItemActive]} onPress={() => onShapeChange(item.id)}>
                    <Text style={styles.shapeIcon}>{item.icon}</Text>
                    <Text style={[styles.themeLabel, shape === item.id && styles.themeLabelActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>
          )}
          {activeTool === 'text' && (
            <View style={styles.sheetBody}>
              <TextInput value={title} onChangeText={onTitleChange} placeholder="Titre de la carte" placeholderTextColor="#8b8f9a" style={styles.field} />
              <TextInput value={subtitle} onChangeText={onSubtitleChange} placeholder="Sous-titre" placeholderTextColor="#8b8f9a" style={styles.field} />
              <TextInput value={message} onChangeText={onMessageChange} placeholder="Message personnel" placeholderTextColor="#8b8f9a" multiline style={[styles.field, styles.messageField]} />
            </View>
          )}
          {activeTool === 'audio' && (
            <View style={styles.sheetBody}>
              {Platform.OS === 'web' && (
                <label style={styles.secondaryAction}>
                  <span>♫ Choisir une musique</span>
                  <input type="file" accept="audio/*" onChange={onAudioFileChange} style={{ display: 'none' }} />
                </label>
              )}
              <TouchableOpacity style={styles.secondaryAction} onPress={onToggleRecording}>
                <Text style={styles.secondaryActionText}>{isRecording ? '■ Arrêter l’enregistrement' : '● Enregistrer un message'}</Text>
              </TouchableOpacity>
              {audioName ? <Text style={styles.helperText}>Piste: {audioName}</Text> : <Text style={styles.helperText}>Ajoute une musique pour créer une vidéo MP4.</Text>}
            </View>
          )}
          {activeTool === 'more' && (
            <View style={styles.sheetBody}>
              <TouchableOpacity style={styles.secondaryAction} onPress={onLocation}>
                <Text style={styles.secondaryActionText}>⌖ Ajouter ma ville</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>La ville sera affichée sur la carte, sans coordonnées GPS.</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.toolbar}>
        {TOOLS.map((tool) => (
          <TouchableOpacity key={tool.id} style={[styles.toolButton, activeTool === tool.id && styles.toolButtonActive]} onPress={() => selectTool(tool.id)}>
            <View style={[styles.toolIconBubble, activeTool === tool.id && styles.toolIconBubbleActive]}>
              <Text style={[styles.toolIcon, activeTool === tool.id && styles.toolIconActive]}>{tool.icon}</Text>
            </View>
            <Text style={[styles.toolLabel, activeTool === tool.id && styles.toolLabelActive]}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={isExportModalVisible} transparent animationType="slide" onRequestClose={onCloseExport}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exportSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Partager ta création</Text>
              <TouchableOpacity onPress={onCloseExport} accessibilityLabel="Fermer le partage">
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.primaryAction} onPress={onDownloadJPG}>
              <Text style={styles.primaryActionText}>Partager en image JPG</Text>
            </TouchableOpacity>
            {hasCustomAudio && (
              <TouchableOpacity style={styles.secondaryAction} onPress={onExportMP4}>
                <Text style={styles.secondaryActionText}>Générer la vidéo MP4</Text>
              </TouchableOpacity>
            )}
            {!hasCustomAudio && <Text style={styles.helperText}>Ajoute un audio pour créer une vidéo MP4.</Text>}
          </View>
        </View>
      </Modal>

      {isExporting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Préparation de ta vidéo...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fafaf9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  eyebrow: { color: '#9b6f59', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  headerTitle: { color: '#272522', fontSize: 24, fontWeight: '800', marginTop: 2 },
  headerAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#356b60', alignItems: 'center', justifyContent: 'center' },
  headerActionIcon: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 108 },
  canvasFrame: { backgroundColor: '#ffffff', borderRadius: 18, padding: 8, shadowColor: '#47382f', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 5 },
  canvasHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 14 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2f8b72' },
  canvasHintText: { color: '#77736e', fontSize: 12, fontWeight: '600' },
  toolbar: { position: 'absolute', left: 10, right: 10, bottom: 12, minHeight: 82, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e9e7e3', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, shadowColor: '#5c5147', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 8 },
  toolButton: { alignItems: 'center', justifyContent: 'center', minWidth: 58, paddingVertical: 7, paddingHorizontal: 7, borderRadius: 16 },
  toolButtonActive: { backgroundColor: '#eef5f2' },
  toolIconBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f2ef', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  toolIconBubbleActive: { backgroundColor: '#356b60' },
  toolIcon: { color: '#4f5651', fontSize: 19, lineHeight: 23, fontWeight: '700' },
  toolIconActive: { color: '#ffffff' },
  toolLabel: { color: '#777b77', fontSize: 10, fontWeight: '800' },
  toolLabelActive: { color: '#356b60' },
  sheet: { position: 'absolute', left: 10, right: 10, bottom: 98, maxHeight: 330, borderRadius: 22, backgroundColor: '#ffffff', padding: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 9, zIndex: 10 },
  sheetHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#d9d6d0', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { color: '#292724', fontSize: 18, fontWeight: '800' },
  closeIcon: { color: '#77736e', fontSize: 28, lineHeight: 28 },
  sheetBody: { gap: 10 },
  primaryAction: { backgroundColor: '#2f6258', borderRadius: 13, padding: 14, alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  primaryActionText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  secondaryAction: { backgroundColor: '#edf2ef', borderRadius: 13, padding: 14, alignItems: 'center', justifyContent: 'center', color: '#2f6258', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  secondaryActionText: { color: '#2f6258', fontSize: 14, fontWeight: '800' },
  helperText: { color: '#817c75', fontSize: 12, lineHeight: 17, textAlign: 'center' },
  themeRow: { gap: 10, paddingBottom: 4 },
  stylePanel: { gap: 8, paddingBottom: 4 },
  optionTitle: { color: '#77736e', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  themeItem: { width: 88, alignItems: 'center', padding: 8, borderRadius: 13 },
  themeItemActive: { backgroundColor: '#edf2ef' },
  themeSwatch: { width: 42, height: 42, borderRadius: 21, marginBottom: 7 },
  themeLabel: { color: '#77736e', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  themeLabelActive: { color: '#2f6258' },
  shapeRow: { gap: 8, paddingBottom: 4 },
  shapeItem: { width: 82, minHeight: 64, alignItems: 'center', justifyContent: 'center', padding: 7, borderRadius: 13, backgroundColor: '#fafaf9' },
  shapeItemActive: { backgroundColor: '#e8f1ee' },
  shapeIcon: { color: '#4e5752', fontSize: 22, lineHeight: 26, marginBottom: 3 },
  field: { borderWidth: 1, borderColor: '#e3dfd9', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, color: '#2d2a27', fontSize: 14, backgroundColor: '#fbfaf8' },
  messageField: { minHeight: 70, textAlignVertical: 'top' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(35, 42, 40, 0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  loadingText: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(34, 37, 35, 0.42)', justifyContent: 'flex-end' },
  exportSheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
});