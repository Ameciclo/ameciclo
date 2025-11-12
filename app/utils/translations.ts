// Traduções para os dados de perfil
export const profileTranslations = {
  // Chaves dos campos
  'years using': 'Tempo de uso',
  'biggest need': 'Maior necessidade',
  'motivation to start': 'Motivação para começar',
  'motivation to continue': 'Motivação para continuar',
  'years_using': 'Tempo de uso',
  'biggest_need': 'Maior necessidade',
  'motivation_to_start': 'Motivação para começar',
  'motivation_to_continue': 'Motivação para continuar',
  
  // Valores das respostas - tempo de uso
  'mais de 5 anos': 'Mais de 5 anos',
  'entre 2 e 5 anos': 'Entre 2 e 5 anos',
  'entre 1 e 2 anos': 'Entre 1 e 2 anos',
  'entre 6 meses e 1 ano': 'Entre 6 meses e 1 ano',
  'menos de 6 meses': 'Menos de 6 meses',
  
  // Valores das respostas - motivações e necessidades
  'É mais rápido e prático': 'É mais rápido e prático',
  'É mais saudável': 'É mais saudável',
  'É mais barato': 'É mais barato',
  'É ambientalmente correto': 'É ambientalmente correto',
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

// Função específica para traduzir chaves de características comportamentais
export function translateBehavioralKey(key: string): string {
  return profileTranslations[key as keyof typeof profileTranslations] || 
         key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}