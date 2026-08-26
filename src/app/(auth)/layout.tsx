// src/app/(auth)/layout.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * AUTH LAYOUT
 * Immersive, edge-to-edge, dark. NO centering wrapper, NO light background —
 * the pages themselves own their composition. The old template wrapper was
 * painting a light background and collapsing the split-screen grid.
 * ────────────────────────────────────────────────────────────────────────────
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}