# Byåsenlekene mangekamp

Mangekamp på Dalgård friidrettsbane i Trondheim, nå med semi-3D-grafikk (dybde, lag i perspektiv, skygger, 3D-aktige hekker, matte og podium) og grensesnitt i TV-sendingsstil (skrå bånd, klubbfarger, resultattavle). Ren HTML5 Canvas/JavaScript uten avhengigheter. All grafikk og lyd lages i kode, så hele spillet er én fil (`index.html`).

Tegningen skjer i 3× oppløsning (1200×675) og skaleres jevnt til skjermen. Spillreglene er uendret fra forrige versjon.

## Legg ut på GitHub Pages
1. Lag et nytt repo på github.com (f.eks. `byasenlekene`) og last opp **alt innholdet i denne mappen** (dra filene inn i nettleseren, eller `git push`).
2. Gå til **Settings → Pages**. Under *Build and deployment* velger du *Deploy from a branch*, branch `main` og mappe `/ (root)`. Trykk Save.
3. Etter ca. ett minutt ligger spillet på `https://<brukernavn>.github.io/<repo>/`. Åpne lenken på mobilen og velg «Legg til på startskjermen» for å få det som app (fullskjerm, virker offline).

Alle stier er relative, så det fungerer også i en undermappe. Filen `.nojekyll` gjør at GitHub ikke prosesserer noe.

## Vanskelighet
Hovedmenyen har valget **Vanskelighet: lett / normal**. Lett er standard og gjør spillet enklere på mobil: løperen får selv opp farten (taksing gir bonus), timingvinduene er bredere (hekker, høydehopp, vinkel), lengdehopp hopper automatisk ved planken, kulestøt støter selv ved ringkanten og 800 m går i jogg uten trykk. Valget huskes på enheten.

## Kontroller
**Mobil (anbefalt liggende):** kontrollkors (som på en spillkontroller) til venstre i menyene, og stort gult LØP-felt til venstre i øvelsene (trykk raskt og jevnt, feltet bytter selv mellom venstre og høyre). Knappene A og B til høyre skifter navn etter øvelsen. Minnestyring (lyd, fullskjerm, pause) ligger i sidekanten. Menyvalg kan trykkes direkte.

**Tastatur:** ← → eller A/D løper, Z/Mellomrom/Enter = A, X/Shift = B, P/Esc = pause, M = lyd.

## Øvelser
- **60 m hekk**: «Innta plassene – Klar – skudd». Løp med raske trykk, A rett før hekken.
- **Lengde**: løp opp fart, hold A for satsvinkel, slipp før planken. Tre forsøk.
- **Kule**: A for glid og kraft, B ved ringkanten for støt.
- **Høyde** (enklere): velg høyde, A starter tilløpet, trykk A én gang når løperen er i det grønne feltet foran lista. Svaien gjøres automatisk. B = pass. Tre riv = ute.
- **800 m**: «Innta plassene» og skudd. Bjella ringer når første løper går inn i siste runde. A = spurt siste 150 m.

Mangekamp = 5 øvelser mot 4 CPU-klubber (tilfeldig utvalg av de 5 andre klubbene) med Tyrvingpoeng. Treningsmodus = fritt valg. Premieutdeling med fotograf og tilfeldig, morsom premie (alt fra ei bøtte sild til gavekort på reise til Stjørdal) etter 800 m.

## Klasse og Tyrvingpoeng
Etter menyvalget velger du **kjønn (jente/gutt)** og **alder (11–15 år)**. Figurene vises som jente (hestehale) eller gutt, og resultatene (hekketid, lengde, kule, høyde, 800 m) skaleres til nivået i klassen. Poengene regnes som **Tyrvingpoeng**, ca. 1000 poeng = referanseresultat i klassen. Tabellene (`CLASS_REF` og `Cls.pts` i `src/20-data.js`) er *tilnærmet* – NFFs eksakte Tyrvingtabell er ikke brukt, så tallene kan justeres. Valget huskes på enheten.

**Klubber:** Byåsen IL, Ranheim IL, Strindheim IL, Nidelv IL, Trondheim Friidrett og Utleira IL.

## Bygge på nytt
Kildekoden ligger i `src/`. Kjør `./build.sh` (krever `node` for syntakssjekk) for å lime sammen `index.html`.
- `src/15-audio.js` – lydmotor (Web Audio: klokke, startpistol, publikum, musikk, tale)
- `src/25-backdrop.js` – Dalgård-miljøet som vektorgrafikk i lag (parallakse: Byåsen-åsen, Tyholttårnet, rød hall, lysmaster, flagg, publikum, gress, banedekke)
- `src/10-core.js` – tegnehjelpere og sendingsfont (`T`, `txt`, `slant`, `rrect`); `S` = oppløsningsfaktor
- `src/20-data.js` – klubber/farger (`CLUBS`) og utøvertegning
- `HJ`, `LJ`, `SP`, `R8`, `HK` – konstanter per øvelse; `Game.skill` – CPU-styrke

Klubbfarger: Byåsen (marineblå/rød) er etter bilder, de andre (også Utleira, oransje/svart) er omtrentlige. Endres i `CLUBS`.

## Merknader
- Lyd og tale starter først etter første trykk (nettleserkrav). Tale bruker enhetens norske stemme hvis den finnes.
- Service worker bruker «nettverk først», så oppdateringer vises med en gang du laster siden på nytt.
