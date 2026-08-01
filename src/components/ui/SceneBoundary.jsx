import { Component } from 'react';

/**
 * Error boundary for the WebGL sections.
 *
 * A portfolio must never show a blank page. If a visitor's browser fails to
 * create a WebGL context, runs out of GPU memory, or hits a driver bug, the
 * 3D scene throws during render — and without a boundary that unmounts the
 * whole React tree. This catches it and leaves a styled placeholder, so the
 * surrounding DOM content (which carries all the real information) survives.
 *
 * Wrap each canvas individually rather than the app, so one failing scene
 * cannot take the others down with it.
 */
export default class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Kept as a warning: this is recoverable and the page stays usable.
    console.warn('[3D scene unavailable]', error?.message ?? error);
  }

  render() {
    if (this.state.failed) {
      const { label = '3D scene' } = this.props;
      return (
        <div className="grid h-full w-full place-items-center px-6" role="note">
          <div className="text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-dashed border-white/20"
            />
            <p className="text-sm text-white/50">{label} could not load on this device.</p>
            <p className="mt-1 font-mono text-[11px] text-white/30">
              Everything below still works.
            </p>
            {/* Some failures are transient — e.g. the browser was briefly out
                of WebGL contexts because another scene hadn't been garbage
                collected yet. Resetting gives that a chance to clear instead
                of leaving the visitor stuck behind this message forever. */}
            <button
              onClick={() => this.setState({ failed: false })}
              className="mt-4 rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/60 transition-colors hover:border-primary/50 hover:text-primary"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
