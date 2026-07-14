# ================================================================
# 🚀 SCRIPT DE DÉPLOIEMENT — Présence Coryas
# ================================================================
# 1. Ajoute les fichiers modifiés
# 2. Commit avec un message
# 3. Push sur GitHub → Render redéploie automatiquement
# ================================================================

Write-Host "📦 Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add `
  back/server.js `
  back/controllers/presences.controller.js `
  back/models/presences.model.js `
  front/src/pages/Presences/index.jsx

Write-Host "💾 Commit..." -ForegroundColor Yellow
git commit -m "fix(rattrapage): correction SQL $2::time + validation + server.js recréé"

Write-Host "☁️ Push sur GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "✅ DÉPLOIEMENT ENVOYÉ !" -ForegroundColor Green
Write-Host "⏳ Render va redéployer automatiquement dans 1-2 minutes"
Write-Host "🔍 Vérifie sur https://dashboard.render.com" -ForegroundColor Cyan
