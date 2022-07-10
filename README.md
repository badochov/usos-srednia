# USOS średnia
Rozszerzenie do przeglądarki pozwalajacę na proste liczenie średniej w USOS.

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
