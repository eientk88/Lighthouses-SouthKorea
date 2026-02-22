// Full-country South Korea view
const map = L.map("map", { zoomControl: false }).setView([36.35, 127.85], 7);
L.control.zoom({ position: "topright" }).addTo(map);

// Scale bar (TODALS: Scale)
L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);

// Stamen Watercolor via Stadia Maps (raster)
const watercolor = L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg", {
  maxZoom: 16,
  className: "watercolor-tiles",
  attribution:
    '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a> ' +
    '&copy; <a href="https://stamen.com/" target="_blank" rel="noopener">Stamen Design</a> ' +
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
}).addTo(map);

// MiniMap inset (reliable)
const miniMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
});
new L.Control.MiniMap(miniMapLayer, {
  toggleDisplay: true,
  minimized: false,
  position: "bottomright"
}).addTo(map);

// ----- Classification helpers -----
function extractYear(value) {
  if (!value) return null;
  const m = String(value).match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

// Hybrid classification (kept simple for watercolor)
function bucket(year) {
  if (!year) return "Unknown";
  if (year < 1900) return "Before 1900";
  if (year < 2000) return "1900s";
  return "2000s+";
}

const palette = {
  "Before 1900": { fill: "#7a4e2d", stroke: "#3a2414" }, // sepia ink
  "1900s":       { fill: "#2f5d7c", stroke: "#102a43" }, // navy
  "2000s+":      { fill: "#2d6a4f", stroke: "#0b3d2e" }, // deep green
  "Unknown":     { fill: "#6b7280", stroke: "#111827" }  // gray
};

// gentle zoom scaling
function sizeForZoom(z, base = 26) {
  const s = base + (z - 7) * 1.1;
  return Math.max(20, Math.min(40, s));
}

// deterministic “random-ish” delay from lat/lng (so lights don’t blink in sync)
function delayFromCoords(lat, lng) {
  const n = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453);
  return (n % 2.2).toFixed(2) + "s";
}

// Artistic lighthouse SVG with animated rays + pulse
function lighthouseSVG(colors, size, isHover, delay) {
  const cls = isHover ? "lh-icon hover" : "lh-icon";
  const strokeW = 2;

  return `
  <div class="lh-wrap" style="--d:${delay}">
    <svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- pulsing glow -->
      <circle class="pulse" cx="32" cy="18" r="14" fill="rgba(255,255,255,0.65)" />

      <!-- rays -->
      <path class="ray" d="M10 22 L20 26" stroke="rgba(255,255,255,0.95)" stroke-width="3" stroke-linecap="round"/>
      <path class="ray" d="M54 22 L44 26" stroke="rgba(255,255,255,0.95)" stroke-width="3" stroke-linecap="round"/>
      <path class="ray" d="M8 30 L20 30"  stroke="rgba(255,255,255,0.70)" stroke-width="3" stroke-linecap="round"/>
      <path class="ray" d="M56 30 L44 30" stroke="rgba(255,255,255,0.70)" stroke-width="3" stroke-linecap="round"/>

      <!-- tower -->
      <path d="M28 10 h8 l2 10 h-12 z" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="${strokeW}" />
      <path d="M24 20 h16 l-4 34 h-8 z" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="${strokeW}" />
      <path d="M20 54 h24" stroke="${colors.stroke}" stroke-width="3" stroke-linecap="round" />

      <!-- windows -->
      <rect x="30" y="28" width="4" height="6" fill="rgba(253,246,227,0.95)"/>
      <rect x="30" y="40" width="4" height="6" fill="rgba(253,246,227,0.95)"/>

      <!-- cap -->
      <path d="M24 10 L32 6 L40 10" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="${strokeW}" />
    </svg>
  </div>`;
}

function iconFor(bucketName, zoom, hover, delay) {
  const colors = palette[bucketName] || palette["Unknown"];
  const size = sizeForZoom(zoom) + (hover ? 5 : 0);

  return L.divIcon({
    className: "",
    html: lighthouseSVG(colors, size, hover, delay),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
}

function popupHTML(props) {
  const name = props.lighthouseLabel || "Unnamed lighthouse";
  const admin = props.adminLabel || null;
  const year = extractYear(props.inception);
  const b = bucket(year);
  const image = props.image || null;

  let html = `<div class="popup-card">
    <div class="popup-title">${name}</div>`;

  if (admin) html += `<div class="popup-row"><b>Area:</b> ${admin}</div>`;
  html += year
    ? `<div class="popup-row"><b>Built:</b> ${year} (${b})</div>`
    : `<div class="popup-row"><b>Built:</b> Unknown</div>`;

  if (image) html += `<div class="popup-link"><a href="${image}" target="_blank" rel="noopener">View image</a></div>`;
  html += `</div>`;
  return html;
}

// ----- Add labeled key places (for proximity context) -----
const places = [
  { name: "Seoul", lat: 37.5665, lng: 126.9780 },
  { name: "Incheon", lat: 37.4563, lng: 126.7052 },
  { name: "Suwon", lat: 37.2636, lng: 127.0286 },
  { name: "Daejeon", lat: 36.3504, lng: 127.3845 },
  { name: "Daegu", lat: 35.8722, lng: 128.6025 },
  { name: "Gwangju", lat: 35.1595, lng: 126.8526 },
  { name: "Busan", lat: 35.1796, lng: 129.0756 },
  { name: "Ulsan", lat: 35.5384, lng: 129.3114 },
  { name: "Pohang", lat: 36.0190, lng: 129.3435 },
  { name: "Jeonju", lat: 35.8242, lng: 127.1480 },
  { name: "Jeju", lat: 33.4996, lng: 126.5312 },
  { name: "Sokcho", lat: 38.2070, lng: 128.5918 },
  { name: "Mokpo", lat: 34.8118, lng: 126.3922 }
];

const placeLayer = L.layerGroup().addTo(map);

function addPlaceLabels() {
  placeLayer.clearLayers();
  const z = map.getZoom();

  // Show fewer labels when zoomed out
  const showAll = z >= 7;
  const showMinor = z >= 8;

  places.forEach(p => {
    const isMajor = ["Seoul", "Busan", "Jeju", "Daegu", "Gwangju", "Daejeon", "Incheon"].includes(p.name);
    if (!showAll && !isMajor) return;
    if (!showMinor && !isMajor) return;

    const icon = L.divIcon({
      className: "place-label",
      html: p.name,
      iconSize: [1, 1]
    });

    L.marker([p.lat, p.lng], { icon, interactive: false }).addTo(placeLayer);
  });
}
addPlaceLabels();
map.on("zoomend", addPlaceLabels);

// ----- Load GeoJSON of lighthouses -----
const markers = [];

fetch("data/lighthouses_SouthKorea.geojson")
  .then(r => {
    if (!r.ok) throw new Error(`GeoJSON load failed: ${r.status} ${r.statusText}`);
    return r.json();
  })
  .then(data => {
    const z = map.getZoom();
    const bounds = [];

    (data.features || []).forEach(f => {
      if (!f.geometry || f.geometry.type !== "Point") return;

      const [lng, lat] = f.geometry.coordinates;
      const props = f.properties || {};
      const y = extractYear(props.inception);
      const b = bucket(y);
      const delay = delayFromCoords(lat, lng);

      const m = L.marker([lat, lng], {
        icon: iconFor(b, z, false, delay),
        keyboard: false
      }).addTo(map);

      m._bucket = b;
      m._hover = false;
      m._delay = delay;

      m.bindPopup(popupHTML(props));
      m.on("mouseover", () => { m._hover = true;  m.setIcon(iconFor(m._bucket, map.getZoom(), true, m._delay)); });
      m.on("mouseout",  () => { m._hover = false; m.setIcon(iconFor(m._bucket, map.getZoom(), false, m._delay)); });

      markers.push(m);
      bounds.push([lat, lng]);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });

    // ensure compass has extra ornament layers
    const compass = document.querySelector(".compass-svg");
    if (compass && !compass.querySelector("span")) {
      const ring = document.createElement("span");
      const star = document.createElement("i");
      compass.appendChild(ring);
      compass.appendChild(star);
    }
  })
  .catch(err => console.error(err));

// Rescale icons when zoom changes
map.on("zoomend", () => {
  const z = map.getZoom();
  markers.forEach(m => m.setIcon(iconFor(m._bucket, z, m._hover, m._delay)));
});