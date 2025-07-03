mapboxgl.accessToken = 'pk.eyJ1Ijoid2VucWl6IiwiYSI6ImNtNXdqNjRodTBibW0yaXNmampmamw4YW4ifQ.OJyicFr9txX6JXaUH9OzYQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/wenqiz/cmcghjml7051e01s5bte83vm3',
  center: [-4.289, 55.873],
  zoom: 15
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'bottom-right');

const landmarks = [
  { name: "University Main Building", coord: [-4.28958, 55.87316] },
  { name: "Library", coord: [-4.28898, 55.87320] },
  { name: "Molema Building", coord: [-4.29120, 55.87282] },
  { name: "Hunterian Museum", coord: [-4.29090, 55.87210] },
  { name: "James McCune Smith Learning Hub", coord: [-4.28746, 55.87149] },
  { name: "Fraser Building", coord: [-4.28901, 55.87086] },
  { name: "Kelvin Building", coord: [-4.28827, 55.87183] },
  { name: "Bower Building", coord: [-4.29011, 55.87162] },
  { name: "Advanced Research Building", coord: [-4.29128, 55.87124] },
  { name: "Anderson College", coord: [-4.29225, 55.87079] },
  { name: "McMillan Reading Room", coord: [-4.28878, 55.87345] }
];

function setupAutocomplete(inputElement, isStart) {
  const dropdown = document.createElement('div');
  dropdown.className = 'autocomplete-items';
  inputElement.parentNode.appendChild(dropdown);

  inputElement.addEventListener('input', async function () {
    const value = this.value.trim().toLowerCase();
    dropdown.innerHTML = '';
    if (!value) return;

    const matches = landmarks.filter(l => l.name.toLowerCase().includes(value));

    if (matches.length > 0) {
      matches.forEach(match => {
        const item = document.createElement('div');
        item.textContent = match.name;
        item.addEventListener('click', () => {
          inputElement.value = match.name;
          dropdown.innerHTML = '';
          const coord = match.coord;
          if (isStart) {
            startCoord = coord;
            if (startMarker) startMarker.remove();
            startMarker = addMarker(coord, '#3bb2d0');
          } else {
            endCoord = coord;
            if (endMarker) endMarker.remove();
            endMarker = addMarker(coord, '#f30');
          }
        });
        dropdown.appendChild(item);
      });
    } else {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${mapboxgl.accessToken}&limit=1&bbox=-4.35,55.83,-4.20,55.90`);
      const result = await response.json();
      if (result.features.length > 0) {
        const coord = result.features[0].geometry.coordinates;
        const name = result.features[0].place_name;
        const item = document.createElement('div');
        item.textContent = name;
        item.addEventListener('click', () => {
          inputElement.value = name;
          dropdown.innerHTML = '';
          if (isStart) {
            startCoord = coord;
            if (startMarker) startMarker.remove();
            startMarker = addMarker(coord, '#3bb2d0');
          } else {
            endCoord = coord;
            if (endMarker) endMarker.remove();
            endMarker = addMarker(coord, '#f30');
          }
        });
        dropdown.appendChild(item);
      }
    }
  });
}

let startCoord = null, endCoord = null;
let startMarker = null, endMarker = null;

function addMarker(coord, color) {
  return new mapboxgl.Marker({ color }).setLngLat(coord).addTo(map);
}

async function drawRoute(start, end) {
  const modePort = document.getElementById('mode').value;
  const url = `http://localhost:${modePort}/route/v1/foot/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      alert("No route found.");
      return;
    }

    const route = data.routes[0].geometry;

    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }

    map.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: route }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#1da1f2', 'line-width': 6 }
    });

    const bounds = new mapboxgl.LngLatBounds();
    route.coordinates.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: 50 });

    const distance = (data.routes[0].distance / 1000).toFixed(2);
    const duration = Math.round(data.routes[0].duration / 60);
    document.getElementById('info').textContent = `Distance: ${distance} km | Duration: ${duration} min`;
  } catch (err) {
    alert("Failed to fetch route. Check if the selected OSRM service is running.");
    console.error(err);
  }
}

// 自动补全输入绑定
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
setupAutocomplete(startInput, true);
setupAutocomplete(endInput, false);

// 按钮绑定
document.getElementById('routeBtn').addEventListener('click', () => {
  if (startCoord && endCoord) {
    drawRoute(startCoord, endCoord);
  } else {
    alert("Please select both start and end locations.");
  }
});
