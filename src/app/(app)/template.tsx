// Unlike a layout, a template is created fresh on every navigation, so the
// fade-in in .page-enter (globals.css) plays each time you change pages.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
