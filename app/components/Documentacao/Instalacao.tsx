import React from "react";

declare interface StepItemProps {
  description: string;
  command?: string;
}
function StepItem({ description, command }: StepItemProps) {
  return (
    <li className="mb-4">
      <p><strong>{description}</strong></p>
      {command && (
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto mt-2">
          <code>{command}</code>
        </pre>
      )}
    </li>
  );
}

declare interface StepListProps {
  steps: { description: string; command?: string }[];
}
function StepList({ steps }: StepListProps) {
  return (
    <ol className="list-decimal list-inside pl-6">
      {steps.map((step, idx) => (
        <StepItem
          key={idx}
          description={step.description}
          command={step.command}
        />
      ))}
    </ol>
  );
}

export default function InstalacaoProjeto() {
  const steps = [
    { description: 'Clone o repositório:', command: 'git clone https://github.com/ameciclo/ameciclo.git' },
    { description: 'Navegue até a pasta do projeto:', command: 'cd ameciclo' },
    { description: 'Instale as dependências do projeto:', command: 'npm install' },
    { description: 'Execute em modo de desenvolvimento:', command: 'npm run dev' },
  ];

  return (
    <section className="max-w mx-auto my-8 p-4 border border-gray-200 rounded">
      <h2 className="text-xl font-semibold mb-4">
        Instalação do Projeto (Remix 2.16)
      </h2>
      <StepList steps={steps} />
      <p className="mt-6 text-sm text-gray-600">
        Por padrão, o Remix 2.16 roda em <code>http://localhost:5173</code>.
      </p>
    </section>
  );
}
