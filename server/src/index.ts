/**
 * Start des Pförtners:  npm run server   (oder Doppelklick auf start-orient.bat)
 */

import { loadConfig } from './config.js';
import { createHttpServer } from './http.js';
import { createModels, pickModel } from './models/index.js';
import { Orient } from './orient.js';
import { Brain } from './store.js';
import { effectiveDailyLimit, spentToday } from './tree/stations.js';
import { formatUsd } from './time.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const models = createModels(config);
  const model = pickModel(models, config.activeModel);
  const brain = await Brain.open(config.dbPath);
  const orient = new Orient(brain, model, config);
  const server = createHttpServer(orient);

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nDer Anschluss ${config.port} ist schon belegt. Läuft der Pförtner vielleicht schon in einem anderen Fenster?`,
      );
    } else {
      console.error('\nDer Pförtner konnte nicht starten:', err.message);
    }
    process.exit(1);
  });

  server.listen(config.port, config.host, () => {
    const limit = effectiveDailyLimit(orient.deps, config.userId);
    const spent = spentToday(orient.deps, config.userId, new Date());
    console.log('');
    console.log('ORIENT-Pförtner läuft.');
    console.log(`  Adresse:      http://${config.host}:${config.port}`);
    console.log(`  KI:           ${model.label} (${model.model})`);
    console.log(
      model.ready
        ? '  Schlüssel:    vorhanden'
        : '  Schlüssel:    FEHLT (trage ihn in die Datei server\\.env ein)',
    );
    console.log(`  Tageslimit:   ${formatUsd(limit)} Dollar (heute bisher ${formatUsd(spent)})`);
    console.log(`  Datenbank:    ${config.dbPath}`);
    console.log('');
    console.log('Dieses Fenster offen lassen, solange du ORIENT benutzt.');
  });

  const shutdown = () => {
    console.log('\nPförtner wird beendet …');
    server.close();
    brain.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err: unknown) => {
  console.error('Der Pförtner konnte nicht starten:', err instanceof Error ? err.message : err);
  process.exit(1);
});
