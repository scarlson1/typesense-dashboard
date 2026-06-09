import { describe, expect, it } from 'vitest';
import { getLlmProvider, splitModelName, toModelName } from './llmProviders';

describe('toModelName', () => {
  it('composes provider prefix and model id', () => {
    expect(toModelName('openai', 'gpt-4.1')).toBe('openai/gpt-4.1');
    expect(toModelName('google', 'gemini-2.5-flash')).toBe(
      'google/gemini-2.5-flash',
    );
  });
});

describe('splitModelName', () => {
  it('splits a known provider prefix from the model id', () => {
    const { provider, model } = splitModelName('openai/gpt-4.1');
    expect(provider?.id).toBe('openai');
    expect(model).toBe('gpt-4.1');
  });

  it('keeps the rest of the path for namespaced model ids (Cloudflare)', () => {
    const { provider, model } = splitModelName(
      'cloudflare/@cf/meta/llama-2-7b-chat-int8',
    );
    expect(provider?.id).toBe('cloudflare');
    expect(model).toBe('@cf/meta/llama-2-7b-chat-int8');
  });

  it('returns no provider for an unknown prefix but still extracts the model', () => {
    const { provider, model } = splitModelName('mystery/some-model');
    expect(provider).toBeUndefined();
    expect(model).toBe('some-model');
  });

  it('returns the whole string as the model when there is no slash', () => {
    expect(splitModelName('gpt-4.1')).toEqual({ model: 'gpt-4.1' });
  });
});

describe('getLlmProvider', () => {
  it('looks up a provider by id', () => {
    expect(getLlmProvider('azure')?.label).toBe('Azure OpenAI');
  });

  it('returns undefined for an unknown id', () => {
    expect(getLlmProvider('nope')).toBeUndefined();
  });
});
