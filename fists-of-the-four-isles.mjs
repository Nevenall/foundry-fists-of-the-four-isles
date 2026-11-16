import { CharacterSheet } from "./module/character-sheet.mjs";
import { CharacterDataModel } from "./module/data-models.mjs";

Hooks.once("init", () => {
  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel
  };

  // Register sheets.
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, CharacterSheet, { types: ["character"], makeDefault: true, label: "FISTS.Sheets.Character" });
});
