# Fists of the Four Isles! — Foundry VTT system

A custom game system for Foundry Virtual Tabletop implementing *Fists of the Four Isles!*, "A Multicultural Martial Arts Action Game". Both the game and this system are works in progress.

## Where things live

- **System code** — this repo, at `c:\foundry\Data\systems\fists-of-the-four-isles`. It sits inside the Foundry user data folder, so Foundry loads the system from the working tree. The folder name is the system `id` and must match `id` in `system.json`.
- **Foundry** — the system targets the latest stable Foundry VTT release, generation 14. It is installed at `C:\Program Files\Foundry Virtual Tabletop`; the exact installed version is the `version` field of `resources\app\package.json` there.
- **Game design** — the Obsidian vault folder `C:\notebook\Fists of the Four Isles`. Read the relevant notes before implementing a mechanic.
  - `The Game.md` — rules draft: traits, techniques, fate points, actions, maneuvers, range, character creation points.
  - `Designing the Game.md` — working notes on dice, effort vs opposition, damage and wounds.
  - `Introduction.md` — inspiration, mood, and tone.
  - `_TODOs.md` — what is needed to start playtesting.
  - `_design notes/` — design explorations.
  - `_archive/` — archived material.

The rules are unsettled and the notes give differing versions of some mechanics. Confirm which version to implement with the user.

## Finding answers about Foundry

Foundry is packaged and structured in unexpected ways, so look things up in this order:

1. The knowledge base articles on foundryvtt.com. Always start here, and build from what they instruct.
2. The API reference.
3. Foundry's installed source. This is the last step, for questions the docs leave unanswered.

## How a Foundry system is put together

From the System Development and System Data Models articles linked below:

- `system.json` at the repo root is the manifest and the only required file. It lists the entry-point script in `esmodules`, stylesheets in `styles`, translation files in `languages`, and the Actor/Item sub-types the system provides in `documentTypes`.
- Each sub-type in `documentTypes` is paired with a `foundry.abstract.TypeDataModel` subclass that defines its schema in `static defineSchema()`. Register these on `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels` inside a `Hooks.once("init", …)` callback in the entry-point module.
- System-wide Actor/Item behaviour goes in Document subclasses assigned to `CONFIG.Actor.documentClass` / `CONFIG.Item.documentClass` in the same hook.
- File and folder names are lower-case and hyphen-separated.

## References

Foundry knowledge base (index: https://foundryvtt.com/kb/):

- Introduction to System Development — manifest fields, file layout, data models, document classes, data preparation: https://foundryvtt.com/article/system-development/
- Introduction to System Data Models — `documentTypes`, `TypeDataModel`, migrations, token resources: https://foundryvtt.com/article/system-data-models/
- Introduction to Development — documents, flags, hooks, Handlebars, CSS namespacing, package versioning: https://foundryvtt.com/article/intro-development/
- Languages and Localization: https://foundryvtt.com/article/localization/
- Compendium Packs: https://foundryvtt.com/article/compendium/
- API Migration Guides: https://foundryvtt.com/article/migration/

Foundry API reference (index: https://foundryvtt.com/api/):

- Manifest schema — BasePackage: https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html and BaseSystem: https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html
- TypeDataModel: https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html
- Data fields: https://foundryvtt.com/api/modules/foundry.data.fields.html
- Actor: https://foundryvtt.com/api/classes/foundry.documents.Actor.html and Item: https://foundryvtt.com/api/classes/foundry.documents.Item.html
- Applications and sheets, guides — the knowledge base has no article on sheets or ApplicationV2 (checked 2026-11-15), so the prose guides with code examples are these API namespace pages:
  - https://foundryvtt.com/api/modules/foundry.applications.html — `DEFAULT_OPTIONS`, `actions`, `PARTS`, context preparation, `TABS`, form handling, rendering.
  - https://foundryvtt.com/api/modules/foundry.applications.sheets.html — extending `ActorSheetV2` / `ItemSheetV2`, registering with `DocumentSheetConfig.registerSheet` in `init`, drag and drop.
  - https://foundryvtt.com/api/modules/foundry.applications.handlebars.html — index of Foundry's Handlebars helpers, linking to a page per helper.
- Applications and sheets, class pages (member listings) — ApplicationV2: https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html, HandlebarsApplicationMixin: https://foundryvtt.com/api/functions/foundry.applications.api.HandlebarsApplicationMixin.html, ActorSheetV2: https://foundryvtt.com/api/classes/foundry.applications.sheets.ActorSheetV2.html, ItemSheetV2: https://foundryvtt.com/api/classes/foundry.applications.sheets.ItemSheetV2.html
- Dice — Roll: https://foundryvtt.com/api/classes/foundry.dice.Roll.html
- Hook events: https://foundryvtt.com/api/modules/hookEvents.html

Last step — Foundry's own source, matching the installed version, under `C:\Program Files\Foundry Virtual Tabletop\resources\app`:

- `client\` — the client API: applications and sheets, canvas, dice, documents, `hooks.mjs`, `config.mjs`.
- `common\` — shared code: `abstract\` (DataModel, TypeDataModel, Document), `data\` (fields), `documents\` (base document schemas), `packages\` (manifest schemas), `constants.mjs`.

Reference implementation, for seeing how a working system does something: https://github.com/foundryvtt/dnd5e — the knowledge base's example of a fairly feature-complete system. It is far more complex and customised than this system needs. Keep this system simple: take from it the smallest pattern that does the job.

WebFetch returns a summary of these pages and leaves out the code examples. To read an example exactly, download the page's raw HTML and read that.
