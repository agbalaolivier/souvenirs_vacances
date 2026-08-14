// URL officielle de votre application sur GitHub Pages
const APP_LINK = "https://agbalaolivier.github.io/souvenirs_vacances/";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Récupération des éléments du DOM
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

    // Modale (Lightbox HD)
    const imageModal = document.getElementById('imageModal');
    const imgFull = document.getElementById('imgFull');
    const closeModal = document.querySelector('.close-modal');
    const btnDownloadSingleImg = document.getElementById('btnDownloadSingleImg');

    // Tableau stockant les images courantes (en Base64)
    let currentImages = [];

    // --- FONCTION MAGIQUE : COMPRESSION DES IMAGES POUR L'URL ---
    function compressImage(base64Str, maxWidth = 500, quality = 0.5) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    }

    // Fonction pour ouvrir la photo en HD
    function openLightbox(imageSrc) {
        if (imgFull && imageModal) {
            imgFull.src = imageSrc;
            imageModal.style.display = 'flex';

            if (btnDownloadSingleImg) {
                btnDownloadSingleImg.href = imageSrc;
                btnDownloadSingleImg.download = `photo-souvenir-${Date.now()}.jpg`;
            }
        }
    }

    // Réaffichage de la galerie
    function renderGallery() {
        mediaGallery.innerHTML = '';

        if (currentImages.length === 0) {
            mediaGallery.innerHTML = '<div class="placeholder-box">Vos photos apparaîtront ici...</div>';
            return;
        }

        currentImages.forEach((src) => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'media-item';

            // Clic sur l'image = Ouverture HD
            img.addEventListener('click', () => openLightbox(src));

            mediaGallery.appendChild(img);
        });
    }

    // --- LECTURE DES PARAMÈTRES DE L'URL (Pour la personne qui reçoit le lien) ---
    function loadDataFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('card');

        if (dataParam) {
            try {
                const jsonString = decodeURIComponent(atob(dataParam));
                const decodedData = JSON.parse(jsonString);

                if (decodedData.title && outTitle) outTitle.innerText = decodedData.title;
                if (decodedData.subtitle && outSubtitle) outSubtitle.innerText = decodedData.subtitle;
                if (decodedData.message && outMessage) outMessage.innerText = decodedData.message;

                if (decodedData.images && Array.isArray(decodedData.images)) {
                    currentImages = decodedData.images;
                    renderGallery();
                }
            } catch (err) {
                console.error("Erreur lors de la lecture des données de l'URL", err);
            }
        }
    }

    // --- ÉVÉNEMENTS SUR LA LIGHTBOX ---

    if (closeModal && imageModal) {
        closeModal.addEventListener('click', () => imageModal.style.display = 'none');
    }

    if (imgFull && imageModal) {
        imgFull.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
    }

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }

    // --- MISE À JOUR DU TEXTE EN TEMPS RÉEL ---
    if (inTitle) inTitle.addEventListener('input', e => outTitle.innerText = e.target.value || 'Titre');
    if (inSubtitle) inSubtitle.addEventListener('input', e => outSubtitle.innerText = e.target.value || 'Sous-titre');
    if (inMessage) inMessage.addEventListener('input', e => outMessage.innerText = e.target.value || 'Votre message...');

    // --- CHARGEMENT DES PHOTOS DEPUIS LE FORMULAIRE (AVEC COMPRESSION) ---
    if (inMedia) {
        inMedia.addEventListener('change', e => {
            const files = Array.from(e.target.files);
            currentImages = [];

            if (files.length === 0) {
                renderGallery();
                return;
            }

            let loadedCount = 0;
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                        // Compression à la volée
                        const compressed = await compressImage(ev.target.result, 600, 0.6);
                        currentImages.push(compressed);
                        loadedCount++;

                        if (loadedCount === files.length) {
                            renderGallery();
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // --- TÉLÉCHARGER LE FLYER RESUMÉ (PNG) ---
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            html2canvas(flyerCard, { scale: 2 }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'carte-souvenir-vacances.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }

    // --- PARTAGER : IMAGE + LIEN DYNAMIQUE ---
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const cardData = {
                title: outTitle ? outTitle.innerText : '',
                subtitle: outSubtitle ? outSubtitle.innerText : '',
                message: outMessage ? outMessage.innerText : '',
                images: currentImages
            };

            let shareableUrl = APP_LINK;
            try {
                const jsonString = JSON.stringify(cardData);
                const encodedData = btoa(encodeURIComponent(jsonString));
                shareableUrl = `${APP_LINK}?card=${encodedData}`;
            } catch (e) {
                console.warn("Erreur d'encodage :", e);
            }

            const canvas = await html2canvas(flyerCard, { scale: 2 });
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'souvenir-vacances.png', { type: 'image/png' });
                const shareText = `À peine rentrés et vous me manquez déjà ! 🌴✨\n\nRetrouve notre carte et les photos HD ici :\n${shareableUrl}`;

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: 'Mes Souvenirs de Vacances',
                            text: shareText,
                            files: [file]
                        });
                    } catch (err) {
                        console.log('Partage annulé');
                    }
                } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Lien de la carte copié dans le presse-papier !');
                }
            });
        });
    }

    // Chargement automatique si l'URL contient des données
    loadDataFromURL();
});