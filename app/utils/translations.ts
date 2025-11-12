// Traduções para os dados de perfil
export const profileTranslations = {
  // Chaves dos campos em inglês
  'Years Using': 'Tempo de uso',
  'Biggest Need': 'Maior necessidade', 
  'Motivation To Start': 'Motivação para começar',
  'Motivation To Continue': 'Motivação para continuar',
  'years using': 'Tempo de uso',
  'biggest need': 'Maior necessidade', 
  'motivation to start': 'Motivação para começar',
  'motivation to continue': 'Motivação para continuar',
  'years_using': 'Tempo de uso',
  'biggest_need': 'Maior necessidade',
  'motivation_to_start': 'Motivação para começar',
  'motivation_to_continue': 'Motivação para continuar',
  
  // Valores das respostas - tempo de uso
  'Mais De 5 Anos': 'Mais de 5 anos',
  'Entre 2 E 5 Anos': 'Entre 2 e 5 anos', 
  'Entre 1 E 2 Anos': 'Entre 1 e 2 anos',
  'Entre 6 Meses E 1 Ano': 'Entre 6 meses e 1 ano',
  'Menos De 6 Meses': 'Menos de 6 meses',
  'mais de 5 anos': 'Mais de 5 anos',
  'entre 2 e 5 anos': 'Entre 2 e 5 anos',
  'entre 1 e 2 anos': 'Entre 1 e 2 anos', 
  'entre 6 meses e 1 ano': 'Entre 6 meses e 1 ano',
  'menos de 6 meses': 'Menos de 6 meses',
  
  // Valores das respostas - motivações e necessidades
  'É Mais RáPido E PráTico': 'É mais rápido e prático',
  'É Mais Barato': 'É mais barato',
  'É Mais Saudável': 'É mais saudável',
  'É Mais SaudáVel': 'É mais saudável', 
  'É Ambientalmente Correto': 'É ambientalmente correto',
  'É mais rápido e prático': 'É mais rápido e prático',
  'É mais saudável': 'É mais saudável',
  'É mais barato': 'É mais barato',
  'É ambientalmente correto': 'É ambientalmente correto',
  'Sem Resposta': 'Sem resposta',
  'Outros': 'Outros'
};

export function translateProfileData(data: Record<string, any>) {
  const translated: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    const translatedKey = profileTranslations[key as keyof typeof profileTranslations] || key;
    const translatedValue = typeof value === 'string' 
      ? profileTranslations[value as keyof typeof profileTranslations] || value
      : value;
    
    translated[translatedKey] = translatedValue;
  });
  
  return translated;
}

// Função para calcular porcentagem
export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

// Função específica para traduzir chaves de características comportamentais
export function translateBehavioralKey(key: string): string {
  // Primeiro tenta tradução direta
  const directTranslation = profileTranslations[key as keyof typeof profileTranslations];
  if (directTranslation) return directTranslation;
  
  // Se não encontrar, tenta normalizar e traduzir
  const normalizedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const normalizedTranslation = profileTranslations[normalizedKey as keyof typeof profileTranslations];
  if (normalizedTranslation) return normalizedTranslation;
  
  // Se ainda não encontrar, retorna a chave normalizada
  return normalizedKey;
}