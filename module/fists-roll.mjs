/**
 * The sizes a Form die or a Void die can have, smallest first. Stepping a die up or down moves it one place along this list.
 */
export const DIE_SIZES = [4, 6, 8, 10, 12];

/**
 * Write a number as a signed term of a roll formula. Zero adds no term.
 * @param {number} value
 * @returns {string}
 */
function formulaTerm(value) {
  return value ? ` ${value < 0 ? "-" : "+"} ${Math.abs(value)}` : "";
}

/**
 * Round a number to the two decimal places the chat card shows.
 * @param {number} value
 * @returns {number}
 */
function rounded(value) {
  return Math.round(value * 100) / 100;
}

/**
 * @typedef FistsRollConfig
 * @property {number} [formDie=6]  The size of the Form die, one of DIE_SIZES
 * @property {number} [voidDie=6]  The size of the Void die, one of DIE_SIZES
 * @property {number} [basis=0]  The rating of the basis trait, added to the Effort
 * @property {number} [support=0]  The support, added to the Effort
 * @property {number} [opposingBasis=0]  The rating of the opposing trait, or the difficulty, added to the Opposition
 * @property {number} [resistance=0]  The resistance, added to the Opposition
 */

/**
 * The roll for an action. The Effort is the Form die plus the basis and the support. The Opposition is the Void die plus the opposing basis and the resistance. The roll's total is the Result: the Effort minus the Opposition.
 */
export class FistsRoll extends foundry.dice.Roll {
  /** @override */
  static CHAT_TEMPLATE = "systems/fists-of-the-four-isles/templates/roll/chat.hbs";

  /* -------------------------------------------- */

  /**
   * Build the roll for an action. The numbers are kept in the roll's options, which are stored with its chat message.
   * @param {FistsRollConfig} [config]
   * @returns {FistsRoll}
   */
  static fromConfig({ formDie=6, voidDie=6, basis=0, support=0, opposingBasis=0, resistance=0 }={}) {
    const effort = `1d${formDie}${formulaTerm(basis)}${formulaTerm(support)}`;
    const opposition = `1d${voidDie}${formulaTerm(-opposingBasis)}${formulaTerm(-resistance)}`;
    return new this(`${effort} - ${opposition}`, {}, { basis, support, opposingBasis, resistance });
  }

  /* -------------------------------------------- */

  /**
   * The Effort: the Form die plus the basis and the support.
   * @type {number}
   */
  get effort() {
    const [formDie] = this.dice;
    return formDie.total + this.options.basis + this.options.support;
  }

  /* -------------------------------------------- */

  /**
   * The Opposition: the Void die plus the opposing basis and the resistance.
   * @type {number}
   */
  get opposition() {
    const [, voidDie] = this.dice;
    return voidDie.total + this.options.opposingBasis + this.options.resistance;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async render({ isPrivate=false, template, ...options }={}) {
    // A viewer who may not see the results gets the core roll template, which hides them.
    if ( isPrivate ) template ??= foundry.dice.Roll.CHAT_TEMPLATE;
    return super.render({ ...options, isPrivate, template });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareChatRenderContext({ isPrivate=false, ...options }={}) {
    if ( isPrivate ) return super._prepareChatRenderContext({ isPrivate, ...options });
    const [formDie, voidDie] = this.dice;
    const { basis, support, opposingBasis, resistance } = this.options;
    const higher = formDie.total > voidDie.total ? "form" : formDie.total < voidDie.total ? "void" : "equal";
    return {
      comparison: `FISTS.Roll.Higher.${higher}`,
      halves: [
        { label: "FISTS.Roll.Form", size: `d${formDie.faces}`, rolled: formDie.total, higher: higher === "form", modifiers: [{ label: "FISTS.Roll.Basis", value: rounded(basis) }, { label: "FISTS.Roll.Support", value: rounded(support) }], totalLabel: "FISTS.Roll.Effort", total: rounded(this.effort) },
        { label: "FISTS.Roll.Void", size: `d${voidDie.faces}`, rolled: voidDie.total, higher: higher === "void", modifiers: [{ label: "FISTS.Roll.Basis", value: rounded(opposingBasis) }, { label: "FISTS.Roll.Resistance", value: rounded(resistance) }], totalLabel: "FISTS.Roll.Opposition", total: rounded(this.opposition) }
      ],
      result: rounded(this.total)
    };
  }
}
