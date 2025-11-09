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

<img width="512" height="344" alt="image" src="https://github.com/user-attachments/assets/a11ff5dd-e11d-433c-9b4a-8db239eb1012" />


## Licence

MIT License

## Support

If you like this card, please ⭐ star this repository!

Found a bug or have a feature request? Please open an issue.



## http://buymeacoffee.com/jakubhruby


<img width="150" height="150" alt="qr-code" src="https://github.com/user-attachments/assets/2581bf36-7f7d-4745-b792-d1abaca6e57d" />

