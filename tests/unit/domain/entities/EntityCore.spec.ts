/**
 * ORIENT - Entity Core Tests
 * 
 * Tests für Entity Domain Object und Factory.
 * Respektiert ORIENT_DNA: Transparenz, Stabilität.
 */

import { describe, it, expect } from 'vitest';
import { EntityFactory } from '@core/entities/EntityFactory';
import { EntityType } from '@core/entities/EntityType';

describe('Entity Core', () => {
  describe('EntityFactory', () => {
    it('creates entity with required fields', () => {
      const entity = EntityFactory.create({
        id: 'e1',
        type: EntityType.PERSON,
        name: 'John Doe',
      });

      expect(entity.id).toBe('e1');
      expect(entity.type).toBe(EntityType.PERSON);
      expect(entity.name).toBe('John Doe');
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
      expect(entity.createdAt.getTime()).toBe(entity.updatedAt.getTime());
    });

    it('rejects empty name', () => {
      expect(() =>
        EntityFactory.create({
          id: 'e2',
          type: EntityType.COMPANY,
          name: '   ', // Nur Whitespace
        }),
      ).toThrow('Entity.name must not be empty');
    });

    it('trims name and description', () => {
      const entity = EntityFactory.create({
        id: 'e3',
        type: EntityType.PROJECT,
        name: '  My Project  ',
        description: '  Project description  ',
      });

      expect(entity.name).toBe('My Project');
      expect(entity.description).toBe('Project description');
    });

    it('handles aliases', () => {
      const entity = EntityFactory.create({
        id: 'e4',
        type: EntityType.ORG,
        name: 'Organization',
        aliases: ['Org', '  Org2  ', '', '  '],
      });

      expect(entity.aliases).toEqual(['Org', 'Org2']); // Leere/Whitespace entfernt
    });

    it('creates entity with custom createdAt', () => {
      const customDate = new Date('2024-01-01');
      const entity = EntityFactory.create({
        id: 'e5',
        type: EntityType.PLACE,
        name: 'Location',
        createdAt: customDate,
      });

      expect(entity.createdAt).toEqual(customDate);
      expect(entity.updatedAt).toEqual(customDate);
    });
  });
});
