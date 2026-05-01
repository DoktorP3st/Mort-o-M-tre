# 💀 Mort-o-Mètre — Fonctionnement & Commandes

## 🔥 Présentation

Le **Mort-o-Mètre** est un widget interactif qui affiche en temps réel le nombre de morts pendant ton stream, avec des effets visuels évolutifs inspirés d’un univers dark fantasy.

👉 Plus tu meurs, plus le widget devient intense.

---

## 🖼️ Aperçu

<p align="center">
  <img src="https://i.ibb.co/DPpC741s/Capture-d-cran-2026-05-01-210540.png" width="700" alt="Mort-o-Mètre Preview 1">
</p>

<p align="center">
  <img src="https://i.ibb.co/tTdKY5n8/Capture-d-cran-2026-05-01-210553.png" width="700" alt="Mort-o-Mètre Preview 2">
</p>

<p align="center">
  <img src="https://i.ibb.co/Ps4DGF6L/Capture-d-cran-2026-05-01-210604.png" width="700" alt="Mort-o-Mètre Preview 3">
</p>

---

## ⚙️ Fonctionnement

### 🧠 Logique principale
- Le compteur est stocké dynamiquement
- Chaque modification déclenche :
  - animation du crâne
  - effets visuels
  - mise à jour du compteur

---

### 📊 Système de progression (tiers)

- **0 – 4 morts** → état normal  
- **5+ morts** → fissures apparaissent  
- **10+ morts** → effets renforcés + sang  
- **20+ morts** → mode chaos (max effets)

👉 Le widget évolue visuellement en fonction du nombre de morts.

---

### 🎨 Thèmes visuels

- ⚔ **Diablo** → or + feu + sang  
- 🔥 **Infernal** → rouge + lave  
- 🌑 **Shadow** → violet + nécromancie  

---

## 💬 Commandes Chat

### 🔓 Commande publique


!deaths


👉 Affiche le compteur à l’écran

---

### 🔒 Commandes mod / streamer

#### ➕ Ajouter des morts

!mort
!mort +1
!mort +5


#### ➖ Retirer des morts

!mort -1
!mort -3


#### 🔢 Définir une valeur précise

!mort 10
!mort 25


#### ♻️ Reset

!mort reset


---

## 👑 Permissions

- ❌ Viewers → lecture uniquement  
- ✅ Mods / Streamer → contrôle total  

---

## 🔄 Persistance

- Le compteur est sauvegardé automatiquement  
- Aucun reset au redémarrage  

---

## 🎛️ Paramètres configurables

- `deathCount` → valeur de départ  
- `visualTheme` → style visuel  
- `showDuration` → durée affichage  
- `cycleInterval` → réapparition automatique  

---

## ✨ Effets dynamiques

Chaque mort déclenche :

- 💥 animation du crâne  
- ⚡ éclairs  
- 🔥 particules  
- 🩸 sang (haut niveau)  
- 🌪️ distorsion visuelle  

---

## 📌 Principe

Ce widget n’est pas juste un compteur.

👉 C’est un système évolutif :
- plus tu meurs  
- plus le visuel devient violent  

---

## 💡 Résumé rapide

- `!deaths` → afficher  
- `!mort +X` → ajouter  
- `!mort -X` → retirer  
- `!mort X` → définir  
- `!mort reset` → reset  

---
