# Space Impact Card for Home Assistant

Retro Nokia Space Impact hra jako Lovelace karta pro Home Assistant.

## Instalace

### HACS (Doporučeno)

1. Otevřete HACS v Home Assistant
2. Přejděte na "Frontend"
3. Klikněte na "+" v pravém dolním rohu
4. Vyhledejte "Space Impact Card"
5. Klikněte na "Install"
6. Restartujte Home Assistant

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

- **Šipky nahoru/dolů**: Pohyb lodi
- **Mezerník**: Střelba
- **Enter**: Restart hry po Game Over

## Funkce

- Retro černobílý Nokia styl vykreslený z teček
- Počítadlo skóre v rohu
- Postupně se zvyšující obtížnost
- Různé typy nepřátel
- Autentický retro vzhled

## Screenshot

![Space Impact](screenshot.png)

## Licence

MIT License
