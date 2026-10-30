import { STATIONS } from './stations.js';
import { RequestCancelled, type Ctx, type Deps, type Gate } from './types.js';

/** Die Schleuse im ersten Wurf: Tür offen, nichts wird verändert. */
export const openGate: Gate = {
  outbound() {},
  inbound() {},
};

function throwIfAborted(ctx: Ctx): void {
  if (ctx.signal.aborted) throw new RequestCancelled();
}

/** Schickt eine Anfrage durch alle neun Türen. Wirft RequestCancelled bei Abbruch. */
export async function runPipeline(ctx: Ctx, deps: Deps): Promise<Ctx> {
  for (const station of STATIONS) {
    throwIfAborted(ctx);
    const t0 = Date.now();

    if (ctx.shortCircuit && station.skippable) {
      ctx.steps.push({ id: station.id, name: station.name, state: 'uebersprungen', ms: 0 });
      continue;
    }

    const result = await station.run(ctx, deps);
    ctx.steps.push({
      id: station.id,
      name: station.name,
      state: result?.state ?? 'ok',
      ms: Date.now() - t0,
      note: result?.note,
    });
  }
  return ctx;
}

export function newCtx(input: {
  requestId: string;
  userId: string;
  text: string;
  source: Ctx['source'];
  companionName: string;
  now: Date;
  signal: AbortSignal;
}): Ctx {
  return {
    requestId: input.requestId,
    userId: input.userId,
    source: input.source,
    companionName: input.companionName,
    text: input.text,
    now: input.now,
    signal: input.signal,
    lastMessageAt: null,
    sinceLastMs: null,
    timeLine: '',
    rules: [],
    rulesChanged: false,
    taskNotes: [],
    system: '',
    messages: [],
    modelText: null,
    modelLabel: null,
    answer: null,
    shortCircuit: false,
    persist: true,
    failed: false,
    stopped: false,
    usage: [],
    steps: [],
  };
}
