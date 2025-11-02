# Vyhoda Heritage Virtual Tour

An interactive **3D virtual tour** for the **Vyhoda Heritage Museum**, built with HTML, JavaScript, and XML on top of the **krpano** panorama engine. It presents spherical panoramas, 3D models, and multimedia overlays with a responsive UI for desktop, tablet, and mobile.

**Live Tour:** https://vyhodaheritage.com.ua/virtual-tour/

---

## Overview

This repository contains the production sources for the museum’s virtual tour:
- krpano-powered **spherical panoramas**
- **3D models** and textures
- **Hotspots**, information panels, and **multimedia** (video/audio)
- **Responsive** interface and layout
- Optimizations for **fast online publishing**

---

## Tech Stack

- **HTML5**, **CSS3**, **JavaScript (ES6)**
- **krpano** (XML configuration & viewer)
- Assets: 360° panoramas, video, audio, images, 3D models

---

## Repository Structure

```
vyhoda-tour/
│
├── 3d/                        # 3D models and scene assets
├── boykivske-mynuledata/      # Scene, hotspots, and krpano XML configs
├── boykivske-mynule.html      # Main entry point for the tour
├── .gitattributes             # Git settings
└── README.md                  # Project documentation
```

> **Entry file:** `boykivske-mynule.html`

---

## Getting Started

### Requirements
- Any **static web server** (to avoid CORS issues with XML/assets)
- Modern desktop or mobile browser

### Run locally
Using **Node** (recommended):
```bash
npx serve .
```
Using **Python**:
```bash
# Python 3
python -m http.server 8080
```
Then open:
```
http://localhost:3000
# or the port printed by your server (e.g., 8080)
```

### Deploy
Upload the repository contents to any standard web host (Nginx/Apache/static hosting).  
Keep all **relative paths** intact and include the **krpano license files** and required assets from `boykivske-mynuledata/` and `3d/`.

---

## Editing Content

- **Scenes & Hotspots:** Update the relevant XML files in `boykivske-mynuledata/` (scenes, hotspots, UI states).
- **3D Models:** Place models and textures in `3d/` and reference them from the XML/JS where used.
- **Media:** Add audio/video/images alongside existing assets and reference them from scenes/hotspots.
- **UI:** Modify HTML/CSS in `boykivske-mynule.html` or linked stylesheets to adjust layout/branding.

> Follow the existing naming conventions to keep links stable.

---

## Technical Requirements (UA)

1. Тур реалізовано засобами **HTML**, **JS**, **XML** з використанням сферичних панорам (плеєр **krpano**).
2. **Адаптивність** для ПК, планшетів і смартфонів.
3. Розроблено **адаптивний дизайн інтерфейсу** з необхідними графічними елементами.
4. **Готовий пакет для публікації** оптимізовано для онлайн-використання та включає: сферичні панорами, 3D‑моделі, графічні елементи, відео/аудіо, ліцензійні файли krpano та необхідні програмні файли.

---

## License & Rights

- Media (panoramas, models, audio, video) © **Vyhoda Heritage Museum**.  
- **krpano** viewer used under a **commercial license**.  
- Source code is provided for this project and **not intended for redistribution** without permission.

---

## Credits

**Development:** https://github.com/mmmihaeel  
**Client:** Vyhoda Heritage Museum
