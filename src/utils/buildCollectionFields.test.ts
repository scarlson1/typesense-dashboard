import { describe, expect, it } from 'vitest';
import {
  buildCollectionFields,
  type CollectionFieldDraft,
} from './buildCollectionFields';
import { buildVectorConfigState } from './vectorFieldConfig';

const draft = (
  overrides: Partial<CollectionFieldDraft> = {},
): CollectionFieldDraft => ({
  name: 'title',
  type: 'string',
  facet: false,
  optional: false,
  index: true,
  store: true,
  sort: false,
  infix: false,
  range_index: false,
  stem: false,
  reference: '',
  async_reference: false,
  ...overrides,
});

describe('buildCollectionFields', () => {
  it('emits only non-default flags', () => {
    const { fields, errors } = buildCollectionFields([
      draft({ facet: true, index: false, store: false, sort: true }),
    ]);
    expect(errors).toEqual([]);
    expect(fields[0]).toEqual({
      name: 'title',
      type: 'string',
      facet: true,
      sort: true,
      index: false,
      store: false,
    });
  });

  it('builds a reference field with async_reference', () => {
    const { fields, errors } = buildCollectionFields([
      draft({
        name: 'product_id',
        reference: 'products.id',
        async_reference: true,
      }),
    ]);
    expect(errors).toEqual([]);
    expect(fields[0].reference).toBe('products.id');
    expect(fields[0].async_reference).toBe(true);
  });

  it('omits async_reference when false and reference when empty', () => {
    const { fields } = buildCollectionFields([
      draft({ reference: 'products.id' }),
      draft({ name: 'plain' }),
    ]);
    expect(fields[0].async_reference).toBeUndefined();
    expect(fields[1].reference).toBeUndefined();
  });

  it('rejects malformed references', () => {
    const { errors } = buildCollectionFields([
      draft({ name: 'product_id', reference: 'no_dot_here' }),
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/product_id/);
    expect(errors[0]).toMatch(/collection\.field/);
  });

  it('builds an auto-embed field from a valid builtin config', () => {
    const vectorConfig = {
      ...buildVectorConfigState(null),
      autoEmbed: true,
      from: ['title'],
    };
    const { fields, errors } = buildCollectionFields([
      draft({ name: 'embedding', type: 'float[]', vectorConfig }),
    ]);
    expect(errors).toEqual([]);
    expect(fields[0].embed).toEqual({
      from: ['title'],
      model_config: { model_name: 'ts/all-MiniLM-L12-v2' },
    });
    expect(fields[0].vec_dist).toBe('cosine');
    expect(fields[0]).not.toHaveProperty('vectorConfig');
  });

  it('collects an error for an incomplete embed config', () => {
    const vectorConfig = {
      ...buildVectorConfigState(null),
      autoEmbed: true,
      from: [], // missing source fields
    };
    const { errors } = buildCollectionFields([
      draft({ name: 'embedding', type: 'float[]', vectorConfig }),
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/embedding/);
  });

  it('builds a manual-dimension vector field', () => {
    const vectorConfig = {
      ...buildVectorConfigState(null),
      numDim: '768',
      vecDist: 'ip',
    };
    const { fields, errors } = buildCollectionFields([
      draft({ name: 'vec', type: 'float[]', vectorConfig }),
    ]);
    expect(errors).toEqual([]);
    expect(fields[0].num_dim).toBe(768);
    expect(fields[0].vec_dist).toBe('ip');
    expect(fields[0].embed).toBeUndefined();
  });

  it('leaves an unconfigured float[] field as a plain array', () => {
    const { fields, errors } = buildCollectionFields([
      draft({
        name: 'scores',
        type: 'float[]',
        vectorConfig: buildVectorConfigState(null),
      }),
    ]);
    expect(errors).toEqual([]);
    expect(fields[0].num_dim).toBeUndefined();
    expect(fields[0].embed).toBeUndefined();
  });
});
