const APP_LINK = "https://agbalaolivier.github.io/souvenirs_vacances/";

let loadedPhotos = [];
let currentPhotoIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. SÉLECTION DES ÉLÉMENTS DU DOM
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

    // Lightbox
    const imageModal = document.getElementById('imageModal');
    const imgFull = document.getElementById('imgFull');
    const closeModal = document.querySelector('.close-modal');
    const btnDownloadSingle = document.getElementById('btnDownloadSingle');
    const modalCounter = document.getElementById('modalCounter');
    const prevPhoto = document.getElementById('prevPhoto');
    const nextPhoto = document.getElementById('nextPhoto');

    // -------------------------------------------------------------
    // 2. MISE À JOUR SYNCHRONE LORS DE LA SAISIE
    // -------------------------------------------------------------
    if (inTitle && outTitle) {
        inTitle.addEventListener('input', e => outTitle.textContent = e.target.value);
    }
    
    if (inSubtitle && outSubtitle) {
        inSubtitle.addEventListener('input', e => outSubtitle.textContent = e.target.value);
    }

    if (inMessage && outMessage) {
        inMessage.addEventListener('input', e => {
            outMessage.textContent = e.target.value.slice(0, 30);
        });
    }

    // -------------------------------------------------------------
    // 3. GALERIE PHOTO & LIGHTBOX
    // -------------------------------------------------------------
    function updateLightbox(index) {
        if (loadedPhotos.length === 0) return;
        currentPhotoIndex = index;
        
        const photoData = loadedPhotos[currentPhotoIndex];
        if (imgFull) imgFull.src = photoData;
        if (btnDownloadSingle) {
            btnDownloadSingle.href = photoData;
            btnDownloadSingle.download = `photo-vacances-${currentPhotoIndex + 1}.jpg`;
        }
        if (modalCounter) {
            modalCounter.textContent = `${currentPhotoIndex + 1} / ${loadedPhotos.length}`;
        }
        
        if (prevPhoto) prevPhoto.style.display = loadedPhotos.length > 1 ? 'block' : 'none';
        if (nextPhoto) nextPhoto.style.display = loadedPhotos.length > 1 ? 'block' : 'none';
    }

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

    if (closeModal && imageModal) {
        closeModal.addEventListener('click', () => imageModal.style.display = 'none');
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target.classList.contains('lightbox-content-wrapper')) {
                imageModal.style.display = 'none';
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (imageModal && imageModal.style.display === 'flex') {
            if (e.key === 'ArrowRight' && nextPhoto) nextPhoto.click();
            if (e.key === 'ArrowLeft' && prevPhoto) prevPhoto.click();
            if (e.key === 'Escape' && closeModal) closeModal.click();
        }
    });

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

                    img.addEventListener('click', () => {
                        updateLightbox(loadedPhotos.indexOf(src));
                        if (imageModal) imageModal.style.display = 'flex';
                    });

                    mediaGallery.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // -------------------------------------------------------------
    // 4. GÉNÉRATION CANVAS (html2canvas)
    // -------------------------------------------------------------
    async function generateCanvas() {
        if (typeof html2canvas === 'undefined') {
            throw new Error("html2canvas non trouvé.");
        }
        return await html2canvas(flyerCard, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false
        });
    }

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
                alert("Erreur lors de la création de l'image : " + err.message);
            } finally {
                btnDownload.innerText = originalText;
                btnDownload.disabled = false;
            }
        });
    }

    // -------------------------------------------------------------
    // 5. PARTAGER LA CARTE (MESSAGE SIMPLE AVEC LIEN DIRECT)
    // -------------------------------------------------------------
    // -------------------------------------------------------------
// 5. PARTAGER LA CARTE SUR WHATSAPP
// -------------------------------------------------------------
if (btnShare) {
    btnShare.addEventListener('click', async () => {
        const originalText = btnShare.innerText;
        try {
            btnShare.innerText = "⏳ Préparation...";
            btnShare.disabled = true;

            const shareText = `Crée toi aussi ta carte de vacances sur :\nhttps://agbalaolivier.github.io/souvenirs_vacances/`;

            const canvas = await generateCanvas();

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], 'carte-souvenir.png', { type: 'image/png' });

                // Sur Mobile (Android/iOS) : partage la photo ET le texte ensemble
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: 'Ma carte souvenir',
                            text: shareText,
                            files: [file]
                        });
                    } catch (shareErr) {
                        if (shareErr.name !== 'AbortError') console.log('Partage annulé');
                    }
                } else {
                    // Sur PC / Navigateur sans support complet : copie le lien et télécharge l'image
                    await navigator.clipboard.writeText(shareText);
                    
                    const link = document.createElement('a');
                    link.download = 'carte-souvenir-vacances.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    alert("L'image a été téléchargée et le lien d'invitation a été copié dans votre presse-papier ! Vous pouvez coller le texte dans WhatsApp.");
                }
            }, 'image/png');

        } catch (err) {
            alert("Impossible de préparer le partage : " + err.message);
        } finally {
            btnShare.innerText = originalText;
            btnShare.disabled = false;
        }
    });
}
});
