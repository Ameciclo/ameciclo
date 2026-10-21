import { IntlNumber, IntlNumberMax1Digit } from "~/services/utils";

export function getTotalCityStates(cities: any[]) {
  const stateCount: Record<string, number> = {};
  const states: string[] = [];

  cities.forEach((city) => {
    if (!stateCount[city.state]) {
      stateCount[city.state] = 1;
      states.push(city.state);
    } else {
      stateCount[city.state] += 1;
    }
  });

  return { states, count: states.length };
}

export function calculateIdecicloStatistics(cities: any[], structures: any[]) {
  // Trata erros de API como arrays vazios
  const validCities = cities?.apiError ? [] : cities;
  const validStructures = structures?.apiError ? [] : structures;

  const totalRoadLength = validCities.reduce(
    (acc, cur) => acc + (cur.reviews?.[0]?.city_network?.cycle_length?.road || 0),
    0
  );

  const totalStreetLength = validCities.reduce(
    (acc, cur) => acc + (cur.reviews?.[0]?.city_network?.cycle_length?.street || 0),
    0
  );

  const totalLocalLength = validCities.reduce(
    (acc, cur) => acc + (cur.reviews?.[0]?.city_network?.cycle_length?.local || 0),
    0
  );

  const totalExtension = (totalRoadLength + totalStreetLength + totalLocalLength) / 1000;

  return [
    { title: "Cidades avaliadas", value: validCities.length },
    { title: "Em quantos estados", value: getTotalCityStates(validCities).count },
    { title: "Extensão avaliada", value: IntlNumberMax1Digit(totalExtension), unit: "km" },
    { title: "Vias avaliadas", value: IntlNumber(validStructures.length) },
  ];
}
