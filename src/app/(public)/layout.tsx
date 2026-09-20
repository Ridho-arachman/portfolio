/**
 * Public route group wrapper.
 *
 * Navbar & Footer are rendered once in the root layout (`src/app/layout.tsx`).
 * This route group only keeps the top spacing required by the fixed navbar
 * (h-20 => pt-20) — nesting another Navbar/main/Footer here duplicated the
 * DOM (two landmarks + duplicate social buttons) and hurt Lighthouse.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="pt-20">{children}</div>;
}