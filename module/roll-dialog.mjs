import { DIE_SIZES, FistsRoll } from "./fists-roll.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @typedef {import("./fists-roll.mjs").FistsRollConfig} FistsRollConfig
 */

/**
 * @typedef RollDialogOptions
 * @property {string} [flavor]  What the roll is for, such as the name of the basis trait
 * @property {foundry.documents.Actor} [actor]  The Actor who makes the roll
 */

/**
 * The dialog that sets up a roll and sends it to the chat. Its Form half holds the Form die, the toggle that makes it explode, the basis and the support; its Void half holds the Void die, the toggle that makes it explode, the opposing basis and the resistance.
 * @example Open the dialog with the basis and the opposing basis filled in
 * new RollDialog({ basis: 3, opposingBasis: 2 }).render({ force: true });
 */
export class RollDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  /**
   * @param {FistsRollConfig & RollDialogOptions & Partial<foundry.applications.types.ApplicationConfiguration>} [options]
   */
  constructor({ formDie=6, voidDie=6, formExplodes=false, voidExplodes=false, basis=0, support=0, opposingBasis=0, resistance=0, flavor, actor, ...options }={}) {
    super(options);
    this.#config = { formDie, voidDie, formExplodes, voidExplodes, basis, support, opposingBasis, resistance };
    this.#flavor = flavor;
    this.#actor = actor;
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["fists-of-the-four-isles", "roll-dialog"],
    position: { width: 440 },
    window: { title: "FISTS.Roll.Title", icon: "fa-solid fa-dice", contentClasses: ["standard-form"] },
    form: { handler: this.#onSubmit, closeOnSubmit: true },
    actions: {
      stepDie: this.#onStepDie
    }
  };

  /** @override */
  static PARTS = {
    halves: { template: "systems/fists-of-the-four-isles/templates/roll/dialog.hbs" },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  /**
   * The dice, toggles and numbers of the roll being set up.
   * @type {Required<FistsRollConfig>}
   */
  #config;

  /**
   * What the roll is for.
   * @type {string|undefined}
   */
  #flavor;

  /**
   * The Actor who makes the roll.
   * @type {foundry.documents.Actor|undefined}
   */
  #actor;

  /* -------------------------------------------- */

  /** @inheritDoc */
  get title() {
    return this.#flavor ? `${super.title}: ${this.#flavor}` : super.title;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const config = this.#config;
    const half = (label, die, explodes, fields) => ({
      label,
      die,
      size: `d${config[die]}`,
      smallest: config[die] === DIE_SIZES.at(0),
      largest: config[die] === DIE_SIZES.at(-1),
      explodes: { name: explodes, value: config[explodes] },
      fields: fields.map(([name, fieldLabel]) => ({ name, label: fieldLabel, value: config[name] }))
    });
    context.halves = [
      half("FISTS.Roll.Form", "formDie", "formExplodes", [["basis", "FISTS.Roll.Basis"], ["support", "FISTS.Roll.Support"]]),
      half("FISTS.Roll.Void", "voidDie", "voidExplodes", [["opposingBasis", "FISTS.Roll.Basis"], ["resistance", "FISTS.Roll.Resistance"]])
    ];
    context.buttons = [{ type: "submit", icon: "fa-solid fa-dice", label: "FISTS.Roll.Roll", default: true }];
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Copy the toggles and numbers in the form into the roll being set up. A blank number field counts as zero.
   * @param {foundry.applications.ux.FormDataExtended} formData
   */
  #readForm(formData) {
    for ( const [name, value] of Object.entries(formData.object) ) this.#config[name] = value ?? 0;
  }

  /* -------------------------------------------- */

  /**
   * Step the Form die or the Void die up or down one size.
   * @this {RollDialog}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The element which defines the [data-action]
   */
  static async #onStepDie(event, target) {
    const { die, step } = target.dataset;
    const index = DIE_SIZES.indexOf(this.#config[die]) + Number(step);
    if ( !(index in DIE_SIZES) ) return;
    this.#readForm(new foundry.applications.ux.FormDataExtended(this.form));
    this.#config[die] = DIE_SIZES[index];
    await this.render({ parts: ["halves"] });
  }

  /* -------------------------------------------- */

  /**
   * Make the roll and send it to the chat.
   * @this {RollDialog}
   * @param {SubmitEvent} event  The originating form submission event
   * @param {HTMLFormElement} form  The form element that was submitted
   * @param {foundry.applications.ux.FormDataExtended} formData  Processed data for the submitted form
   */
  static async #onSubmit(event, form, formData) {
    this.#readForm(formData);
    const messageData = { speaker: foundry.documents.ChatMessage.implementation.getSpeaker({ actor: this.#actor }) };
    if ( this.#flavor ) messageData.flavor = foundry.utils.escapeHTML(this.#flavor);
    await FistsRoll.fromConfig(this.#config).toMessage(messageData);
  }
}
