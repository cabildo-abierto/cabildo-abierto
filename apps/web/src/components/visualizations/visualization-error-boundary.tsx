"use client";
import {Component, type ReactNode} from 'react';
import {cn} from '@/lib/utils';
export class VisualizationErrorBoundary extends Component<{resetKey: unknown; onError?: (error: Error) => void; children: ReactNode}, {error: string | null; resetKey: unknown}> {
    state = {error: null as string | null, resetKey: null as unknown};
    static getDerivedStateFromProps(props: {resetKey: unknown}, state: {resetKey: unknown}) {
        return props.resetKey === state.resetKey ? null : {resetKey: props.resetKey, error: null};
    }
    static getDerivedStateFromError(error: Error) { return {error: error.message || 'No pudimos renderizar la visualización.'}; }
    componentDidCatch(error: Error) { this.props.onError?.(error); }
    render() {
        return this.state.error ? <p role="alert" className={cn('rounded-md border border-destructive/30 p-3 text-sm text-destructive')}>{this.state.error}</p> : this.props.children;
    }
}
