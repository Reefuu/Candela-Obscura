# Candela Obscura — The Prophets

A static GitHub Pages app with permanent Circle and character selection, imported character sheets, action dice, gilded results, resistance, live conversation, Circle resources, and a shared Canva article archive.

**Setup: [START_HERE.md](START_HERE.md).** Create a new Firebase project, fill in `firebase-config.js`, and upload this folder's contents to the new `Reefuu/Candela-Obscura` repository.

**Already running the app? Use [UPDATE_EXISTING.md](UPDATE_EXISTING.md).** Version 1.2 adds the Articles archive, alongside selectable gilded dice and unrestricted character advancement, while preserving existing live data.

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

Version 1.1.2 refreshes GitHub-hosted portraits on page load and adds **Refresh pictures ↻** in the top bar. Replace a portrait using its existing filename, wait for deployment, then reload or use the button.

Version 1.1.3 adds **Sol**, your Lightkeeper, with the supplied portrait on the roster and sidebar. New Lightkeeper rolls, chat, and online presence are attributed to Sol.

Version 1.2 adds the **Articles** tab with Wysel’s supplied newspaper image, **All / Keith / Wysel** filters, a full-size reader, and add/edit/remove controls. Upload new Canva PNG or JPG exports to `assets/articles`, then enter their paths in **Add article**. Optional titles, publication names, and dates stay in Firebase with the Circle. The archive survives clearing the table log and includes safeguards against simultaneous edits.

Version 1.2.1 adds **Reset drives** and **Reset resistance** on each investigator’s Actions & drives page. Each button refills its own three tracks to their current maximum. **Add custom gear** accepts any item name and optional notes; custom items can be marked as carried, edited, or removed and are saved with the investigator. The patch is based on the latest uploaded project and keeps its existing config, portraits, and article files.

## Files

| File | Purpose |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Interface and interaction |
| `core.js`, `state.js` | Dice rules, resource accounting, and atomic state operations |
| `store.js` | Local preview or Firebase Realtime Database |
| `campaign-data.js` | Initial imported Circle and five character sheets |
| `ability-catalog.js`, `progression.js` | All-class ability choices, level migration, and persistent advancements |
| `articles.js` | Persistent article archive, one-time example migration, and shared edit protection |
| `firebase-config.js` | Configuration for the new Firebase project |
| `firebase-rules.json` | Rules for the new database |
| `assets/` | Existing portraits and seal from the workbook |
| `tests/` | Dice, resource, migration, advancement, presence, and article regression tests |

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/. No npm build or server backend is needed for hosting.

To run the game/state tests with Node.js 22 or newer:

```bash
npm test
```

Validation completed: 52 game, progression, presence, archive, drive/resistance reset, and custom gear tests. Desktop and 390px phone browser checks cover original-quality article images, author filters, add/edit/remove controls, bad-path rejection, full-size zoom and panning, picture refresh, shared updates, stale editors, backups, and reload persistence. Firebase emulator checks use the production store and published rules to verify archive migration, simultaneous additions and conversation, clearing the log, reconnecting, and permanently removing every article. Desktop and 390px phone checks also cover separate drive/resistance refills, custom gear names and multiline notes, marking items, shared editing, removal, backups, and use after spending tracks. Real Firebase transactions verify simultaneous resets and gear additions, stale custom gear edits, reloads, and preservation of other live data. Mobile counts are also checked at the maximum 12 drive points. Existing sheet and advancement checks remain covered. Live Firebase play still needs your project’s config and the two-browser check in START_HERE.md.

The app uses native browser modules, the Firebase Web SDK, and browser `crypto.getRandomValues()` for dice. Rolls are generated on each player's device and are suitable for a friendly tabletop group. Authentication and database rules protect database access; they do not provide server-authoritative dice or private membership gates. Hosting this repository publicly makes its initial character sheets and artwork publicly accessible.

Log history is bounded to the latest 100 entries. Use **Export backup** to keep a snapshot of the current Circle. The initial data is seeded only when the Circle does not already exist, so ordinary reloads do not reset sheets.

Character data and portraits came from your supplied workbook. This is an unofficial personal tabletop companion. Candela Obscura belongs to its creators. Official resources: https://darringtonpress.com/candela/.

Ability names and reference links come from the [official character sheets](https://darringtonpress.com/wp-content/uploads/2024/06/CO_Character-Circle-Sheets_Interactive.pdf). Existing ability descriptions come from your workbook. Narrative ability effects are resolved with the GM; selecting an ability records ownership and does not automatically apply every narrative effect.
