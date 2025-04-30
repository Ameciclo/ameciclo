import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useState } from 'react';

// loader server-side
export const loader: LoaderFunction = async ({ request }) => {
  const res = await fetch('https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json');
  const data = await res.json();

  const url = new URL(request.url);
  const search = url.searchParams.get("q")?.toLowerCase() || "";

  const filtered = search
    ? data.campos.filter((item: any) =>
        item.cd_nm_acao.toLowerCase().includes(search)
      )
    : data.campos;

  return json({ rows: filtered, search });
};

export default function DadosAbertos() {
  const { rows, search } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div style={{ padding: 20 }}>
      <h1>Dados Abertos - PE</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const query = new FormData(form).get("q")?.toString() || "";
          setSearchParams(query ? { q: query } : {});
        }}
      >
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Buscar por nome da ação"
        />
        <button type="submit">Buscar</button>
      </form>

      <table border={1} cellPadding={8} style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Ação</th>
            <th>Função</th>
            <th>Programa</th>
            <th>Subação</th>
            <th>Valor Atualizado</th>
            <th>Total Pago</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.cd_nm_acao}</td>
              <td>{item.cd_nm_funcao}</td>
              <td>{item.cd_nm_prog}</td>
              <td>{item.cd_nm_subacao}</td>
              <td>{item.vlrdotatualizada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{item.vlrtotalpago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
