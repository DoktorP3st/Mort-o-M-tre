# 💀 Mort-o-Mètre — Overlay StreamElements Interactif

> Widget custom pour **StreamElements** — affiche le nombre de morts en live avec 4 formes visuelles évolutives, des effets dynamiques et une persistance automatique entre les streams.

---

## 🖼️ Les 4 Formes

| 0 mort | 1 mort | 2 morts | 3+ morts |
|:------:|:------:|:-------:|:--------:|
| ![0 mort](https://i.imgur.com/LL7cBQg.png) | ![1 mort](https://i.imgur.com/wd3MjWF.png) | ![2 morts](https://i.imgur.com/ap01drf.png) | ![3+ morts](https://i.imgur.com/VNc6CiL.png) |
| 👼 Ange paisible | 💀 Crâne calme | 💀 Crâne agité | 👹 Démon infernal |

---

## ⚙️ Panneau de réglages

![Réglages](https://i.imgur.com/ihmz7zg.png)

---

## 🎮 Commandes Chat

### 🔓 Commandes publiques

| Commande | Effet |
|----------|-------|
| `!deaths` | Force l'affichage du widget à l'écran |

### 🔒 Commandes Mod / Broadcaster uniquement

| Commande | Effet |
|----------|-------|
| `!mort 6` | Fixe directement à 6 |
| `!mort +1` | Ajoute 1 mort |
| `!mort -1` | Retire 1 mort |
| `!mort reset` | Remet à zéro |

---

## 🧠 Logique des 4 Formes

```
0 mort   → 👼 Tête d'ange  — auréole, ailes, visage paisible
1 mort   → 💀 Crâne calme  — yeux orange doux, 1 fissure
2 morts  → 💀 Crâne agité  — crocs, yeux jaune vif, sang des yeux, fissures multiples
3+ morts → 👹 Démon        — cornes, crocs majeurs, yeux explosifs, sang partout
```

Chaque forme a ses propres effets passifs : vortex de particules, éclairs, pluie de sang.

---

## ✨ Effets Dynamiques

### Sur chaque mort (`!mort +N`)
- 💥 Animation d'impact sur la forme active
- ⚡ Éclairs depuis les coins (tier 2+)
- 🔥 Burst de particules (de 12 à 45 selon le tier)
- 🌊 Flash lumineux global
- 🔢 Distorsion + bounce du compteur

### En continu
- 🌪️ Vortex de particules orbitant autour de la forme
- 🩸 Pluie de sang (intensité réglable dans le panel)
- 💫 Aura diffuse pulsante
- ⚡ Éclairs aléatoires (tier 2+)

### Apparition automatique
- Le widget **apparaît toutes les 30 secondes** (réglable)
- Reste visible **8 secondes** (réglable)
- **Disparaît** avec une animation de dissolution
- **Réapparaît** avec une animation d'explosion sur tier 3

---

## 🎛️ Paramètres Configurables (panel SE)

| Paramètre | Description |
|-----------|-------------|
| `deathCount` | Modifier le compteur directement depuis SE |
| `bloodRainEnabled` | Activer / désactiver la pluie de sang |
| `bloodRainIntensity` | Intensité pluie de sang (1=légère → 10=torrentiel) |
| `showDuration` | Durée d'affichage en secondes (3–30s) |
| `cycleInterval` | Fréquence de réapparition auto (10–120s) |

---

## 👑 Permissions

| Rôle | Droits |
|------|--------|
| 👁️ Viewer | `!deaths` uniquement |
| 🔨 Modérateur | Toutes les commandes `!mort` |
| 👑 Broadcaster | Toutes les commandes |

---

## 💾 Persistance

- Le compteur est **sauvegardé automatiquement** via SE Store
- **Aucun reset** au redémarrage du stream
- Le total est conservé entre les sessions

---

## 📦 Installation

1. Sur **StreamElements**, créer un nouveau **Custom Widget**
2. Coller le contenu de chaque fichier dans l'onglet correspondant :
   - `Mort-o-Mètre.html` → onglet **HTML**
   - `Mort-o-Mètre.css` → onglet **CSS**
   - `Mort-o-Mètre.js` → onglet **JS**
   - `Mort-o-Mètre.json` → onglet **FIELDS**
3. Sauvegarder et ajouter la source dans **OBS**
4. Redimensionner dans OBS selon ta mise en page

