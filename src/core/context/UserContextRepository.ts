/**
 * ORIENT - User Context Repository Interface
 * 
 * Abstraktion für User-Context-Persistenz.
 */

import { UserContext } from './UserContext';

export interface UserContextRepository {
  getCurrent(): Promise<UserContext>;
  save(context: UserContext): Promise<void>;
}
