const cors = require('cors');
const express = require('express');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const multer = require('multer');

const app = express();
const port = Number(process.env.PORT || 10000);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN,
  'https://agbalaolivier.github.io',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8082',
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origine non autorisée'));
  },
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/convert', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]), async (req, res) => {
  const image = req.files?.image?.[0];
  const audio = req.files?.audio?.[0];

  if (!image || !audio) {
    return res.status(400).json({ error: 'Les fichiers image et audio sont obligatoires.' });
  }

  const workdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'souvenirs-'));
  const imagePath = path.join(workdir, 'card.jpg');
  const audioPath = path.join(workdir, 'audio-input');
  const outputPath = path.join(workdir, 'card.mp4');

  try {
    await Promise.all([
      fs.promises.writeFile(imagePath, image.buffer),
      fs.promises.writeFile(audioPath, audio.buffer),
    ]);

    const args = [
      '-y',
      '-loop', '1',
      '-i', imagePath,
      '-i', audioPath,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest',
      '-movflags', '+faststart',
      outputPath,
    ];

    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, args, { timeout: 120000 }, (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve();
      });
    });

    res.type('video/mp4');
    res.download(outputPath, 'carte-souvenir.mp4', async () => {
      await fs.promises.rm(workdir, { recursive: true, force: true });
    });
  } catch (error) {
    await fs.promises.rm(workdir, { recursive: true, force: true });
    res.status(500).json({ error: 'La conversion MP4 a échoué.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Souvenirs video server listening on port ${port}`);
});