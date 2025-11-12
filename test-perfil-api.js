// Teste da API de Perfil de Ciclistas
// Usar coordenadas de pontos de contagem existentes

const { PERFIL_CICLO_BY_LOCATION } = require('./app/servers.js');

// Coordenadas do ponto "Av. Rui Barbosa x R. Amélia"
const lat = -8.0451100;
const lng = -34.9020700;

const testUrl = PERFIL_CICLO_BY_LOCATION(lat, lng);
console.log('URL de teste:', testUrl);

// Quando a API estiver disponível, deve retornar dados como:
const expectedResponse = {
  location: {
    lat: lat,
    lng: lng,
    name: "Av. Rui Barbosa x R. Amélia"
  },
  profile: {
    gender: {
      male: 70,
      female: 30
    },
    race: {
      white: 40,
      black: 20,
      brown: 35,
      yellow: 3,
      indigenous: 2
    },
    socioeconomic: {
      salary_range: "1-3 salários mínimos"
    },
    cycling_frequency: {
      "1_day": 10,
      "2_days": 15,
      "3_days": 20,
      "4_days": 15,
      "5_days": 25,
      "6_days": 10,
      "7_days": 5
    }
  }
};

console.log('Resposta esperada:', JSON.stringify(expectedResponse, null, 2));