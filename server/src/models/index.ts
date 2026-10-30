import type { Config, ModelChoice } from '../config.js';
import { createAnthropicClient } from './anthropic.js';
import { MockModel } from './mock.js';
import { createOpenAiClient } from './openai.js';
import type { ModelClient } from './types.js';

export type ModelSet = Record<ModelChoice, ModelClient>;

export function createModels(config: Config): ModelSet {
  return {
    anthropic: createAnthropicClient(config.anthropic),
    openai: createOpenAiClient(config.openai),
    mock: new MockModel(),
  };
}

export function pickModel(models: ModelSet, choice: ModelChoice): ModelClient {
  return models[choice];
}

export * from './types.js';
export { MockModel } from './mock.js';
