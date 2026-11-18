const { BooleanField, EmbeddedDataField, HTMLField, NumberField, SchemaField, StringField, TypedObjectField, TypedSchemaField } = foundry.data.fields;

// A collection is a TypedObjectField: an object that maps a generated id to an entry.

/**
 * The `type` field a TypedSchemaField reads to choose the model for an entry.
 * @param {string} type
 * @returns {StringField}
 */
function typeField(type) {
  return new StringField({ required: true, blank: false, initial: type, validate: value => value === type, validationError: `must be equal to "${type}"` });
}

/* -------------------------------------------- */
/*  Embedded Models                             */
/* -------------------------------------------- */

export class TechniqueModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: new StringField({ required: true }),
      description: new StringField({ required: true })
    };
  }
}

export class ManeuverModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: new StringField({ required: true }),
      description: new StringField({ required: true })
    };
  }
}

export class TraitModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      type: typeField("trait"),
      name: new StringField({ required: true }),
      description: new StringField({ required: true }),
      rating: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
      // Blank for a trait that is not a trouble. A trouble is either only negative or double-sided: one with a positive side as well.
      trouble: new StringField({ required: true, blank: true, choices: { negative: "FISTS.Trouble.Choices.negative", doubleSided: "FISTS.Trouble.Choices.doubleSided" } }),
      desire: new BooleanField(),
      magic: new BooleanField(),
      techniques: new TypedObjectField(new EmbeddedDataField(TechniqueModel))
    };
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    // Stored data may hold `trouble` as a boolean, where true marks a trouble of unrecorded kind. It becomes an only negative trouble.
    if ( typeof source.trouble === "boolean" ) source.trouble = source.trouble ? "negative" : "";
    return super.migrateData(source, options);
  }
}

export class StyleModel extends TraitModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: typeField("style"),
      maneuvers: new TypedObjectField(new EmbeddedDataField(ManeuverModel))
    };
  }
}

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

/**
 * The traits a character starts with: the key of each trait's name in FISTS.StartingTraits, and its rating.
 */
const STARTING_TRAITS = { Physique: 1, Movement: 1, Fighting: 0, Shooting: 0 };

/**
 * Build the trait collection of a character that is created without one.
 * @returns {Record<string, object>}
 */
function startingTraits() {
  return Object.fromEntries(Object.entries(STARTING_TRAITS).map(([key, rating]) => [foundry.utils.randomID(), new TraitModel({ name: game.i18n.localize(`FISTS.StartingTraits.${key}`), rating }).toObject()]));
}

export class CharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      notes: new HTMLField(),
      fatePoints: new SchemaField({
        value: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        refresh: new NumberField({ required: true, nullable: false, min: 0, initial: 0 })
      }),
      traits: new TypedObjectField(new TypedSchemaField({ trait: TraitModel, style: StyleModel }), { initial: startingTraits }),
      techniques: new TypedObjectField(new EmbeddedDataField(TechniqueModel))
    };
  }
}
