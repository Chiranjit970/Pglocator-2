// Allow imports that mistakenly include an NPM-style version suffix like
// `sonner@2.0.3` or `lucide-react@0.487.0` to resolve during TS checks.
// These modules will be typed as `any` (safe fallback).
declare module '*@*' {
  const value: any;
  export default value;
  export = value;
}

// Generic fallback for assets
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
