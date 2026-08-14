// URL officielle de votre application sur GitHub Pages
const APP_LINK = "https://agbalaolivier.github.io/souvenirs_vacances/";

// Variables globales pour la galerie Lightbox
let loadedPhotos = [];
let currentPhotoIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. RÉCUPÉRATION DES ÉLÉMENTS DU DOM
    // -------------------------------------------------------------
    const inTitle = document.getElementById('inTitle');
    const inSubtitle = document.getElementById('inSubtitle');
    const inMessage = document.getElementById('inMessage');
    const inMedia = document.getElementById('inMedia');

    const outTitle = document.getElementById('outTitle');
    const outSubtitle = document.getElementById('outSubtitle');
    const outMessage = document.getElementById('outMessage');
    const mediaGallery = document.getElementById('mediaGallery');

    const btnDownload = document.getElementById('btnDownload');
    const btnShare = document.getElementById('btnShare');
    const flyerCard = document.getElementById('flyerCard');

    // Éléments de la Modale Lightbox
    const imageModal = document.getElementById('imageModal');
    const imgFull = document.getElementById('imgFull');
    const closeModal = document.querySelector('.close-modal');
    const btnDownloadSingle = document.getElementById('btnDownloadSingle');
    const modalCounter = document.getElementById('modalCounter');
    const prevPhoto = document.getElementById('prevPhoto');
    const nextPhoto = document.getElementById('nextPhoto');

    // -------------------------------------------------------------
    // 2. MISE À JOUR DYNAMIQUE DES TEXTES
    // -------------------------------------------------------------
    if (inTitle && outTitle) inTitle.addEventListener('input', e => outTitle.textContent = e.target.value);
    if (inSubtitle && outSubtitle) inSubtitle.addEventListener('input', e => outSubtitle.textContent = e.target.value);
    if (inMessage && outMessage) inMessage.addEventListener('input', e => outMessage.textContent = e.target.value);

    // -------------------------------------------------------------
    // 3. GESTION DE LA GALERIE PHOTO & LIGHTBOX (STYLE WHATSAPP)
    // -------------------------------------------------------------
    function updateLightbox(index) {
        if (loadedPhotos.length === 0) return;
        currentPhotoIndex = index;
        
        const photoData = loadedPhotos[currentPhotoIndex];
        imgFull.src = photoData;
        btnDownloadSingle.href = photoData;
        btnDownloadSingle.download = `photo-vacances-${currentPhotoIndex + 1}.jpg`;
        modalCounter.textContent = `${currentPhotoIndex + 1} / ${loadedPhotos.length}`;
        
        // Affichage conditionnel des flèches
        prevPhoto.style.display = loadedPhotos.length > 1 ? 'block' : 'none';
        nextPhoto.style.display = loadedPhotos.length > 1 ? 'block' : 'none';
    }

    // Navigation entre les photos
    if (prevPhoto) {
        prevPhoto.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentPhotoIndex - 1 + loadedPhotos.length) % loadedPhotos.length;
            updateLightbox(newIndex);
        });
    }

    if (nextPhoto) {
        nextPhoto.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentPhotoIndex + 1) % loadedPhotos.length;
            updateLightbox(newIndex);
        });
    }

    // Fermeture de la modale
    if (closeModal && imageModal) {
        closeModal.addEventListener('click', () => imageModal.style.display = 'none');
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target.classList.contains('lightbox-content-wrapper')) {
                imageModal.style.display = 'none';
            }
        });
    }

    // Importation des photos depuis l'ordinateur/téléphone
    if (inMedia) {
        inMedia.addEventListener('change', e => {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            if (!mediaGallery) return;

            mediaGallery.innerHTML = '';
            loadedPhotos = [];

            if (files.length === 0) {
                mediaGallery.innerHTML = '<div class="placeholder-box">Vos photos apparaîtront ici...</div>';
                return;
            }

            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = ev => {
                    const src = ev.target.result;
                    loadedPhotos.push(src);

                    const img = document.createElement('img');
                    img.src = src;
                    img.className = 'media-item';

                    // Clic sur l'image = Ouverture de la visionneuse
                    img.addEventListener('click', () => {
                        updateLightbox(loadedPhotos.indexOf(src));
                        imageModal.style.display = 'flex';
                    });

                    mediaGallery.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // -------------------------------------------------------------
    // 4. FONCTION UTILITAIRE : GÉNÉRATION SÉCURISÉE DU CANVAS
    // -------------------------------------------------------------
    async function generateCanvas() {
        if (typeof html2canvas === 'undefined') {
            throw new Error("La bibliothèque html2canvas n'est pas chargée dans la page.");
        }

        return await html2canvas(flyerCard, {
            scale: 2,
            useCORS: true,
            allowTaint: false, // Empêche l'erreur 'Tainted canvas' sur toBlob()
            logging: false
        });
    }

    // -------------------------------------------------------------
    // 5. BOUTON : ENREGISTRER L'IMAGE DE LA CARTE
    // -------------------------------------------------------------
    if (btnDownload) {
        btnDownload.addEventListener('click', async () => {
            const originalText = btnDownload.innerText;
            try {
                btnDownload.innerText = "⏳ Génération...";
                btnDownload.disabled = true;

                const canvas = await generateCanvas();
                const link = document.createElement('a');
                link.download = 'carte-souvenir-vacances.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Erreur d'exportation :", err);
                alert("Impossible de générer l'image : " + err.message);
            } finally {
                btnDownload.innerText = originalText;
                btnDownload.disabled = false;
            }
        });
    }

    // -------------------------------------------------------------
    // 6. BOUTON : PARTAGER LA CARTE ET L'APPLICATION
    // -------------------------------------------------------------
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const originalText = btnShare.innerText;
            try {
                btnShare.innerText = "⏳ Préparation...";
                btnShare.disabled = true;

                const canvas = await generateCanvas();

                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        alert("Erreur lors de la préparation du fichier image.");
                        return;
                    }

                    const file = new File([blob], 'souvenir-vacances.png', { type: 'image/png' });
                    const shareText = `À peine rentrés et vous me manquez déjà ! 🌴✨\n\nCrée toi aussi ta propre carte souvenir ici :\n${APP_LINK}`;

                    // Vérification de la compatibilité du partage de fichiers natif (mobile)
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: 'Mes Souvenirs de Vacances',
                                text: shareText,
                                files: [file]
                            });
                        } catch (shareErr) {
                            if (shareErr.name !== 'AbortError') {
                                console.log('Partage annulé ou interrompu.');
                            }
                        }
                    } else {
                        // Secours : Copie le lien dans le presse-papier pour ordinateur
                        await navigator.clipboard.writeText(shareText);
                        alert("Le lien de l'application a été copié dans votre presse-papier ! (Le partage direct de fichiers est réservé aux mobiles)");
                    }
                }, 'image/png');

            } catch (err) {
                console.error("Erreur de partage :", err);
                alert("Impossible de préparer le partage : " + err.message);
            } finally {
                btnShare.innerText = originalText;
                btnShare.disabled = false;
            }
        });
    }
});