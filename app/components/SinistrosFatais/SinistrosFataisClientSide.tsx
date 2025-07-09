"use client";
import React, { useState } from "react";
import { StatisticsBox } from "~/components/ExecucaoCicloviaria/StatisticsBox";
import { ExplanationBoxes } from "~/components/Dados/ExplanationBoxes";
import { CardsSession } from "~/components/Commom/CardsSession";
import { InfoCards } from "~/components/Contagens/InfoCards";
import { getGeneralStatistics, getCityCardsByYear } from "./configuration";

type SinistrosFataisProps = {
  summaryData: any;
  citiesByYearData: any;
  pageData: any;
};

export default function SinistrosFataisClientSide({
  summaryData,
  citiesByYearData,
  pageData,
}: SinistrosFataisProps) {
  const [tipoLocal, setTipoLocal] = useState("ocorrencia");
  const [selectedYear, setSelectedYear] = useState(2023);
  const [selectedCardCity, setSelectedCardCity] = useState(2611606); // Recife

  // Caixas de explicação padrão
  const defaultExplanationBoxes = [
    {
      title: "O que são esses dados?",
      description:
        "Dados de mortalidade no trânsito extraídos do Sistema de Informações sobre Mortalidade (SIM) do DATASUS, considerando os códigos CID-10 de V01 a V89 (acidentes de transporte terrestre).",
    },
    {
      title: "Local de Ocorrência vs. Residência",
      description:
        "Local de Ocorrência indica onde o sinistro aconteceu, enquanto Local de Residência mostra onde a vítima morava. Essa distinção é importante para análises de políticas públicas e planejamento urbano.",
    },
  ];

  return (
    <>
      {/* Estatísticas gerais */}
      <StatisticsBox
        title="Mortes no Trânsito"
        subtitle={`Dados do DATASUS - RMR (por ${
          tipoLocal === "ocorrencia"
            ? "Local de ocorrência da morte"
            : "Local de residência da pessoa morta"
        })`}
        boxes={getGeneralStatistics(summaryData, tipoLocal)}
      />

      {/* Caixas de explicação */}
      <ExplanationBoxes
        boxes={
          pageData.explanationBoxes && pageData.explanationBoxes.length > 0
            ? pageData.explanationBoxes
            : defaultExplanationBoxes
        }
      />

      {/* Mortes por Cidade */}
      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Mortes por Cidade
        </h2>
        <h3 className="text-xl text-center mb-8">
          {tipoLocal === "ocorrencia" ? "Local de ocorrência" : "Local de residência"} - {selectedYear}
        </h3>
        <InfoCards
          cards={getCityCardsByYear(citiesByYearData, selectedYear, tipoLocal).map(city => ({
            label: city.label,
            data: `${city.value} ${city.unit}`,
            icon: "ride" // ícone padrão
          }))}
        />
      </div>

      {/* Seção de Documentos */}
      {pageData.supportFiles && pageData.supportFiles.length > 0 && (
        <CardsSession
          title="Documentação sobre segurança viária"
          cards={pageData.supportFiles.map((file: any) => ({
            title: file.title || "Documento",
            description: file.description || "",
            url: file.url || "#",
            src: file.src || "/icons/document.svg",
            target: "_blank",
          }))}
        />
      )}
    </>
  );
}