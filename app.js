// URL officielle de ton application sur GitHub Pages
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

    // Modale Plein Écran
    const imageModal = document.getElementById('imageModal');
    const imgFull = document.getElementById('imgFull');
    const closeModal = document.querySelector('.close-modal');

    // 2. Gestion de la fermeture de la modale
    if (closeModal && imageModal) {
        closeModal.addEventListener('click', () => imageModal.style.display = 'none');
        imageModal.addEventListener('click', (e) => {
            if (e.target !== imgFull) imageModal.style.display = 'none';
        });
    }

    // 3. Mise à jour dynamique du texte
    if (inTitle && outTitle) inTitle.addEventListener('input', e => outTitle.textContent = e.target.value);
    if (inSubtitle && outSubtitle) inSubtitle.addEventListener('input', e => outSubtitle.textContent = e.target.value);
    if (inMessage && outMessage) inMessage.addEventListener('input', e => outMessage.textContent = e.target.value);

    // 4. Chargement des photos
    if (inMedia) {
        inMedia.addEventListener('change', e => {
            const files = e.target.files;
            if (!mediaGallery) return;

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

    // Fonction utilitaire pour générer le canvas avec html2canvas en toute sécurité
    async function generateCanvas() {
        if (typeof html2canvas === 'undefined') {
            throw new Error("La bibliothèque html2canvas n'est pas chargée ! Vérifiez votre connexion internet ou le lien CDN.");
        }
        return await html2canvas(flyerCard, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
        });
    }

    // 5. Télécharger la carte
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
                console.error("Erreur lors de la capture :", err);
                alert("Impossible de générer l'image : " + err.message);
            } finally {
                btnDownload.innerText = originalText;
                btnDownload.disabled = false;
            }
        });
    }

    // 6. Partager la carte
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const originalText = btnShare.innerText;
            try {
                btnShare.innerText = "⏳ Préparation...";
                btnShare.disabled = true;

                const canvas = await generateCanvas();
                
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        alert("Erreur lors de la création de l'image.");
                        return;
                    }

                    const file = new File([blob], 'souvenir-vacances.png', { type: 'image/png' });
                    const shareText = `À peine rentrés et vous me manquez déjà ! 🌴✨\n\nCrée toi aussi ta propre carte souvenir ici :\n${APP_LINK}`;

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: 'Mes Souvenirs de Vacances',
                                text: shareText,
                                files: [file]
                            });
                        } catch (shareErr) {
                            if (shareErr.name !== 'AbortError') {
                                console.log('Partage annulé ou échoué');
                            }
                        }
                    } else {
                        // Option de secours : copie du texte dans le presse-papier
                        await navigator.clipboard.writeText(shareText);
                        alert('Le lien de l\'application a été copié dans votre presse-papier ! (Le partage de fichier image direct n\'est pas supporté sur ce navigateur)');
                    }
                }, 'image/png');

            } catch (err) {
                console.error("Erreur lors du partage :", err);
                alert("Impossible de préparer le partage : " + err.message);
            } finally {
                btnShare.innerText = originalText;
                btnShare.disabled = false;
            }
        });
    }
});