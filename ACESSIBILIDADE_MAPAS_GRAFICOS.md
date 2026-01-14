# Correções de Acessibilidade - Mapas e Gráficos

## 1. Mapa OpenStreetView (CicloDados)

### Problema
- Mapa sem título
- Sem descrição para leitores de tela
- Difícil navegação por teclado

### Solução

**No MapView.tsx, adicionar ao container do mapa:**

```tsx
<div 
  role="application"
  aria-label="Mapa interativo de dados de ciclomobilidade do Recife"
  aria-describedby="map-description"
>
  {/* Mapa aqui */}
  
  <div id="map-description" className="sr-only">
    Mapa interativo mostrando infraestrutura cicloviária, contagens de ciclistas,
    bicicletários, estações Bike PE e dados de segurança viária. 
    Use os filtros na lateral para visualizar diferentes camadas de dados.
    Clique em pontos do mapa para ver informações detalhadas.
  </div>
</div>
```

**Adicionar classe CSS para screen readers only:**

```css
/* app/globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 2. Gráficos da Seção Perfil

### Problema
- Gráficos sem descrição textual
- Dados inacessíveis para leitores de tela

### Solução

**Para cada gráfico, adicionar:**

```tsx
// Exemplo: Gráfico de distribuição por gênero
<div 
  role="img" 
  aria-label={`Gráfico de distribuição por gênero: ${
    Object.entries(genderData)
      .map(([gender, count]) => `${gender}: ${count} pessoas (${percentage}%)`)
      .join(', ')
  }`}
>
  <HighchartsReact highcharts={Highcharts} options={chartOptions} />
  
  {/* Tabela alternativa oculta visualmente */}
  <table className="sr-only">
    <caption>Distribuição de ciclistas por gênero</caption>
    <thead>
      <tr>
        <th>Gênero</th>
        <th>Quantidade</th>
        <th>Percentual</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(genderData).map(([gender, count]) => (
        <tr key={gender}>
          <td>{gender}</td>
          <td>{count}</td>
          <td>{calculatePercentage(count, total)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 3. Versão Textual do CicloDados

### Solução: Criar rota alternativa

**Criar arquivo: `app/routes/dados.ciclodados.texto.tsx`**

```tsx
export default function CicloDadosTexto() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        CicloDados - Versão Texto
      </h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm">
          Esta é uma versão alternativa acessível da plataforma CicloDados.
          Todos os dados estão disponíveis em formato de texto e tabelas.
        </p>
      </div>

      <nav className="mb-8">
        <h2 className="text-xl font-bold mb-4">Índice</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><a href="#infraestrutura" className="text-blue-600 hover:underline">Infraestrutura Cicloviária</a></li>
          <li><a href="#contagens" className="text-blue-600 hover:underline">Contagens de Ciclistas</a></li>
          <li><a href="#bicicletarios" className="text-blue-600 hover:underline">Bicicletários</a></li>
          <li><a href="#bike-pe" className="text-blue-600 hover:underline">Estações Bike PE</a></li>
          <li><a href="#seguranca" className="text-blue-600 hover:underline">Dados de Segurança</a></li>
          <li><a href="#perfil" className="text-blue-600 hover:underline">Perfil de Ciclistas</a></li>
        </ul>
      </nav>

      {/* Seções com dados em tabelas */}
      <section id="infraestrutura" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Infraestrutura Cicloviária</h2>
        {/* Tabela com dados de infraestrutura */}
      </section>

      {/* Mais seções... */}
    </div>
  );
}
```

**Adicionar link na página principal do CicloDados:**

```tsx
<a 
  href="/dados/ciclodados/texto"
  className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"
  aria-label="Acessar versão em texto do CicloDados"
>
  <FileText size={20} />
  Versão Texto
</a>
```

---

## 4. Resumo das Mudanças

### MapView.tsx
- [ ] Adicionar `role="application"`
- [ ] Adicionar `aria-label` descritivo
- [ ] Adicionar `aria-describedby` com instruções
- [ ] Criar descrição oculta com `.sr-only`

### Gráficos (PointInfoPopup, Perfil, etc)
- [ ] Adicionar `role="img"` em containers de gráficos
- [ ] Adicionar `aria-label` com dados textuais
- [ ] Criar tabelas alternativas com `.sr-only`

### Nova Rota
- [ ] Criar `dados.ciclodados.texto.tsx`
- [ ] Adicionar todas as seções de dados em formato texto/tabela
- [ ] Adicionar link "Versão Texto" na página principal

### CSS Global
- [ ] Adicionar classe `.sr-only` no `globals.css`

---

## 5. Exemplo Completo de Gráfico Acessível

```tsx
function AccessibleChart({ data, title }: { data: any[], title: string }) {
  const chartDescription = data
    .map(item => `${item.name}: ${item.value}`)
    .join(', ');

  return (
    <div>
      <h3 id={`chart-${title}`}>{title}</h3>
      
      <div 
        role="img" 
        aria-labelledby={`chart-${title}`}
        aria-describedby={`chart-desc-${title}`}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
      
      <p id={`chart-desc-${title}`} className="sr-only">
        {chartDescription}
      </p>
      
      <details className="mt-4">
        <summary className="cursor-pointer text-blue-600 hover:underline">
          Ver dados em tabela
        </summary>
        <table className="w-full mt-2 border">
          <thead>
            <tr>
              <th className="border p-2">Item</th>
              <th className="border p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.name}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
```

---

## Prioridade de Implementação

1. **Alta**: Adicionar `.sr-only` e descrições no mapa
2. **Alta**: Criar versão texto do CicloDados
3. **Média**: Adicionar aria-labels nos gráficos
4. **Média**: Criar tabelas alternativas para gráficos
