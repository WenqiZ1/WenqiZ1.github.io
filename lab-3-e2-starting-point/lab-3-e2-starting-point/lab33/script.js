// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1Ijoid2VucWl6IiwiYSI6ImNtNXdqNjRodTBibW0yaXNmampmamw4YW4ifQ.OJyicFr9txX6JXaUH9OzYQ";

const style_2022 = "mapbox://styles/wenqiz/cm6gjfl7o004m01s9hgcfbj5s";
const style_2024 = "mapbox://styles/wenqiz/cm6gjm5ig00e101s27qhb2ouf";

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: style_2022,
  center: [-0.089932, 51.514441],
  zoom: 14
});

const layerList = document.getElementById("menu");
const inputs = layerList.getElementsByTagName("input");
//On click the radio button, toggle the style of the map.
for (const input of inputs) {
  input.onclick = (layer) => {
    if (layer.target.id == "style_2022") {
      map.setStyle(style_2022);
    }
    if (layer.target.id == "style_2024") {
      map.setStyle(style_2024);
    }
  };
}