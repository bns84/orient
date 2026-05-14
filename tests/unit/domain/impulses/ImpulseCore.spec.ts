/**
 * ORIENT - Impulse Core Tests
 * 
 * Tests für Impulse Domain Object, Factory und Linker.
 * Respektiert ORIENT_DNA: Rohes Denken, nicht bewerten.
 */

import { describe, it, expect } from 'vitest';
import { ImpulseState } from '@core/impulses/ImpulseState';
import { Impulse } from '@core/impulses/Impulse';
import { ImpulseFactory } from '@core/impulses/ImpulseFactory';
import { ImpulseLinker } from '@core/impulses/ImpulseLinker';

describe('Impulse Core', () => {
  describe('ImpulseFactory', () => {
    it('creates a DUST impulse from text', () => {
      const impulse = ImpulseFactory.create({
        id: 'i1',
        content: { text: 'Idee: Wunderkerzen-Servietten' },
      });

      expect(impulse.state).toBe(ImpulseState.DUST);
      expect(impulse.links.threadIds).toHaveLength(0);
      expect(impulse.meta.pinned).toBe(false);
      expect(impulse.content.text).toBe('Idee: Wunderkerzen-Servietten');
    });

    it('rejects empty impulses', () => {
      expect(() =>
        ImpulseFactory.create({
          id: 'i2',
          // @ts-expect-error - Testing invalid input
          content: {},
        }),
      ).toThrow('Impulse must have at least one content field');
    });

    it('creates impulse with transcript', () => {
      const impulse = ImpulseFactory.create({
        id: 'i3',
        content: { transcript: 'Voice input test' },
      });

      expect(impulse.content.transcript).toBe('Voice input test');
      expect(impulse.state).toBe(ImpulseState.DUST);
    });

    it('creates impulse with custom meta', () => {
      const impulse = ImpulseFactory.create({
        id: 'i4',
        content: { text: 'Important idea' },
        meta: { pinned: true, importanceHint: 'HIGH' },
      });

      expect(impulse.meta.pinned).toBe(true);
      expect(impulse.meta.importanceHint).toBe('HIGH');
    });
  });

  describe('ImpulseLinker', () => {
    it('links impulse to thread idempotently', () => {
      const impulse = ImpulseFactory.create({
        id: 'i5',
        content: { text: 'Trading Idee: These prüfen' },
      });

      const linked1 = ImpulseLinker.linkToThread(impulse, 't1');
      const linked2 = ImpulseLinker.linkToThread(linked1, 't1');

      expect(linked1.links.threadIds).toEqual(['t1']);
      expect(linked2.links.threadIds).toEqual(['t1']); // Idempotent
      expect(linked2).toBe(linked1); // Gleiche Referenz bei wiederholtem Link
    });

    it('unlinks from thread idempotently', () => {
      const impulse = ImpulseFactory.create({
        id: 'i6',
        content: { text: 'Test' },
      });

      const linked = ImpulseLinker.linkToThread(impulse, 't1');
      const unlinked1 = ImpulseLinker.unlinkFromThread(linked, 't1');
      const unlinked2 = ImpulseLinker.unlinkFromThread(unlinked1, 't1');

      expect(unlinked1.links.threadIds).toHaveLength(0);
      expect(unlinked2.links.threadIds).toHaveLength(0); // Idempotent
      expect(unlinked2).toBe(unlinked1); // Gleiche Referenz
    });

    it('links to entity idempotently', () => {
      const impulse = ImpulseFactory.create({
        id: 'i7',
        content: { text: 'Entity test' },
      });

      const linked = ImpulseLinker.linkToEntity(impulse, 'e1');
      const linkedAgain = ImpulseLinker.linkToEntity(linked, 'e1');

      expect(linked.links.entityIds).toEqual(['e1']);
      expect(linkedAgain.links.entityIds).toEqual(['e1']); // Idempotent
    });

    it('pins and unpins an impulse', () => {
      const impulse = ImpulseFactory.create({
        id: 'i8',
        content: { transcript: 'Ich will das später exportieren' },
      });

      const pinned = ImpulseLinker.pin(impulse);
      expect(pinned.meta.pinned).toBe(true);

      const unpinned = ImpulseLinker.unpin(pinned);
      expect(unpinned.meta.pinned).toBe(false);
    });

    it('pin/unpin is idempotent', () => {
      const impulse = ImpulseFactory.create({
        id: 'i9',
        content: { text: 'Test' },
      });

      const pinned1 = ImpulseLinker.pin(impulse);
      const pinned2 = ImpulseLinker.pin(pinned1);

      expect(pinned2.meta.pinned).toBe(true);
      expect(pinned2).toBe(pinned1); // Gleiche Referenz

      const unpinned1 = ImpulseLinker.unpin(pinned2);
      const unpinned2 = ImpulseLinker.unpin(unpinned1);

      expect(unpinned2.meta.pinned).toBe(false);
      expect(unpinned2).toBe(unpinned1); // Gleiche Referenz
    });
  });

  describe('DNA-Konformität', () => {
    it('is a snapshot - no updatedAt (DNA: Momentaufnahme)', () => {
      const impulse = ImpulseFactory.create({
        id: 'i10',
        content: { text: 'Test' },
      });

      // Impulse hat nur createdAt, kein updatedAt
      expect(impulse.createdAt).toBeDefined();
      expect((impulse as any).updatedAt).toBeUndefined();
    });

    it('does not evaluate - only captures (DNA: nicht bewerten)', () => {
      const impulse = ImpulseFactory.create({
        id: 'i11',
        content: { text: 'Rohe, unfertige Idee' },
      });

      // Keine Auto-Bewertung, nur Nutzer-Input
      expect(impulse.meta.importanceHint).toBeUndefined();
    });

    it('can be linked but not restructured (DNA: nicht zu früh strukturieren)', () => {
      const impulse = ImpulseFactory.create({
        id: 'i12',
        content: { text: 'Unstrukturierte Idee' },
      });

      // Impulse bleibt roh, Verknüpfungen kommen später
      expect(impulse.links.threadIds).toHaveLength(0);
      expect(impulse.state).toBe(ImpulseState.DUST);
    });
  });
});
