// URL officielle de ton application sur GitHub Pages
const APP_LINK = "https://agbalaolivier.github.io/souvenirs_vacances/";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Récupération de tous les éléments du DOM
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

    // Éléments de la Modale Plein Écran (Lightbox)
    const imageModal = document.getElementById('imageModal');
    const imgFull = document.getElementById('imgFull');
    const closeModal = document.querySelector('.close-modal');

    // 2. Gestion de la fermeture de la modale d'image
    if (closeModal && imageModal) {
        closeModal.addEventListener('click', () => imageModal.style.display = 'none');
        imageModal.addEventListener('click', (e) => {
            if (e.target !== imgFull) imageModal.style.display = 'none';
        });
    }

    // 3. Mise à jour dynamique du texte
    if (inTitle) inTitle.addEventListener('input', e => outTitle.innerText = e.target.value);
    if (inSubtitle) inSubtitle.addEventListener('input', e => outSubtitle.innerText = e.target.value);
    if (inMessage) inMessage.addEventListener('input', e => outMessage.innerText = e.target.value);

    // 4. Chargement des photos + Zoom au clic
    if (inMedia) {
        inMedia.addEventListener('change', e => {
            const files = e.target.files;
            mediaGallery.innerHTML = '';

            if (files.length === 0) {
                mediaGallery.innerHTML = '<div class="placeholder-box">Vos photos apparaîtront ici...</div>';
                return;
            }

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = ev => {
                    if (file.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = ev.target.result;
                        img.className = 'media-item';

                        // CLIC SUR LA PHOTO = OUVERTURE EN PLEIN ÉCRAN
                        img.addEventListener('click', () => {
                            if (imgFull && imageModal) {
                                imgFull.src = ev.target.result;
                                imageModal.style.display = 'flex';
                            }
                        });

                        mediaGallery.appendChild(img);
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // 5. Télécharger la carte en image PNG
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

    // 6. Partager : L'IMAGE + LE LIEN CLIQUABLE VERS L'APP
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const canvas = await html2canvas(flyerCard, { scale: 2 });
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'souvenir-vacances.png', { type: 'image/png' });

                const shareText = `À peine rentrés et vous me manquez déjà ! 🌴✨\n\nCrée toi aussi ta propre carte souvenir avec l'application ici :\n${APP_LINK}`;

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
                    alert('Lien de l\'application copié dans le presse-papier !');
                }
            });
        });
    }
});