# USOS średnia
Rozszerzenie do przeglądarki pozwalajacę na proste liczenie średniej w USOS.

## Budowanie
Aby zbudować rozszerzenie należy wykonać:
```
npm install
npm run build
```
Do pakowania rozszerzenia w zipa, służy komenda:
```
npm run release
```

## Rozszerznia
Rozszerzenie można prosto rozszerzyć o własne średnie dodając własną funkcję liczącą średnią do zmiennej `avgHandlers` w `src/content/avgHandlers.ts`
