export function Separator() {
  return (
    <div className="text-[var(--color-muted)] select-none my-2">
      {"─".repeat(44)}
    </div>
  );
}

export function DoubleSeparator() {
  return (
    <div className="text-[var(--color-text)] select-none my-2">
      {"═".repeat(44)}
    </div>
  );
}

interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2 className="font-semibold text-sm tracking-wide mt-6 mb-2">
      {children}
    </h2>
  );
}
