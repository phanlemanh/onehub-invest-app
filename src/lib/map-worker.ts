// Turbopack prod thay import.meta.url bằng module id không phải http(s) →
// maplibre-gl v6 tự suy ra worker URL rỗng → "Worker failed to load", GeoJSON
// không được parse, mọi hit-testing (popup/click) chết.
//
// Fix: setWorkerUrl tới bản copy trong public/ (bundling-agnostic).
// LƯU Ý: nâng cấp maplibre-gl thì phải copy lại:
//   cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs public/
import { setWorkerUrl } from "maplibre-gl";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

export {};
