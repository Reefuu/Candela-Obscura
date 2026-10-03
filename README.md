# Candela Obscura — The Prophets

A static GitHub Pages app with permanent Circle and character selection, imported character sheets, action dice, gilded results, resistance, live conversation, and Circle resources.

**Setup: [START_HERE.md](START_HERE.md).** Create a new Firebase project, fill in `firebase-config.js`, and upload this folder's contents to the new `Reefuu/Candela-Obscura` repository.

**Already running the app? Use [UPDATE_EXISTING.md](UPDATE_EXISTING.md).** Version 1.1 adds selectable gilded dice, abilities from every class, and Circle and character advancement while preserving existing live data.

## Use it

1. Choose **The Prophets**.
2. Choose Wysel, Keith, Excallibur, Jack, or Camellya.
3. Click an action. Its rating and gilded dice load automatically; click the numbered pool dice to choose which are gilded before rolling.
4. Spend drive or add bonus dice, then roll.
5. Choose and accept a result. Gilded acceptance recovers matching drive once per roll.
6. Burn resistance to reroll action dice. Bonus dice stay in the pool.

Sheets, drives, marks, selected gear, illumination, and Circle resources are editable. Live changes persist separately from the initial workbook data. All members of the trusted table can edit sheets. The Lightkeeper seat provides a Circle overview and freeform roller.

Characters begin at level 2. Choose abilities from any role or specialty, including custom entries. At 24 illumination, the Circle gains a level and clears the track. Choose a new Circle ability, then each player applies two different character advancement options. Pending upgrades persist individually until completed.

With empty Firebase placeholders, the app offers a clearly labelled local preview. Preview edits persist in that browser and can sync between tabs of the same origin. Online cross-device play requires Firebase configuration. An online connection failure shows an error instead of opening a local table.

Version 1.1.1 supports the earlier player-presence rules and keeps online-player indicator problems separate from Circle access and save failures. See `UPDATE_EXISTING.md` to update your running GitHub Pages app.

## Files

| File | Purpose |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Interface and interaction |
| `core.js`, `state.js` | Dice rules, resource accounting, and atomic state operations |
| `store.js` | Local preview or Firebase Realtime Database |
| `campaign-data.js` | Initial imported Circle and five character sheets |
| `ability-catalog.js`, `progression.js` | All-class ability choices, level migration, and persistent advancements |
| `firebase-config.js` | Configuration for the new Firebase project |
| `firebase-rules.json` | Rules for the new database |
| `assets/` | Existing portraits and seal from the workbook |
| `tests/` | Dice, resource, migration, and advancement regression tests |

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/. No npm build or server backend is needed for hosting.

To run the game/state tests with Node.js 22 or newer:

```bash
npm test
```

Validation completed: 25 game/state tests, plus desktop and 390px phone browser checks for chosen gilded dice, resistance and repeat rolls, unrestricted abilities, Circle advancement, every character upgrade type, pending choices, stale-editor protection, and reload persistence. Firebase emulator checks covered existing-data migration and simultaneous illumination and character advancement transactions, alongside authentication, presence cleanup, and ordinary table updates. Live Firebase play still needs your project's config and the two-browser check in START_HERE.md.

The app uses native browser modules, the Firebase Web SDK, and browser `crypto.getRandomValues()` for dice. Rolls are generated on each player's device and are suitable for a friendly tabletop group. Authentication and database rules protect database access; they do not provide server-authoritative dice or private membership gates. Hosting this repository publicly makes its initial character sheets and artwork publicly accessible.

Log history is bounded to the latest 100 entries. Use **Export backup** to keep a snapshot of the current Circle. The initial data is seeded only when the Circle does not already exist, so ordinary reloads do not reset sheets.

Character data and portraits came from your supplied workbook. This is an unofficial personal tabletop companion. Candela Obscura belongs to its creators. Official resources: https://darringtonpress.com/candela/.

Ability names and reference links come from the [official character sheets](https://darringtonpress.com/wp-content/uploads/2024/06/CO_Character-Circle-Sheets_Interactive.pdf). Existing ability descriptions come from your workbook. Narrative ability effects are resolved with the GM; selecting an ability records ownership and does not automatically apply every narrative effect.
