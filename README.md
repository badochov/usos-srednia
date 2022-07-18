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

## Wyliczanie GPA
### Czym jest GPA
- GPA jest średnią liczoną w USA i przydatną przy aplikowaniu tam do pracy lub na studia.
- Jest to średnia ważona z przeliczonych na punkty ocen gdzie wagą jest liczba punktów ECTS.
## Przeliczanie ocen
1. Trzeba przeliczyć oceny polskie na amerykańskie. Robię to zgodnie z [tym](https://www.scholaro.com/db/Countries/Poland/Grading-System) przelicznikiem.
    - niestety nie byłem w stanie dowiedzieć się co się dzieje w przypadku warunku / poprawki, więc:
        - w przypadku warunku liczę ten przedmiot jako dwa osobne
        - w przypadku warunku liczę średnią którą zaokrąglam do najbliższej oceny dodając przy tym ocenę `2.5` którą konwertuje na amerykańskie `D`
2. Każdej ocenie przypisywana jest liczba punktów. Robię to zgodnie z [tym](https://gpacalculator.net/how-to-calculate-gpa/) przelicznikiem.
### Inne uwagi
- GPA jest wyliczane albo w skali do `4.0` albo do `4.3`, to rozszerzenie wyliczaja je w skali do `4.0`.
- W GPA uwzględniane są wszystkie oceny znajdujące się na transkrypcie ocen.
    - Ograniczeniem są tutaj przedmioty znajdujące się na transkrypcie a niepodpięte pod program np. zewnętrzny egzamin z języka angielskiego.
- Obecnie jeżeli przedmiot miał inną liczbę ECTSów przy róznych podejściach do niego, liczba ECTSów za przedmiot jest niederministycznie wybrana z możliwych za podejścia.

