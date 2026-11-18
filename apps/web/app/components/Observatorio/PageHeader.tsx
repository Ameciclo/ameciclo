// Cabeçalho das páginas de observatório: o título e duas seções curtas (o que são os dados, como os usamos).
export function PageHeader({ title, explanations }: { title: string; explanations: { label: string; text: string }[] }) {
  return (
    <header className="container mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
        {explanations.map(({ label, text }) => (
          <section key={label} className="border-t-2 border-ameciclo pt-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ameciclo">{label}</h2>
            <p className="mt-2 max-w-prose leading-relaxed text-gray-700">{text}</p>
          </section>
        ))}
      </div>
    </header>
  );
}
