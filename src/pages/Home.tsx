export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
        Edita, limpia y convierte tu audio.<br />
        <span className="text-primary">100% en tu navegador.</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-[600px]">
        Tus archivos nunca suben a internet. Potencia de escritorio, accesibilidad web.
      </p>
      <a href="/studio" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
        Abrir el Editor (Gratis)
      </a>
    </div>
  )
}
