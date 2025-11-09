# Space Impact Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[Česká verze README](README.cs.md)** 🇨🇿

Retro Nokia Space Impact game as a Lovelace card for Home Assistant.

<img width="512" height="336" alt="image" src="https://github.com/user-attachments/assets/03485aff-cccc-436e-9d69-4204815b60de" />


## Features

✨ **Authentic retro experience** - Black and white Nokia-style pixel graphics
🎮 **Simple controls** - Arrow keys and spacebar
📊 **Score tracking** - Points counter in the corner
🚀 **Progressive difficulty** - Game speeds up over time
☄️ **Multiple obstacles** - Enemies, meteorites, and barriers
💥 **Explosion effects** - Pixel-perfect particle animations

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click "+" in the bottom right corner
4. Search for "Space Impact Card"
5. Click "Install"
6. Restart Home Assistant

### Manual Installation

1. Download `space-impact-card.js` from the latest release
2. Copy the file to your `config/www/` directory
3. Add the following to your `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/space-impact-card.js
      type: module
```
4. Restart Home Assistant

### Custom Repository (if not in HACS default)

1. Open HACS
2. Click on the three dots in the top right corner
3. Select "Custom repositories"
4. Add repository URL: `https://github.com/joshuaaaaa/HA---Space-Impact`
5. Category: `Lovelace`
6. Click "Add"

## Usage

Add the card to your dashboard:

```yaml
type: custom:space-impact-card
```

## Controls

- **↑↓ Arrow keys**: Move ship up/down
- **Spacebar**: Shoot
- **Enter**: Start game / Restart after Game Over

## Gameplay

- **Small enemies**: 10 points
- **Large enemies**: 20 points (require 3 hits)
- **Meteorites**: 15 points
- **Obstacles**: Appear on top and bottom - avoid them!

Navigate your ship through space, destroy enemies and meteorites, and avoid obstacles. The game gets progressively harder as you score more points!

## Development

This card is built with vanilla JavaScript as a Web Component, compatible with Home Assistant's Lovelace dashboard system.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Issues and pull requests are welcome!

## Support

If you like this card, please ⭐ star this repository!

Found a bug or have a feature request? Please open an issue.

## http://buymeacoffee.com/jakubhruby

<img width="150" height="150" alt="qr-code" src="https://github.com/user-attachments/assets/2581bf36-7f7d-4745-b792-d1abaca6e57d" />

---

Made with ❤️ for Home Assistant
