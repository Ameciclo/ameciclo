import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

// O maplibre-gl 6 não embute mais o worker: o bundler precisa servir o arquivo e dizer onde ele está.
// Os componentes de mapa importam este módulo para efeito colateral, antes de criar o mapa.
setWorkerUrl(workerUrl);
