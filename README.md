# Candela Obscura — The Prophets

A static GitHub Pages app with permanent Circle and character selection, imported character sheets, action dice, gilded results, resistance, live conversation, and Circle resources.

**Setup: [START_HERE.md](START_HERE.md).** Create a new Firebase project, fill in `firebase-config.js`, and upload this folder's contents to the new `Reefuu/Candela-Obscura` repository.

## Use it

1. Choose **The Prophets**.
2. Choose Wysel, Keith, Excallibur, Jack, or Camellya.
3. Click an action. Its rating and gilded die load automatically.
4. Spend drive or add bonus dice, then roll.
5. Choose and accept a result. Gilded acceptance recovers matching drive once per roll.
6. Burn resistance to reroll action dice. Bonus dice stay in the pool.

Sheets, drives, marks, selected gear, illumination, and Circle resources are editable. Live changes persist separately from the initial workbook data. All members of the trusted table can edit sheets. The Lightkeeper seat provides a Circle overview and freeform roller.

With empty Firebase placeholders, the app offers a clearly labelled local preview. Preview edits persist in that browser and can sync between tabs of the same origin. Online cross-device play requires Firebase configuration. An online connection failure shows an error instead of opening a local table.

## Files

| File | Purpose |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Interface and interaction |
| `core.js`, `state.js` | Dice rules, resource accounting, and atomic state operations |
| `store.js` | Local preview or Firebase Realtime Database |
| `campaign-data.js` | Initial imported Circle and five character sheets |
| `firebase-config.js` | Configuration for the new Firebase project |
| `firebase-rules.json` | Rules for the new database |
| `assets/` | Existing portraits and seal from the workbook |
| `tests/` | Game/state regression tests |

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/. No npm build or server backend is needed for hosting.

To run the game/state tests with Node.js 22 or newer:

```bash
npm test
```

Validation completed: 11 game/state tests, plus desktop and 390px phone browser checks for repeat rolls, resource accounting, shared updates between local tabs, escaped text, concurrent edits, and reload persistence. Live Firebase play still needs the new project's config and the two-browser check in START_HERE.md.

The app uses native browser modules, the Firebase Web SDK, and browser `crypto.getRandomValues()` for dice. Rolls are generated on each player's device and are suitable for a friendly tabletop group. Authentication and database rules protect database access; they do not provide server-authoritative dice or private membership gates. Hosting this repository publicly makes its initial character sheets and artwork publicly accessible.

Log history is bounded to the latest 100 entries. Use **Export backup** to keep a snapshot of the current Circle. The initial data is seeded only when the Circle does not already exist, so ordinary reloads do not reset sheets.

Character data and portraits came from your supplied workbook. This is an unofficial personal tabletop companion. Candela Obscura belongs to its creators. Official resources: https://darringtonpress.com/candela/.
