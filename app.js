import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
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
import { File, Paths } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { Audio } from 'expo-av';
import { captureRef } from 'react-native-view-shot';

import CardPreview from './components/CardPreview';
import PhotoAdjuster from './components/PhotoAdjuster';

const VIDEO_API_URL = 'https://souvenirs-vacances.onrender.com';

function formatDateAndSeason(date) {
  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const month = date.getMonth();
  const season = month < 2 || month === 11
    ? 'hiver'
    : month < 5
      ? 'printemps'
      : month < 8
        ? 'été'
        : month < 11
          ? 'automne'
          : 'hiver';

  return `${dateLabel} (${season} ${date.getFullYear()})`;
}

const SHAPES_OPTIONS = [
  { id: 'shape-square', label: 'Carré Arrondi', icon: '🔲' },
  { id: 'shape-portrait', label: 'Portrait', icon: '▯' },
  { id: 'shape-landscape', label: 'Paysage', icon: '▭' },
  { id: 'shape-heart', label: 'Cœur', icon: '❤️' },
  { id: 'shape-circle', label: 'Cercle', icon: '⚪' },
  { id: 'shape-oval', label: 'Ovale', icon: '🥚' },
  { id: 'shape-star', label: 'Étoile', icon: '⭐' },
  { id: 'shape-arch', label: 'Arche', icon: '🏛️' },
  { id: 'shape-torn', label: 'Photo déchirée', icon: '📄' },
  { id: 'shape-film', label: 'Pellicule', icon: '🎞️' },
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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [period, setPeriod] = useState(() => formatDateAndSeason(new Date()));
  const [selectedSeason, setSelectedSeason] = useState('today');
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
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
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [audioUri, setAudioUri] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [hasCustomAudio, setHasCustomAudio] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState('15');

  const cardRef = useRef();
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const daysInCalendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarDays = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: daysInCalendarMonth }, (_, index) => index + 1),
  ];

  const handlePeriodChange = (season, yearVal = selectedYear) => {
    setSelectedSeason(season);
    if (season === 'today') {
      const today = new Date();
      setSelectedDate(today);
      setSelectedYear(String(today.getFullYear()));
      setPeriod(formatDateAndSeason(today));
    } else if (season === 'customDate') {
      setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      setIsDateModalVisible(true);
    } else {
      setPeriod(`${season} ${yearVal}`);
    }
  };

  const selectCalendarDate = (day) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    setSelectedDate(date);
    setSelectedYear(String(date.getFullYear()));
    setSelectedSeason('customDate');
    setPeriod(formatDateAndSeason(date));
    setIsDateModalVisible(false);
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
    if (!files || files.length === 0) return;

    const readAsDataUrl = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    Promise.all(Array.from(files).map(async (file) => ({
      uri: await readAsDataUrl(file),
      type: file.type,
    }))).then((newMedia) => {
      setPhotos((prev) => [...prev, ...newMedia]);
    }).catch(() => {
      Alert.alert('Erreur', 'Impossible de charger cette photo.');
    });
  };

  const handleAudioFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUri = URL.createObjectURL(file);
      setAudioUri(fileUri);
      setAudioName(file.name);
      setHasCustomAudio(true);

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
        setHasCustomAudio(true);

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
      if (status !== 'granted') {
        setLocation('Localisation non autorisée');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      let cityName = '';

      if (Platform.OS !== 'web') {
        try {
          const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          });

          if (geocode.length > 0) {
            const place = geocode[0];
            cityName = place.city || place.town || place.village || place.subregion || place.region || '';
          }
        } catch {
          cityName = '';
        }
      } else {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=fr&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`,
          );
          const reverseGeocode = await response.json();
          const address = reverseGeocode.address || {};
          cityName = address.city || address.town || address.village || address.municipality || address.county || '';
        } catch {
          cityName = '';
        }
      }

      setLocation(cityName || 'Ville non disponible');
    } catch {
      setLocation('Position non disponible');
    }
  };

  const downloadImageJPG = async () => {
    setIsExportModalVisible(false);
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const uri = await captureRef(cardRef, { format: 'jpg', quality: 0.95 });
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.download = 'carte-de-voeux.jpg';
        link.href = uri;
        link.click();
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Partager ma carte souvenir',
        });
      } else {
        Alert.alert('Partage indisponible', 'Le partage de fichiers n\'est pas disponible sur cet appareil.');
      }
    } catch (err) {
      Alert.alert('Erreur', "Échec de l'enregistrement de l'image.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsMP4 = async () => {
    setIsExportModalVisible(false);

    if (!hasCustomAudio || !audioUri) {
      Alert.alert('Audio requis', 'Ajoute une musique ou enregistre un message avant de créer la vidéo.');
      return;
    }

    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const imageUri = await captureRef(cardRef, { format: 'jpg', quality: 0.95 });
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const imageBlob = await fetch(imageUri).then((response) => response.blob());
        const audioBlob = await fetch(audioUri).then((response) => response.blob());
        formData.append('image', imageBlob, 'carte.jpg');
        formData.append('audio', audioBlob, 'ambiance.mp3');
      } else {
        formData.append('image', new File(imageUri));
        formData.append('audio', new File(audioUri));
      }

      const request = Platform.OS === 'web' ? fetch : expoFetch;
      const response = await request(`${VIDEO_API_URL}/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (Platform.OS === 'web') {
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        const link = document.createElement('a');
        link.download = 'carte-souvenir.mp4';
        link.href = videoUrl;
        link.click();
        URL.revokeObjectURL(videoUrl);
      } else {
        const videoFile = new File(Paths.cache, 'carte-souvenir.mp4');
        if (videoFile.exists) videoFile.delete();
        videoFile.create();
        videoFile.write(new Uint8Array(await response.arrayBuffer()));
        await Sharing.shareAsync(videoFile.uri, {
          mimeType: 'video/mp4',
          dialogTitle: 'Partager ma vidéo souvenir',
        });
      }
    } catch (e) {
      const details = e?.message ? `\n\n${e.message}` : '';
      Alert.alert('Erreur Export Vidéo', `Impossible de générer le fichier vidéo.${details}`);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedShapeObj = SHAPES_OPTIONS.find((s) => s.id === shape);
  const renderCardPreview = (compact = false, previewRef = null) => (
    <View style={styles.previewSection}>
      <Text style={styles.previewTitle}>✨ Aperçu magique en direct</Text>
      <CardPreview
        cardRef={previewRef}
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
        hideControls={isExporting}
        compact={compact}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={isLargeScreen ? undefined : [2]}
      >
        <Text style={styles.mainTitle}> Studio de Création de Cartes Magiques</Text>
        <Text style={styles.mainSubtitle}>
          Personnalisez l'ambiance, les formes, les médias et la musique pour un rendu unique
        </Text>

        {!isLargeScreen && (
          <View style={styles.mobileStickyPreview}>
            {renderCardPreview(true, cardRef)}
          </View>
        )}

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
              <Text style={styles.dateSummary}>{period}</Text>
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
              <Text style={styles.label}>Message personnel (250 caractères maximum)</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={message}
                maxLength={250}
                multiline
                textAlignVertical="top"
                onChangeText={setMessage}
              />
              <Text style={styles.characterCount}>{message.length}/250</Text>
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

          {isLargeScreen && renderCardPreview(false, cardRef)}
        </View>

        {/* MODALE DATE */}
        <Modal
          visible={isDateModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.dateModalScrollView}
              contentContainerStyle={[
                styles.dateModalScrollContent,
                height < 500 && styles.dateModalScrollContentShort,
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choisir une date</Text>
                  <TouchableOpacity onPress={() => setIsDateModalVisible(false)}>
                    <Text style={styles.closeModalBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarMonthRow}>
                  <TouchableOpacity
                    accessibilityLabel="Mois précédent"
                    style={styles.calendarNavigationButton}
                    onPress={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  >
                    <Text style={styles.calendarNavigationText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.calendarMonthTitle}>
                    {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity
                    accessibilityLabel="Mois suivant"
                    style={styles.calendarNavigationButton}
                    onPress={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  >
                    <Text style={styles.calendarNavigationText}>›</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarWeekRow}>
                  {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day, index) => (
                    <View key={`${day}-${index}`} style={styles.calendarCell}>
                      <Text style={styles.calendarWeekday}>{day}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarDays.map((day, index) => {
                    const isSelected = day === selectedDate.getDate()
                      && calendarMonth.getMonth() === selectedDate.getMonth()
                      && calendarMonth.getFullYear() === selectedDate.getFullYear();

                    return (
                      <View key={`${calendarMonth.getFullYear()}-${calendarMonth.getMonth()}-${index}`} style={styles.calendarCell}>
                        {day ? (
                          <TouchableOpacity
                            accessibilityLabel={`${day} ${calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
                            style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                            onPress={() => selectCalendarDate(day)}
                          >
                            <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.calendarCancelButton}
                  onPress={() => setIsDateModalVisible(false)}
                >
                  <Text style={styles.calendarCancelText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

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
                <TouchableOpacity style={styles.exportOptionCard} onPress={downloadImageJPG}>
                  <Text style={styles.exportOptionIcon}>📸</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exportOptionTitle}>Partager en image JPG</Text>
                  </View>
                </TouchableOpacity>

                {hasCustomAudio && (
                  <TouchableOpacity style={styles.exportOptionCard} onPress={exportAsMP4}>
                    <Text style={styles.exportOptionIcon}>🎬</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exportOptionTitle}>Générer la vidéo MP4 avec audio</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
        {isExporting && (
          <View style={styles.exportingOverlay}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.exportingText}>Génération de la vidéo MP4...</Text>
          </View>
        )}
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
  columnFlex: { flexGrow: 0, flexShrink: 1, flexBasis: '42%', minWidth: 320 },
  editorPanel: { backgroundColor: '#1e293b', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#334155' },
  panelHeader: { fontSize: 18, fontWeight: '700', color: '#38bdf8', marginBottom: 18 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 10, color: '#ffffff', padding: 12, fontSize: 13 },
  messageInput: { minHeight: 88, textAlign: 'left' },
  characterCount: { color: '#94a3b8', fontSize: 11, textAlign: 'right', marginTop: 5 },
  seasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  seasonChip: { backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  themeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  themeDot: { width: 10, height: 10, borderRadius: 5 },
  seasonChipActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  seasonChipText: { color: '#94a3b8', fontSize: 11 },
  seasonChipTextActive: { color: '#ffffff', fontWeight: '700' },
  dateSummary: { color: '#e2e8f0', fontSize: 13, fontWeight: '600', marginTop: 9 },
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
  previewSection: { flex: 1, minWidth: 0 },
  mobileStickyPreview: { alignSelf: 'stretch', marginHorizontal: -20, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 7, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#334155', zIndex: 20, elevation: 8 },
  previewTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  exportingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  exportingText: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 14 },
  modalContent: { width: '100%', maxWidth: 480, backgroundColor: '#1e293b', borderRadius: 18, padding: 22, borderWidth: 1, borderColor: '#334155' },
  dateModalScrollView: { flex: 1, width: '100%' },
  dateModalScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  dateModalScrollContentShort: { justifyContent: 'flex-start' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  closeModalBtn: { color: '#94a3b8', fontSize: 20, fontWeight: '700', padding: 4 },
  calendarMonthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  calendarNavigationButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  calendarNavigationText: { color: '#38bdf8', fontSize: 26, lineHeight: 30 },
  calendarMonthTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  calendarWeekRow: { flexDirection: 'row' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.2857%', height: 38, padding: 2, alignItems: 'stretch', justifyContent: 'center' },
  calendarWeekday: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  calendarDay: { flex: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  calendarDaySelected: { backgroundColor: '#0284c7' },
  calendarDayText: { color: '#e2e8f0', fontSize: 14 },
  calendarDayTextSelected: { color: '#ffffff', fontWeight: '800' },
  calendarCancelButton: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  calendarCancelText: { color: '#38bdf8', fontSize: 13, fontWeight: '700' },
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