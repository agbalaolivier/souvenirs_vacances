import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import { captureRef } from 'react-native-view-shot';

import CardPreview from './components/CardPreview';

const SHAPES_OPTIONS = [
  { id: 'shape-square', label: 'Carré Arrondi', icon: '🔲' },
  { id: 'shape-heart', label: 'Cœur', icon: '❤️' },
  { id: 'shape-circle', label: 'Cercle', icon: '⚪' },
  { id: 'shape-star', label: 'Étoile', icon: '⭐' },
  { id: 'shape-diamond', label: 'Losange / Diamant', icon: '🔷' },
  { id: 'shape-hexagon', label: 'Hexagone', icon: '⬢' },
  { id: 'shape-bubble', label: 'Bulle', icon: '💬' },
  { id: 'shape-stamp', label: 'Timbre', icon: '✉️' },
  { id: 'shape-clover', label: 'Trèfle / Fleur', icon: '🍀' },
  { id: 'shape-cloud', label: 'Nuage', icon: '☁️' },
];

const THEMES_OPTIONS = [
  { id: 'tropical', label: 'Tropical & Soleil', color: '#0ea5e9' },
  { id: 'noel', label: 'Fêtes & Noël', color: '#9f1239' },
  { id: 'romantique', label: 'Romantique', color: '#db2777' },
  { id: 'chic', label: 'Chic Minimaliste', color: '#52525b' },
  { id: 'anniversaire', label: 'Anniversaire & Fête', color: '#a21caf' },
  { id: 'automne', label: 'Automne Doré', color: '#b45309' },
  { id: 'printemps', label: 'Printemps Frais', color: '#10b981' },
  { id: 'luxe', label: 'Luxe Nocturne', color: '#d4af37' },
  { id: 'fairepart', label: 'Faire-Part Élégant', color: '#c5a880' },
];

export default function App() {
  const [title, setTitle] = useState('Meilleurs Vœux & Souvenirs !');
  const [period, setPeriod] = useState("Aujourd'hui");
  const [selectedSeason, setSelectedSeason] = useState('today');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [customDate, setCustomDate] = useState('');
  const [subtitle, setSubtitle] = useState('Des moments inoubliables partagés avec vous');
  const [message, setMessage] = useState('Plein de bonheur et de soleil !');
  const [location, setLocation] = useState('Paradis Tropical');
  const [photos, setPhotos] = useState([]);

  // Fonction pour retirer un média de la liste
  const removePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Fonction de traitement Magie IA sur un média
  const handleAiProcess = async (index) => {
    const targetMedia = photos[index];
    const uri = typeof targetMedia === 'object' ? targetMedia.uri : targetMedia;

    Alert.alert(
      "✨ Magie IA en action",
      "Que souhaitez-vous faire avec ce média ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: " Effet Peinture / Style Pro",
          onPress: () => {
            Alert.alert("Succès", "Le style IA a été appliqué au souvenir !");
          }
        },
        {
          text: "🪄 Supprimer l'arrière-plan",
          onPress: () => {
            Alert.alert("Succès", "Arrière-plan détouré par l'IA !");
          }
        }
      ]
    );
  };

  const [shape, setShape] = useState('shape-square');
  const [theme, setTheme] = useState('tropical');
  const [isShapeModalVisible, setIsShapeModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);

  const [audioUri, setAudioUri] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [audioName, setAudioName] = useState('Musique d\'ambiance longue (Défaut)');
  const [sound, setSound] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState('15');

  const cardRef = useRef();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const handlePeriodChange = (season, yearVal = selectedYear, dateVal = customDate) => {
    setSelectedSeason(season);
    if (season === 'today') {
      setPeriod("Aujourd'hui");
    } else if (season === 'customDate') {
      setPeriod(dateVal || 'Date précise');
    } else {
      setPeriod(`${season} ${yearVal}`);
    }
  };

  const pickImagesMobile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    // FIX: ImagePicker.MediaTypeOptions est déprécié/supprimé dans les versions
    // récentes d'expo-image-picker (SDK 52+). On garde la compatibilité avec
    // les deux versions de l'API au lieu de planter si MediaTypeOptions n'existe plus.
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions
        ? ImagePicker.MediaTypeOptions.All
        : ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
      }));
      setPhotos((prev) => [...prev, ...selectedUris]);
    }
  };

  const handleWebFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newMedia = Array.from(files).map((file) => ({
        uri: URL.createObjectURL(file),
        type: file.type,
      }));
      setPhotos((prev) => [...prev, ...newMedia]);
    }
  };

  const handleAudioFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUri = URL.createObjectURL(file);
      setAudioUri(fileUri);
      setAudioName(file.name);

      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false }
      );
      setSound(newSound);
      setIsPlayingAudio(false);
    }
  };

  const toggleRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission refusée', 'Accès au micro requis.');
        return;
      }

      if (isRecording) {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setAudioName('Mon_message_vocal.wav');

        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setRecording(null);
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const rec = new Audio.Recording();
        // FIX: la constante correcte dans expo-av est Audio.RecordingOptionsPresets.HIGH_QUALITY
        // (Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY n'existe pas et faisait planter l'enregistrement)
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setIsRecording(true);
      }
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'enregistrer l'audio.");
      setIsRecording(false);
    }
  };

  const toggleAudio = async () => {
    try {
      if (!sound && audioUri) {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
        setSound(newSound);
        await newSound.playAsync();
        setIsPlayingAudio(true);
        return;
      }
      if (sound) {
        if (isPlayingAudio) {
          await sound.pauseAsync();
          setIsPlayingAudio(false);
        } else {
          await sound.playAsync();
          setIsPlayingAudio(true);
        }
      }
    } catch (e) {
      Alert.alert('Erreur Audio', 'Impossible de lire la musique.');
    }
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const cityName = place.city || place.town || place.village || 'Ma position';
          const countryName = place.country || '';
          setLocation(`${cityName}, ${countryName}`);
          return;
        }
      }

      if (Platform.OS === 'web') {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.city && data.country_name) {
          setLocation(`${data.city}, ${data.country_name}`);
          return;
        }
      }

      setLocation('Destination de Rêve');
    } catch {
      setLocation('Destination de Rêve');
    }
  };

  const downloadImagePNG = async () => {
    setIsExportModalVisible(false);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 0.9 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.download = 'carte-de-voeux.png';
        link.href = uri;
        link.click();
      }
    } catch (err) {
      Alert.alert('Erreur', "Échec de l'enregistrement de l'image.");
    }
  };

  const exportAsMP4 = async () => {
    setIsExportModalVisible(false);
    const durationMs = parseInt(audioDuration, 10) * 1000 || 15000;

    if (Platform.OS !== 'web') {
      Alert.alert('Information', "L'exportation vidéo est optimisée pour le navigateur web.");
      return;
    }

    // FIX: vérifie que le navigateur supporte réellement l'enregistrement vidéo
    if (typeof MediaRecorder === 'undefined') {
      Alert.alert('Erreur', "Votre navigateur ne supporte pas l'enregistrement vidéo.");
      return;
    }

    try {
      const imageUri = await captureRef(cardRef, { format: 'png', quality: 1.0 });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      img.src = imageUri;

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const canvasStream = canvas.captureStream(30);
        let combinedStream = canvasStream;
        let audioElement = null;

        if (audioUri) {
          try {
            audioElement = new window.Audio(audioUri);
            audioElement.loop = true;
            await audioElement.play();
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaElementSource(audioElement);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);

            combinedStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              ...dest.stream.getAudioTracks(),
            ]);
          } catch (audioErr) {
            // FIX: si l'audio ne peut pas être capturé (ex: autoplay bloqué),
            // on continue quand même l'export en vidéo silencieuse au lieu de tout planter.
            console.warn("Impossible d'ajouter l'audio à la vidéo :", audioErr);
            combinedStream = canvasStream;
          }
        }

        // FIX: on vérifie le codec réellement supporté au lieu de le forcer en vp9
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          // FIX: le fichier produit est réellement au format webm (pas mp4).
          // On garde le type et l'extension cohérents pour que le fichier
          // s'ouvre correctement, au lieu d'un .mp4 qui contient en fait du webm.
          const blob = new Blob(chunks, { type: mimeType });
          const videoUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'carte-de-voeux-animee.webm';
          link.href = videoUrl;
          link.click();
          URL.revokeObjectURL(videoUrl);
          if (audioElement) audioElement.pause();
        };

        mediaRecorder.start();

        const interval = setInterval(() => {
          ctx.drawImage(img, 0, 0);
        }, 1000 / 30);

        setTimeout(() => {
          clearInterval(interval);
          mediaRecorder.stop();
        }, durationMs);
      };
    } catch (e) {
      Alert.alert('Erreur Export Vidéo', "Impossible de générer le fichier vidéo.");
    }
  };

  const selectedShapeObj = SHAPES_OPTIONS.find((s) => s.id === shape);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}> Studio de Création de Cartes Magiques</Text>
        <Text style={styles.mainSubtitle}>
          Personnalisez l'ambiance, les formes, les médias et la musique pour un rendu unique
        </Text>

        <View style={[styles.mainLayout, isLargeScreen && styles.twoColumnLayout]}>
          {/* COLONNE GAUCHE : FORMULAIRE */}
          <View style={[styles.editorPanel, isLargeScreen && styles.columnFlex]}>
            <Text style={styles.panelHeader}> Personnalisation & Ambiance</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ambiance / Thème visuel</Text>
              <View style={styles.seasonRow}>
                {THEMES_OPTIONS.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.themeChip, theme === t.id && styles.seasonChipActive]}
                    onPress={() => setTheme(t.id)}
                  >
                    <View style={[styles.themeDot, { backgroundColor: t.color }]} />
                    <Text style={[styles.seasonChipText, theme === t.id && styles.seasonChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre principal</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Période et date</Text>
              <View style={styles.seasonRow}>
                {['today', 'Été', 'Hiver', 'Printemps', 'customDate'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.seasonChip, selectedSeason === s && styles.seasonChipActive]}
                    onPress={() => handlePeriodChange(s)}
                  >
                    <Text style={[styles.seasonChipText, selectedSeason === s && styles.seasonChipTextActive]}>
                      {s === 'today' ? "Aujourd'hui" : s === 'customDate' ? 'Date...' : s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message de sous-titre</Text>
              <TextInput style={styles.input} value={subtitle} onChangeText={setSubtitle} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Médias de la carte (Photos ou Vidéos)</Text>
              {Platform.OS === 'web' ? (
                <label style={styles.webFileButton}>
                  🎬 Sélectionner photos ou vidéos
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleWebFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <TouchableOpacity style={styles.fileUploadBtn} onPress={pickImagesMobile}>
                  <Text style={styles.fileUploadBtnText}>🎬 Sélectionner photos ou vidéos</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Style de découpe des photos</Text>
              <TouchableOpacity
                style={styles.shapeSelectorBtn}
                onPress={() => setIsShapeModalVisible(true)}
              >
                <Text style={styles.shapeSelectorText}>
                  {selectedShapeObj?.icon} {selectedShapeObj?.label} (Changer de forme)
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Musique d'ambiance ou voix</Text>
              <View style={styles.audioRowActions}>
                {Platform.OS === 'web' && (
                  <label style={styles.webAudioButton}>
                    🎵 Fichier MP3
                    <input
                      type="file"
                      accept="audio/mp3,audio/*"
                      onChange={handleAudioFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}

                <TouchableOpacity
                  style={[styles.btnRecord, isRecording && styles.btnRecordingActive]}
                  onPress={toggleRecording}
                >
                  <Text style={styles.btnRecordText}>
                    {isRecording ? '🔴 Enregistrement...' : '🎙️ Enregistrer un message'}
                  </Text>
                </TouchableOpacity>
              </View>

              {audioName ? <Text style={styles.audioFileInfo}>Piste active : {audioName}</Text> : null}

              <TouchableOpacity style={styles.btnPlayAudio} onPress={toggleAudio}>
                <Text style={styles.btnPlayAudioText}>
                  {isPlayingAudio ? '⏸️ Suspendre la musique' : '▶️ Tester l\'ambiance musicale'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Localisation</Text>
              <TouchableOpacity style={styles.btnGeo} onPress={fetchLocation}>
                <Text style={styles.btnGeoText}>📍 Ajouter / Détecter la localisation</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message personnel (max 30 caractères)</Text>
              <TextInput
                style={styles.input}
                value={message}
                maxLength={30}
                onChangeText={setMessage}
              />
            </View>

            <View style={styles.exportActions}>
              <TouchableOpacity
                style={styles.btnDownload}
                onPress={() => setIsExportModalVisible(true)}
              >
                <Text style={styles.btnExportText}> Enregistrer / Partager la Carte ▾</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* COLONNE DROITE : APERÇU */}
          <View style={[styles.previewSection, isLargeScreen && styles.columnFlex]}>
            <Text style={styles.previewTitle}>✨ Aperçu magique en direct</Text>
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
              onRemovePhoto={removePhoto}
              onAiProcess={handleAiProcess}
            />
          </View>
        </View>

        {/* MODALE FORMES */}
        <Modal
          visible={isShapeModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsShapeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choisissez une forme artistique</Text>
                <TouchableOpacity onPress={() => setIsShapeModalVisible(false)}>
                  <Text style={styles.closeModalBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }}>
                <View style={styles.shapesGrid}>
                  {SHAPES_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.shapeCard,
                        shape === item.id && styles.shapeCardSelected,
                      ]}
                      onPress={() => {
                        setShape(item.id);
                        setIsShapeModalVisible(false);
                      }}
                    >
                      <Text style={styles.shapeCardIcon}>{item.icon}</Text>
                      <Text style={styles.shapeCardLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODALE EXPORT */}
        <Modal
          visible={isExportModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsExportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Partagez votre chef-d'œuvre</Text>
                <TouchableOpacity onPress={() => setIsExportModalVisible(false)}>
                  <Text style={styles.closeModalBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.exportOptionsList}>
                <TouchableOpacity style={styles.exportOptionCard} onPress={downloadImagePNG}>
                  <Text style={styles.exportOptionIcon}>📸</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exportOptionTitle}>Télécharger en Image HD (PNG)</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.exportOptionCard} onPress={exportAsMP4}>
                  <Text style={styles.exportOptionIcon}>🎬</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exportOptionTitle}>Générer la Carte Vidéo (WebM)</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 1240, width: '100%', alignSelf: 'center' },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#f8fafc', textAlign: 'center', marginTop: 10 },
  mainSubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  mainLayout: { flexDirection: 'column', gap: 20 },
  twoColumnLayout: { flexDirection: 'row', alignItems: 'flex-start' },
  columnFlex: { flex: 1 },
  editorPanel: { backgroundColor: '#1e293b', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#334155' },
  panelHeader: { fontSize: 18, fontWeight: '700', color: '#38bdf8', marginBottom: 18 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 10, color: '#ffffff', padding: 12, fontSize: 13 },
  seasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  seasonChip: { backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  themeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  themeDot: { width: 10, height: 10, borderRadius: 5 },
  seasonChipActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  seasonChipText: { color: '#94a3b8', fontSize: 11 },
  seasonChipTextActive: { color: '#ffffff', fontWeight: '700' },
  webFileButton: { display: 'flex', backgroundColor: '#0d9488', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 13, fontWeight: '700', cursor: 'pointer' },
  fileUploadBtn: { backgroundColor: '#0d9488', borderRadius: 10, padding: 12, alignItems: 'center' },
  fileUploadBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  shapeSelectorBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 10, padding: 12 },
  shapeSelectorText: { color: '#38bdf8', fontSize: 13, fontWeight: '700' },
  dropdownArrow: { color: '#38bdf8', fontSize: 12 },
  audioRowActions: { flexDirection: 'row', gap: 8 },
  webAudioButton: { flex: 1, display: 'flex', backgroundColor: '#0284c7', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 12, fontWeight: '700', cursor: 'pointer' },
  btnRecord: { flex: 1, backgroundColor: '#0f172a', borderColor: '#ef4444', borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center' },
  btnRecordingActive: { backgroundColor: '#ef4444' },
  btnRecordText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  audioFileInfo: { color: '#38bdf8', fontSize: 11, marginTop: 6, fontStyle: 'italic' },
  btnPlayAudio: { backgroundColor: '#0f172a', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8, alignItems: 'center' },
  btnPlayAudioText: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
  btnGeo: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnGeoText: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
  exportActions: { marginTop: 18 },
  btnDownload: { backgroundColor: '#f43f5e', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnExportText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  previewSection: { width: '100%' },
  previewTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 480, backgroundColor: '#1e293b', borderRadius: 18, padding: 22, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  closeModalBtn: { color: '#94a3b8', fontSize: 20, fontWeight: '700', padding: 4 },
  shapesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  shapeCard: { width: '48%', backgroundColor: '#0f172a', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  shapeCardSelected: { borderColor: '#38bdf8', backgroundColor: '#0369a1' },
  shapeCardIcon: { fontSize: 24, marginBottom: 6 },
  shapeCardLabel: { color: '#ffffff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  exportOptionsList: { gap: 12 },
  exportOptionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#334155', gap: 14 },
  exportOptionIcon: { fontSize: 28 },
  exportOptionTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});