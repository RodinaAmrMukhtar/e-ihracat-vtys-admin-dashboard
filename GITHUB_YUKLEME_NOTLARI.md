# GitHub Yükleme Notları

Bu paket yalnızca README ve ekran görüntülerini içerir. Proje kodunu içermez.

## Repo içinde önerilen yapı

```text
README.md
docs/
└── screenshots/
    ├── 01-veritabani-er-diyagrami.png
    ├── 02-dashboard-genel-bakis.png
    ├── 03-siparis-yonetimi.png
    ├── 04-musteri-yonetimi.png
    ├── 05-gumruk-yonetimi.png
    ├── 06-iade-yonetimi.png
    └── 07-iade-is-kurali-hata-kontrolu.png
```

## GitHub'a koymaman gereken dosyalar

```gitignore
node_modules/
dist/
.env
*.log
*.ldf
*.mdf
*.bak
*.zip
.DS_Store
.vs/
```

## Önerilen repo adı

```text
e-ihracat-vtys-admin-dashboard
```

## Önerilen repo açıklaması

```text
3NF normalizasyonuna göre tasarlanmış SQL Server e-ihracat veritabanı ve React + Node.js tabanlı admin dashboard projesi.
```
