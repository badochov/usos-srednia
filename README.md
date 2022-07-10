# USOS średnia
Rozszerzenie do przeglądarki pozwalajacę na proste liczenie średniej w USOS.

## Instalacje
Rozszerzenie jest gotowe do pobrania dla
- [Chrome](https://chrome.google.com/webstore/detail/lbbbenibppgfmakcjpdchgdkjfeipndb)
- [Firefox](https://addons.mozilla.org/pl/firefox/addon/usos-%C5%9Brednia/)

## Budowanie
Do zbudowania potrzebne są:
- Node.js v18.5.0
- npm 8.13.2

Aby zbudować rozszerzenie należy wykonać:
```
npm install
npm run build
```
Do pakowania rozszerzenia w zipa, służy komenda:
```
npm run release
```

## Rozszerzenia
Rozszerzenie można prosto rozszerzyć o własne średnie dodając własną funkcję liczącą średnią do zmiennej `avgHandlers` w `src/content/avgHandlers.ts`
