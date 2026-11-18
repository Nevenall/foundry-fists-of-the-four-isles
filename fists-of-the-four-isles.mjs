import { CharacterSheet } from "./module/character-sheet.mjs";
import { CharacterDataModel } from "./module/data-models.mjs";
import { FistsRoll } from "./module/fists-roll.mjs";

Hooks.once("init", () => {
  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel
  };

  // Register the roll class, so that the rolls stored in chat messages are restored as FistsRoll instances.
  CONFIG.Dice.rolls.push(FistsRoll);

  // Register sheets.
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, CharacterSheet, { types: ["character"], makeDefault: true, label: "FISTS.Sheets.Character" });
});
