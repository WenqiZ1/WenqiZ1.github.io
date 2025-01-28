// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1Ijoid2VucWl6IiwiYSI6ImNtNXdqNjRodTBibW0yaXNmampmamw4YW4ifQ.OJyicFr9txX6JXaUH9OzYQ";

//Before map
const beforeMap = new mapboxgl.Map({
  container: "before",
  style: "mapbox://styles/wenqiz/cm6gjfl7o004m01s9hgcfbj5s",
  center: [-0.089932, 51.514441],
  zoom: 14
});

//After map
const afterMap = new mapboxgl.Map({
  container: "after",
  style: "mapbox://styles/wenqiz/cm6gjm5ig00e101s27qhb2ouf",
  center: [-0.089932, 51.514441],
  zoom: 14
});

const container = "#comparison-container";
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {});
