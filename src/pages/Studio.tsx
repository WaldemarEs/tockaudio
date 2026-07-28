export default function Studio() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg mt-4">
      <h2 className="text-2xl font-semibold mb-2">TockAudio Studio</h2>
      <p className="text-muted-foreground mb-4">Arrastra aquí tus archivos de audio o video para empezar.</p>
      {/* Aquí irá el widget interactivo o WaveSurfer */}
      <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-2 rounded-md transition-colors">
        Seleccionar Archivo
      </button>
    </div>
  )
}
