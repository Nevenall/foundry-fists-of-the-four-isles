# Fists of the Four Isles!

A Multicultural Martial Arts Action Game, implemented as a game system for [Foundry Virtual Tabletop](https://foundryvtt.com/).

Both the game and this system are works in progress. The system currently declares one Actor type, `character`. Its data model holds notes, fate points, traits, martial arts styles, techniques and maneuvers, and its character sheet has two modes: play mode presents them for use during a game, and edit mode edits all of them. A button in the sheet's title bar switches between the two.

Rolls are set up in a roll dialog with two halves. The Form half holds the Form die, the basis trait rating and the support; the Void half holds the Void die, the opposing basis (the rating of the opposing trait, or the difficulty) and the resistance. Each die starts at d6 and steps up or down along d4, d6, d8, d10 and d12. Each half has an Explodes toggle: a die that explodes is rolled again each time it rolls its highest number, and every number rolled is added to its total. The roll's chat card shows what each die rolled, a mark on a die that was set to explode along with every number it rolled if it exploded, an outline around the die whose total is higher, the Effort (Form die + basis + support), the Opposition (Void die + opposing basis + resistance) and the Result (Effort − Opposition). In play mode each trait has a roll button, which opens the dialog with that trait's rating as the basis.

## Requirements

Foundry Virtual Tabletop, generation 14.

## Installing for development

Foundry loads game systems from the `Data/systems` folder inside its user data folder, and a system's folder name must match the `id` in its `system.json`. This repo therefore lives at:

```
{userData}/Data/systems/fists-of-the-four-isles
```

Once it is there, Foundry offers "Fists of the Four Isles!" as a game system when you create a world.

## Debugging

With a Foundry server running on port 3030, run the **Foundry in Chrome (localhost:3030)** configuration from the Run and Debug view in VS Code. It opens Chrome at `http://localhost:3030` with the debugger attached.

## Layout

| Path | Purpose |
|---|---|
| `system.json` | The system manifest. |
| `fists-of-the-four-isles.mjs` | Entry point. Registers the data models, the roll class and the character sheet when Foundry initialises. |
| `module/data-models.mjs` | Data models for the `character` Actor type and for the traits, styles, techniques and maneuvers stored inside it. |
| `module/character-sheet.mjs` | The sheet for the `character` Actor type. |
| `module/fists-roll.mjs` | `FistsRoll`, the roll for an action, and the list of die sizes. It computes the Effort, the Opposition and the Result and prepares the data of the roll's chat card. |
| `module/roll-dialog.mjs` | `RollDialog`, the dialog that sets up a roll and sends it to the chat. It can be opened with any of its dice, toggles and numbers filled in, such as `new RollDialog({ basis: 3, opposingBasis: 2 }).render({ force: true })`. |
| `templates/character-sheet/` | Handlebars templates for the character sheet, in a `play` folder and an `edit` folder for the sheet's two modes. Each folder holds one template per sheet part, plus `entry-list.hbs`, the partial for a list of techniques or maneuvers. |
| `templates/roll/` | Handlebars templates for rolls: `dialog.hbs` for the two halves of the roll dialog and `chat.hbs` for the roll's chat card. |
| `styles/fists-of-the-four-isles.css` | The system stylesheet. |
| `lang/en.json` | English strings. |

## References

- [Introduction to System Development](https://foundryvtt.com/article/system-development/)
- [Introduction to System Data Models](https://foundryvtt.com/article/system-data-models/)
- [Foundry VTT API reference](https://foundryvtt.com/api/)
- [Applications guide](https://foundryvtt.com/api/modules/foundry.applications.html) and [Document Sheets guide](https://foundryvtt.com/api/modules/foundry.applications.sheets.html), in the API reference
