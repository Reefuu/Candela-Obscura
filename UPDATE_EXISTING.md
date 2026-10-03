# Update your existing Candela-Obscura app

1. Unzip `Candela-Obscura-update.zip`.
2. In your existing `Reefuu/Candela-Obscura` GitHub repository, use **Add file → Upload files**.
3. Upload all the extracted files to the repository's top level, preserving the `tests` and `assets` folders. Commit the replacements. The new portrait belongs at `assets/sol.png`.
4. Wait for the GitHub Pages deployment, then reload your site. On a Mac, use **Cmd + Shift + R** to load the updated files.

The update ZIP contains the changed app files and does not contain `firebase-config.js`. Your configured Firebase project and saved Circle carry over. Keep using the corrected `firebase-rules.json` from the previous access fix; these features use the same database permissions.

## Firebase warning fix

Version 1.1.1 fixes the misleading access warning when rolls and sheets work but the online player connection fails. It supports the earlier presence rules by creating the player's owned entry before retrying disconnect cleanup when required. The current rules still register cleanup first.

Online player connection problems are shown in the player-list area. Real Circle access and save errors remain visible. Upload `index.html`, `app.js`, and `store.js` together so the page loads this fix instead of cached scripts. You do not need to reset your database or replace your Firebase config.

## Refresh pictures

Version 1.1.2 requests GitHub-hosted character portraits with a fresh image URL whenever the page opens or reloads. After replacing a picture in `assets` with the same filename, wait for the GitHub Pages deployment to finish and reload your app. You can also click **Refresh pictures ↻** in the top bar to request updated portraits while staying on the current screen. On a phone, the button is the **↻** icon.

The button refreshes portraits without changing your seat, draft messages, roll settings, or saved Circle. It keeps the portrait path stored in Firebase unchanged. External image URLs keep their original URL, including any signed parameters. If you upload a different filename, update the character's `portrait` field in Firebase to match it.

## Sol, your Lightkeeper

Version 1.1.3 names your existing Lightkeeper seat **Sol** and uses your supplied artwork at `assets/sol.png`. Sol appears on the roster card, in the sidebar, and in the seat heading. New Lightkeeper rolls, chat messages, and online presence use Sol's name.

This works with your existing saved Circle without a Firebase edit. Sol keeps the Lightkeeper's Circle overview and freeform dice; the five investigators keep their own advancement choices. Existing log entries keep their original authors. The update includes only Sol's new portrait, so your other uploaded pictures are preserved.

## Gilded dice

Choose an action and build its pool. Click the numbered dice in **Your dice pool** to choose which dice are gilded before rolling. The number of gilded dice comes from your action, extra gilded dice, and any shared Circle die. Clicking a standard die swaps the gilded choice when the pool already has the required number. A Circle die is always gilded.

The choice is saved with the roll. Resistance includes the chosen action gilded die and retains the bonus dice. Use **Edit sheet** to change which actions are gilded, or choose **Gild an additional action** during advancement.

## Abilities and level 2

The five existing investigators start at level 2. **Choose abilities** lets you correct their current abilities using the full catalog of 75 abilities from all five roles and ten specialties. Search by name or filter by class. Custom and supplement abilities can also be added.

Your table's unrestricted ability rule applies at every advancement. Existing descriptions from your workbook remain available; the other catalog entries link to their details in the official character sheets.

## Circle and character advancement

The Circle starts at level 2, matching its two selected Circle abilities. When illumination reaches 24, the Circle gains a level and resets the track to 0. Illumination beyond 24 carries into the next cycle.

Choose one new Circle ability in the advancement banner. Then each investigator chooses two different options:

- Add 1 point to an action below rating 3.
- Add 2 drive points, both in one drive or split between two drives. New points increase the maximum, available drive, and any newly earned resistance.
- Take a new ability from any role, specialty, or custom source.
- Gild an action that is not already gilded.

Characters gain their next level when their choices are applied. Each player's pending choices persist across reloads and appear in the Circle's advancement record. If another Circle level is earned first, unfinished upgrades remain available in order. Choosing **One Last Run** grants all four options for that advancement, as described in your workbook.

Existing live drives, marks, abilities, notes, and history are preserved. Opening the updated app adds the level and advancement fields to the existing Circle. Completing an advancement twice does not grant its upgrades twice.

## Full package

`Candela-Obscura-github-pages.zip` is also updated for a fresh installation. Follow `START_HERE.md` for new setup. For your running site, use the smaller update ZIP above.
