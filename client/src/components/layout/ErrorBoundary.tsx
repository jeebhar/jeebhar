import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/**
 * Stops one failing subtree from blanking the entire site.
 *
 * React unmounts the whole tree when a render throws, so before this existed a
 * single unexpected value — a content field written before it was added to the
 * schema, say — produced a white page with nothing but a console error. The
 * visitor saw an empty site and had no way to recover.
 *
 * Wrapping each section means a failure is contained to that section, and the
 * rest of the page still renders.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Named in the fallback copy, e.g. "Travel Reels". */
  label?: string;
  /** Replaces the default fallback entirely. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept as console.error deliberately: this is the hook to wire an error
    // reporter (Sentry and similar) into later.
    console.error(`Render failed${this.props.label ? ` in ${this.props.label}` : ''}`, error, info);
  }

  override render() {
    const { error } = this.state;
    const { children, label, fallback } = this.props;

    if (!error) {
      return children;
    }

    if (fallback !== undefined) {
      return fallback;
    }

    return (
      <section className="py-10">
        <p className="rounded-lg border border-white/10 bg-brand-800/40 px-4 py-3 text-sm text-brand-200">
          {label ? `${label} could not be displayed.` : 'This section could not be displayed.'}
        </p>
      </section>
    );
  }
}
