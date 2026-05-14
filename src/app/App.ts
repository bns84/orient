/**
 * ORIENT - Main App Class
 * 
 * Orchestriert die ORIENT-Anwendung.
 * Respektiert ORIENT_DNA: Ruhe, Stille, Local-first.
 */

export class App {
  private container: HTMLElement | null = null;

  init(): void {
    this.container = document.getElementById('app');
    
    if (!this.container) {
      console.error('App container not found');
      return;
    }

    // Initialer Zustand: Ruhe, Stille
    this.renderColdStart();
  }

  /**
   * Cold Start - ORIENT wartet
   * Dunkler/heller Raum, ruhige Präsenz
   * Zentrales Licht / lebendiger Denkraum
   * Keine UI-Last, kein Feed, kein Druck
   */
  private renderColdStart(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="orient-container">
        <div class="orient-denkspace">
          <div class="orient-lightpoint"></div>
        </div>
      </div>
    `;
  }
}
