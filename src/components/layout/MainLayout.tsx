export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            {/* Logo placeholder */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-background">T</div>
            <span className="font-bold hidden sm:inline-block">TockAudio</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="/studio" className="transition-colors hover:text-foreground/80 text-foreground/60">Studio</a>
            <a href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</a>
            <a href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">Docs</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col container mx-auto max-w-screen-2xl px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-border/40 py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for privacy and speed. 100% local processing.
          </p>
          <div className="flex items-center space-x-4 text-sm font-medium text-muted-foreground">
             <a href="/about" className="hover:underline">About</a>
             <a href="/terms" className="hover:underline">Terms</a>
             <a href="/privacy" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
