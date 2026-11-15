import { CharacterDataModel } from "./module/data-models.mjs";

Hooks.once("init", () => {
  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel
  };
});
