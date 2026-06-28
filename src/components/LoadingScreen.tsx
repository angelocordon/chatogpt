interface Props {
  progress: number
  statusText: string
}

export default function LoadingScreen({ progress, statusText }: Props) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-10">
      <span className="text-xs tracking-widest text-muted-foreground/60 uppercase">
        chatogpt
      </span>

      <div className="flex w-52 flex-col gap-3">
        <div className="relative h-px w-full bg-border">
          <div
            className="absolute inset-y-0 left-0 bg-foreground/60 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground/40">
          <span>{statusText}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/25">Cached after first load.</p>
    </div>
  )
}
