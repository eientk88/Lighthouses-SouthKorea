# Lighthouses of South Korea

An interactive web map showing lighthouses in South Korea using a watercolor basemap and an artistic lighthouse symbol. The map is designed as a hybrid of **classification and aesthetics**: lighthouses are styled by century built (when available), while the interface uses an “old nautical chart” theme.

## Live Site:
https://eientk88.github.io/Lighthouses-SouthKorea/

## Features
- **Leaflet** interactive map (pan/zoom)
- **Stamen Watercolor** basemap (via Stadia Maps)
- **Mini map** (overview inset)
- **Custom animated lighthouse markers** (light “blink” effect)
- **Popups** with lighthouse details (name, area, built year when available, and image link if present)
- **Place labels** for major cities to provide geographic context
- TODALS elements: Title/Author/Date/Source, Orientation (north arrow), Scale, Legend

## Data
Lighthouse locations and attributes come from **Wikidata** (queried via the Wikidata Query Service / WDQS) and exported to GeoJSON:
- `data/lighthouses_SouthKorea.geojson`

Note: some features may have missing `inception` (built year).

## Tech Stack
- HTML / CSS / JavaScript
- [Leaflet](https://leafletjs.com/)
- [Leaflet MiniMap](https://github.com/Norkart/Leaflet-MiniMap)
- Stamen Watercolor tiles (served by Stadia Maps)

## Author
Athanasios Karageorgos 
February 2026
