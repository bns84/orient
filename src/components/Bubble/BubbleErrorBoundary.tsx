import React, { Component, type ReactNode } from 'react';
import type { PresenceState } from '../../store/types';
import { presenceOrbStyle } from '../../store/presenceStyles';

type Props = {
  state: PresenceState;
  width: number;
  height: number;
  children: ReactNode;
};

type State = { failed: boolean };

/** Verhindert, dass ein WebGL/R3F-Fehler die gesamte App unmountet. */
export class BubbleErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.warn('[OrientBubble] WebGL/3D nicht verfügbar, CSS-Fallback.', error);
  }

  render(): ReactNode {
    if (this.state.failed) {
      const { state, width, height } = this.props;
      return (
        <div
          aria-hidden
          style={{
            ...presenceOrbStyle(state),
            width,
            height,
            flexShrink: 0,
          }}
        />
      );
    }
    return this.props.children;
  }
}
