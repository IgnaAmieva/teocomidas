export default function ComoRetirarPage() {
  return (
    <div className="px-6 pt-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Cómo retirar</h1>
      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="font-bold">Retiro en el local</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Hacé tu pedido, te avisamos cuando está listo y lo retirás por mostrador.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="font-bold">Auto Car</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pedí desde tu auto, pasá por el local y te lo damos sin que te bajes.
          </p>
        </div>
      </div>
    </div>
  );
}
