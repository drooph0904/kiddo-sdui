/**
 * Per-block fault isolation. If a single block throws while rendering (corrupt metadata,
 * unexpected payload shape), this boundary catches it, drops just that block, and leaves
 * the rest of the feed intact — so one bad node can never blank the whole screen.
 */
import React from 'react';

interface Props {
  children: React.ReactNode;
  blockId: string;
  blockType: string;
}

interface State {
  hasError: boolean;
}

export class BlockErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    if (__DEV__) {
      console.warn(
        `[BlockErrorBoundary] Block "${this.props.blockType}" (id=${this.props.blockId}) ` +
          `threw and was dropped.`,
        error,
      );
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
