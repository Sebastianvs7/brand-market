# Brand Market

Expo / React Native aplikace pro technický assessment: seznam produktů z [Fake Store API](https://fakestoreapi.com/products) s pull-to-refresh, lazy loadingem, jednoduchým white-label přepínáním dvou brandů a samostatným refaktorem legacy komponenty `UserProfile` (`legacy.tsx` → `refactored.tsx`).

## Instalace a spuštění

Vyžaduje Node `>=22.13` (vyvíjeno a ověřeno na Node 24) a Expo CLI přes `npx`.

```bash
npm ci
npx expo start
```

V terminálu Expo pak `i` spustí iOS simulátor, `a` Android emulátor. Pro čistý reprodukovatelný build lze místo `npm install` použít `npm ci` (lockfile je součástí repozitáře).

Kontrolní příkazy před odevzdáním/PR:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run format:check
npm test            # jest --runInBand
npm run check       # spustí všechny čtyři výše
```

## Architektura

Projekt je členěný podle funkčních modulů, ne podle druhu souboru:

```text
App.tsx                 # skládá providery + hlavní obrazovku
legacy.tsx               # originál ze zadání (bod 3) – ponechán pro srovnání s refactored.tsx
refactored.tsx           # samostatný refaktor UserProfile (bod 3 zadání)
src/
  app/providers/         # AppProviders – kompozice Query/Theme/Brand providerů
  screens/ProductsScreen/ # layout obrazovky, lokální hook, header a footer komponenty
  features/
    products/             # kontrakt, API adaptér, query cache, stránkování, ProductCard
    user-profile/          # kontrakt, fetching/lifecycle a view pro refactored.tsx
  branding/               # registry brandů, Context/Provider, přepínač
  shared/
    api/                  # requestJson (fetch + timeout + AbortSignal), apiError
    query/                # createQueryClient
    theme/                # Theme kontrakt a tokeny, odvozené od aktivního brandu
    ui/                    # doménově nezávislé UI (AsyncFeedback)
    format/                # formatPrice (Intl.NumberFormat)
  testing/                # sdílený test setup
```

**Proč takto:** `features/products` nezná branding ani obrazovku – dostává jen `baseUrl`, `pageSize`, `sort`, `scope` jako parametry, takže je testovatelný a znovupoužitelný nezávisle na UI. `screens/ProductsScreen` je jediné místo, které skládá brand + produkty dohromady. Moduly komunikují jen přes `index.ts` barrel (veřejné rozhraní); uvnitř modulu se importuje relativně. Hranice vynucuje `eslint-plugin-boundaries` v [eslint.config.js](eslint.config.js), takže zakázaný import (např. `features` → `screens`) spadne na lintu, ne až při code review.

**Stack:** TanStack Query v5 (`useInfiniteQuery`) pro produktový serverový stav, Zod pro runtime validaci odpovědí API, `FlatList` + `expo-image`. TypeScript v `strict` režimu s `noUncheckedIndexedAccess` a `exactOptionalPropertyTypes`.

`legacy.tsx` je záměrně vyjmutý z `tsconfig.json` (`exclude`) a `eslint.config.js` (`ignores`) – je to nezměněný, netypovaný originál ze zadání ponechaný jen pro srovnání, ne kód, který by měl splňovat projektové standardy.

### Stránkování a limity Fake Store API

Fake Store API nemá skutečnou paginaci (cursor/offset) – podporuje jen `limit` a `sort`, viz [oficiální repozitář](https://github.com/keikaavousi/fake-store-api). Adaptér [`getProductsPage.ts`](src/features/products/api/getProductsPage.ts) proto při každém dotazu žádá `limit = offset + pageSize + 1`: jedna položka navíc prozradí, jestli katalog pokračuje, aniž by se muselo předpokládat jeho celkové množství. Katalog Fake Store API má **napevno pouze 20 produktů** – jakmile se všech 20 načte, patička seznamu ukáže „You have seen the whole collection“ a další request se nevolá. To není chyba aplikace, ale limit zdrojových dat; ověřeno živým dotazem na endpoint.

Cena tohoto přístupu: pro `n` stránek o velikosti `k` se přenese řádově `k × n²` záznamů (opakovaně stahuje prefix), i když zobrazeno je jen `k × n`. Pro produkční nasazení s reálně rostoucím katalogem je potřeba backend s cursorem.

### Brand A / Brand B

Konfigurace obou brandů je v [`src/branding/config`](src/branding/config): každý má vlastní primární barvu (přes `Theme`) a vlastní API parametry. `useBrand`/`BrandProvider` drží aktivní brand v Contextu; `BrandSwitcher` v UI mezi nimi přepíná. UI nikde nevětví podle `brand === 'a'`, pouze čte sémantické tokeny (`primary`, `background`, `text`, ...).

Přepnutí brandu je proto vidět na vzhledu **i na datech** – konfigurace se promítne do query klíče i do samotného requestu:

|                | Brand A         | Brand B           |
| -------------- | --------------- | ----------------- |
| Primární barva | modrá `#2454C6` | fialová `#713AB0` |
| `pageSize`     | 6 (`limit=7`)   | 8 (`limit=9`)     |
| `sort`         | `asc`           | `desc`            |
| `timeoutMs`    | 10 000          | 12 000            |

Každý brand má vlastní cache (scope je součástí query klíče), takže návrat na předchozí brand nevyžaduje nový request a opožděná odpověď jednoho brandu se nikdy nezobrazí pod druhým – oboje je pokryté testy.

## Produkční úvahy

### Caching a plný offline režim

1. Perzistovat query cache (TanStack Query) na disk podle brandu, se schématickou verzí a expirací; při startu obnovit poslední platná data a zobrazit jejich stáří uživateli.
2. Pro skutečně offline dostupný katalog je potřeba explicitní synchronizace dat i obrázků (ne jen in-memory cache) s definovanou kvótou a životností – nenavštívené stránky bez předchozí synchronizace offline dostupné nejsou.
3. Pro budoucí zápisové operace (např. košík) doplnit frontu změn s idempotencí, retry po obnovení spojení a pravidla pro řešení konfliktů.

### Škálování na desítky brandů

1. Verzionovaný a validovaný brand manifest (identita, design tokeny, assety, endpointy, feature flags) místo ručně psaných konfiguračních objektů; sdílené komponenty jen konzumují konfiguraci.
2. Pro odlišné backendové kontrakty per-brand explicitní adaptéry; brand/tenant se stává součástí cache klíčů i případného autentizačního kontextu.
3. Generovat Expo build profily a testovací matici z registry brandů, nebalit do jednoho buildu assety všech značek najednou; žádná tajemství v klientské konfiguraci.

### FlatList s tisíci položkami a dynamickými výškami

1. Měřit paměť a odezvu na reprezentativních zařízeních v release buildu a podle toho ladit `windowSize`/`maxToRenderPerBatch`, ne nastavovat hodnoty naslepo.
2. `getItemLayout` s konstantní výškou je pro dynamický obsah nesprávný – pokud je nutné měřit výšky řádků, cache měření musí zohledňovat šířku obrazovky, font scale a změny obsahu.
3. Řešit skutečnou serverovou paginaci na straně backendu (ne jen klientský limit-trik jako u Fake Store API) a zvážit recycler-based seznam až na základě reálného profilování, ne preventivně.

## Známá omezení tohoto řešení

- ESLint je připnutý na `9.39.5`, protože `eslint-plugin-react` uvnitř `eslint-config-expo` zatím deklaruje podporu jen do ESLint `^9.7`; na ESLint 10 celý lint spadne na změněném Rule Context API. Odepnout, až Expo config vydá kompatibilní verzi.
- Testováno na iOS simulátoru a Android emulátoru; ani jedno na fyzickém zařízení.
- Zátěžový test seznamu s 1000+ položkami není součástí repozitáře (viz bod výše o FlatListu) – Fake Store API reálně nabízí jen 20 produktů.
