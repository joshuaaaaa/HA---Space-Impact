# Space Impact Card pro Home Assistant

**[English version](README.md)** 🇬🇧

Retro Nokia Space Impact hra jako Lovelace karta pro Home Assistant.

![Space Impact Card](screenshot.png)

## Funkce

✨ **Autentický retro zážitek** - Černobílá Nokia pixelová grafika
🎮 **Jednoduché ovládání** - Šipky a mezerník
📊 **Sledování skóre** - Počítadlo bodů v rohu
🚀 **Postupná obtížnost** - Hra se postupně zrychluje
☄️ **Různé překážky** - Nepřátelé, meteority a bariéry
💥 **Efekty výbuchů** - Pixelové animace částic

## Instalace

### HACS (Doporučeno)

1. Otevřete HACS
2. Klikněte na tři tečky v pravém horním rohu
3. Vyberte "Custom repositories"
4. Přidejte URL repozitáře: `https://github.com/joshuaaaaa/HA---Space-Impact`
5. Kategorie: `Lovelace`
6. Klikněte "Add"

### Manuální instalace

1. Stáhněte `space-impact-card.js` z nejnovějšího vydání
2. Zkopírujte soubor do `config/www/` adresáře
3. Přidejte následující do `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/space-impact-card.js
      type: module
```
4. Restartujte Home Assistant

## Použití

Přidejte kartu do vašeho dashboardu:

```yaml
type: custom:space-impact-card
```

## Ovládání

- **↑↓ Šipky**: Pohyb lodi nahoru/dolů
- **Mezerník**: Střelba
- **Enter**: Start hry / Restart po Game Over

## Hratelnost

- **Malí nepřátelé**: 10 bodů
- **Velcí nepřátelé**: 20 bodů (vyžadují 3 zásahy)
- **Meteority**: 15 bodů
- **Překážky**: Objevují se nahoře a dole - vyvarujte se jim!

Navigujte svou loď vesmírem, ničte nepřátele a meteority a vyhýbejte se překážkám. Hra se postupně stává těžší, jak získáváte více bodů!

## Vývoj

Tato karta je vytvořena v čistém JavaScriptu jako Web Component, kompatibilní s Lovelace dashboardem Home Assistant.

## Licence

MIT License - viz soubor [LICENSE](LICENSE)

## Přispívání

Hlášení chyb a pull requesty jsou vítány!

---

Vytvořeno s ❤️ pro Home Assistant
