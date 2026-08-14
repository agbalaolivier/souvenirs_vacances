// Au tout début du fichier app.js
const APP_LINK = "https://agbalaolivier.github.io/souvenirs_vacances/";
document.addEventListener('DOMContentLoaded', () => {
    // URL de votre application (à remplacer par votre vrai lien web ou PlayStore/AppStore)
    const APP_LINK = "https://mon-app-vacances.com"; 

    // Champs du formulaire
    const inTitle = document.getElementById('inTitle');
    const inSubtitle = document.getElementById('inSubtitle');
    const inMessage = document.getElementById('inMessage');
    const inMedia = document.getElementById('inMedia');

    // Éléments de la carte
    const outTitle = document.getElementById('outTitle');
    const outSubtitle = document.getElementById('outSubtitle');
    const outMessage = document.getElementById('outMessage');
    const mediaGallery = document.getElementById('mediaGallery');

    // Boutons
    const btnDownload = document.getElementById('btnDownload');
    const btnShare = document.getElementById('btnShare');
    const flyerCard = document.getElementById('flyerCard');

    // 1. Mise à jour instantanée du texte
    inTitle.addEventListener('input', e => outTitle.innerText = e.target.value);
    inSubtitle.addEventListener('input', e => outSubtitle.innerText = e.target.value);
    inMessage.addEventListener('input', e => outMessage.innerText = e.target.value);

    // 2. Chargement des photos
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
                    mediaGallery.appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        });
    });

    // 3. Télécharger la carte sous forme d'image
    btnDownload.addEventListener('click', () => {
        html2canvas(flyerCard, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'carte-souvenir-vacances.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    // 4. Partager : L'IMAGE + LE LIEN CLIQUABLE VERS L'APP
    btnShare.addEventListener('click', async () => {
        const canvas = await html2canvas(flyerCard, { scale: 2 });
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'souvenir-vacances.png', { type: 'image/png' });

            // Texte dynamique avec le lien cliquable vers l'application
            const shareText = `Regarde la carte de nos vacances ! 🌴✨\n\nCrée toi aussi ta propre carte souvenir avec l'application ici : ${APP_LINK}`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Mes Souvenirs de Vacances',
                        text: shareText, // Contient le lien cliquable !
                        files: [file]    // Contient l'image !
                    });
                } catch (err) {
                    console.log('Partage annulé');
                }
            } else {
                alert('Le partage direct n\'est pas supporté par ce navigateur. Utilisez le bouton "Enregistrer l\'image" !');
            }
        });
    });
});