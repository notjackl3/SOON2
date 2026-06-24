"use client";

import { Component, type ReactNode } from "react";

/**
 * Renders nothing if the 3D scene fails to load (e.g. the GLB hasn't been
 * dropped into /public/models yet). Keeps the rest of the site fully usable.
 */
export class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[scene-background] 3D scene failed to load:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
