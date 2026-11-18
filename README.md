# Fists of the Four Isles!

A Multicultural Martial Arts Action Game, implemented as a game system for [Foundry Virtual Tabletop](https://foundryvtt.com/).

Both the game and this system are works in progress. The system currently declares one Actor type, `character`. Its data model holds notes, fate points, traits, martial arts styles, techniques and maneuvers, and its character sheet has two modes: play mode presents them for use during a game, and edit mode edits all of them. A button in the sheet's title bar switches between the two.

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
| `fists-of-the-four-isles.mjs` | Entry point. Registers the data models and the character sheet when Foundry initialises. |
| `module/data-models.mjs` | Data models for the `character` Actor type and for the traits, styles, techniques and maneuvers stored inside it. |
| `module/character-sheet.mjs` | The sheet for the `character` Actor type. |
| `templates/character-sheet/` | Handlebars templates for the character sheet, in a `play` folder and an `edit` folder for the sheet's two modes. Each folder holds one template per sheet part, plus `entry-list.hbs`, the partial for a list of techniques or maneuvers. |
| `styles/fists-of-the-four-isles.css` | The system stylesheet. |
| `lang/en.json` | English strings. |

## References

- [Introduction to System Development](https://foundryvtt.com/article/system-development/)
- [Introduction to System Data Models](https://foundryvtt.com/article/system-data-models/)
- [Foundry VTT API reference](https://foundryvtt.com/api/)
- [Applications guide](https://foundryvtt.com/api/modules/foundry.applications.html) and [Document Sheets guide](https://foundryvtt.com/api/modules/foundry.applications.sheets.html), in the API reference
