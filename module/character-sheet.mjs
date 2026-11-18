import { ManeuverModel, StyleModel, TechniqueModel, TraitModel } from "./data-models.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

const TEMPLATES = "systems/fists-of-the-four-isles/templates/character-sheet";

/**
 * The model that supplies the initial data of a new collection entry, keyed by the `data-kind` of an add button.
 */
const ENTRY_MODELS = { trait: TraitModel, style: StyleModel, technique: TechniqueModel, maneuver: ManeuverModel };

/**
 * Describe one entry of a collection for the templates.
 * @param {string} collection  The path of the collection within the Actor, such as "system.traits"
 * @param {string} id  The key of the entry within the collection
 * @param {object} source  The source data of the entry
 * @param {Record<string, foundry.data.fields.DataField>} fields  The fields of the entry's model
 * @returns {object}
 */
function prepareEntry(collection, id, source, fields) {
  const path = `${collection}.${id}`;
  const names = Object.fromEntries(Object.keys(fields).map(key => [key, `${path}.${key}`]));
  return { collection, id, path, source, fields, names };
}

/**
 * Describe a collection of techniques or maneuvers for the entry-list template.
 * @param {string} title  The localization key of the list's heading
 * @param {string} kind  The key in ENTRY_MODELS of the model for new entries
 * @param {string} collection  The path of the collection within the Actor
 * @param {Record<string, object>} entries  The source data of the collection
 * @param {Record<string, foundry.data.fields.DataField>} fields  The fields of the entries' model
 * @returns {object}
 */
function prepareList(title, kind, collection, entries, fields) {
  return { title, kind, collection, entries: Object.entries(entries).map(([id, source]) => prepareEntry(collection, id, source, fields)) };
}

/**
 * The sheet for the `character` Actor type.
 */
export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["fists-of-the-four-isles", "character-sheet"],
    position: { width: 640, height: 720 },
    window: { contentClasses: ["standard-form"], resizable: true },
    form: { submitOnChange: true },
    actions: {
      addEntry: this.#onAddEntry,
      changeMode: this.#onChangeMode,
      deleteEntry: this.#onDeleteEntry
    }
  };

  /** @override */
  static PARTS = {
    playHeader: { template: `${TEMPLATES}/play/header.hbs` },
    playBody: { template: `${TEMPLATES}/play/body.hbs`, templates: [`${TEMPLATES}/play/entry-list.hbs`], scrollable: [""] },
    editHeader: { template: `${TEMPLATES}/edit/header.hbs` },
    editBody: { template: `${TEMPLATES}/edit/body.hbs`, templates: [`${TEMPLATES}/edit/entry-list.hbs`], scrollable: [""] }
  };

  /**
   * The parts each mode renders. Play mode presents the character for use during a game; edit mode is the form that builds the character.
   */
  static MODE_PARTS = {
    play: ["playHeader", "playBody"],
    edit: ["editHeader", "editBody"]
  };

  /**
   * The mode the sheet is in, a key of MODE_PARTS.
   * @type {"play"|"edit"}
   */
  #mode = "play";

  /* -------------------------------------------- */

  /** @inheritDoc */
  _configureRenderOptions(options) {
    if ( !this.isEditable ) this.#mode = "play";
    else if ( options.renderContext === "createActor" ) this.#mode = "edit";
    super._configureRenderOptions(options);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const modeParts = this.constructor.MODE_PARTS[this.#mode];
    for ( const partId of Object.keys(parts) ) {
      if ( !modeParts.includes(partId) ) delete parts[partId];
    }
    return parts;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _getFrameButtons(options) {
    const buttons = super._getFrameButtons(options);
    if ( this.isEditable ) buttons.unshift({ icon: "fa-solid fa-pen-to-square", label: "FISTS.Sheets.Edit", action: "changeMode" });
    return buttons;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = context.source.system;
    const systemFields = this.actor.system.schema.fields;
    const traitTypes = systemFields.traits.element.types;

    context.systemFields = systemFields;
    context.traits = Object.entries(system.traits).map(([id, source]) => {
      const fields = traitTypes[source.type].fields;
      const trait = prepareEntry("system.traits", id, source, fields);
      trait.isStyle = source.type === "style";
      trait.lists = [prepareList("FISTS.Techniques.Title", "technique", `${trait.path}.techniques`, source.techniques, fields.techniques.element.fields)];
      if ( trait.isStyle ) trait.lists.push(prepareList("FISTS.Maneuvers.Title", "maneuver", `${trait.path}.maneuvers`, source.maneuvers, fields.maneuvers.element.fields));
      return trait;
    });
    context.techniques = prepareList("FISTS.Techniques.Title", "technique", "system.techniques", system.techniques, systemFields.techniques.element.fields);
    context.notesHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.notes, { secrets: this.actor.isOwner, relativeTo: this.actor });
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const modeParts = this.constructor.MODE_PARTS[this.#mode];
    for ( const element of content.querySelectorAll(":scope > [data-application-part]") ) {
      if ( !modeParts.includes(element.dataset.applicationPart) ) element.remove();
    }
    super._replaceHTML(result, content, options);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    const toggle = this.element.querySelector('.window-header [data-action="changeMode"]');
    if ( !toggle ) return;
    const editing = this.#mode === "edit";
    toggle.classList.toggle("fa-pen-to-square", !editing);
    toggle.classList.toggle("fa-check", editing);
    toggle.ariaLabel = game.i18n.localize(editing ? "FISTS.Sheets.Play" : "FISTS.Sheets.Edit");
  }

  /* -------------------------------------------- */

  /**
   * Switch between play mode and edit mode.
   * @this {CharacterSheet}
   */
  static async #onChangeMode() {
    this.#mode = this.#mode === "edit" ? "play" : "edit";
    await this.render();
  }

  /* -------------------------------------------- */

  /**
   * Add an entry to the collection named by the clicked button.
   * @this {CharacterSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The element which defines the [data-action]
   */
  static async #onAddEntry(event, target) {
    const { collection, kind } = target.dataset;
    const entry = new ENTRY_MODELS[kind]().toObject();
    await this.actor.update({ [collection]: { [foundry.utils.randomID()]: entry } });
  }

  /* -------------------------------------------- */

  /**
   * Delete the collection entry named by the clicked button.
   * @this {CharacterSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The element which defines the [data-action]
   */
  static async #onDeleteEntry(event, target) {
    const { collection, entryId } = target.dataset;
    await this.actor.update({ [collection]: { [entryId]: _del } });
  }
}
