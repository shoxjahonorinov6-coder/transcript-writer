# 🎙️ Transcript Writer

Audio tinglab transcript yozish uchun web ilova. GitHub Pages da ishlaydi.

## 📁 Fayl tuzilmasi

```
transcript-writer/
├── index.html          # Asosiy sahifa
├── css/
│   └── style.css       # Dizayn
├── js/
│   └── app.js          # Logika
├── audio/
│   ├── AML06.mp3
│   ├── AML07.mp3
│   ├── AML08.mp3
│   ├── AML09.mp3
│   └── AML10.mp3
└── README.md
```

## 🚀 GitHub Pages ga deploy qilish

1. GitHub da yangi repo yarating
2. Barcha fayllarni yuklab yuboring:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
3. Repo → **Settings** → **Pages** → Source: `main` branch → **Save**
4. Bir necha daqiqadan keyin: `https://USERNAME.github.io/REPO/`

> ⚠️ Audio fayllar katta (16MB+). GitHub LFS ishlatish tavsiya etiladi:
> ```bash
> git lfs install
> git lfs track "*.mp3"
> git add .gitattributes
> git add audio/
> git commit -m "Add audio files via LFS"
> ```

## ⌨️ Klaviatura yorliqlari

| Tugma | Vazifa |
|-------|--------|
| `←` | 3 soniya orqaga |
| `→` | 3 soniya oldinga |
| `↑` | Play |
| `↓` | Pause |
| `Ctrl+S` | Saqlash |

## ✨ Imkoniyatlar

- 🎵 Fayl yuklash (MP3, WAV, M4A, OGG)
- 🎙️ 5 ta ichki audio (AML06–AML10)
- 📝 Transcript yozish + avtomatik saqlash
- 💾 Word (.doc) formatida yuklab olish
- 🕐 Tarix — barcha yozilgan transcriptlar
- 🌙 Dark / Light mode
- ⏩ Tezlik sozlash (0.5× – 2×)
