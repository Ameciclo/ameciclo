// O que a página mostra quando o banco não responde ou ainda não tem dados: uma frase honesta, nunca um número de reserva.
export function Unavailable({ title, text }: { title: string; text: string }) {
  return (
    <section className="container mx-auto my-10 px-4">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-800">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{text}</p>
      </div>
    </section>
  );
}
