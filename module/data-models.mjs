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
      trouble: new BooleanField(),
      desire: new BooleanField(),
      magic: new BooleanField(),
      techniques: new TypedObjectField(new EmbeddedDataField(TechniqueModel))
    };
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

export class CharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      notes: new HTMLField(),
      fatePoints: new SchemaField({
        value: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        refresh: new NumberField({ required: true, nullable: false, min: 0, initial: 0 })
      }),
      traits: new TypedObjectField(new TypedSchemaField({ trait: TraitModel, style: StyleModel })),
      techniques: new TypedObjectField(new EmbeddedDataField(TechniqueModel))
    };
  }
}
