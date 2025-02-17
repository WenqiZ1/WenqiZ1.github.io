mapboxgl.accessToken =
  "pk.eyJ1Ijoid2VucWl6IiwiYSI6ImNtNXdqNjRodTBibW0yaXNmampmamw4YW4ifQ.OJyicFr9txX6JXaUH9OzYQ";

let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/wenqiz/cm76l5vs1007501s67y9m1jph",
  center: [-125, 25],
  zoom: 1.5
});

let minMagnitude = 1.12; // 震级默认值
let maxDepth = 690.121; // 深度默认值

window.onload = function () {
  document.addEventListener("DOMContentLoaded", function () {
    let magnitudeSlider = document.getElementById("magnitude");
    let depthSlider = document.getElementById("depth");

    let magnitudeValue = document.getElementById("magnitude-value");
    let depthValue = document.getElementById("depth-value");

    // 设置初始值
    magnitudeValue.textContent = parseFloat(magnitudeSlider.value).toFixed(2);
    depthValue.textContent = parseFloat(depthSlider.value).toFixed(1);

    // 监听滑动条变化，更新 UI 并调用过滤函数
    magnitudeSlider.addEventListener("input", function () {
      magnitudeValue.textContent = parseFloat(this.value).toFixed(2); // 保留两位小数
      updateFilter();
    });

    depthSlider.addEventListener("input", function () {
      depthValue.textContent = parseFloat(this.value).toFixed(1); // 保留一位小数
      updateFilter();
    });

    // 重置按钮逻辑
    document
      .getElementById("reset-filter")
      .addEventListener("click", function () {
        magnitudeSlider.value = 1.12;
        depthSlider.value = 690.121;

        magnitudeValue.textContent = "1.12";
        depthValue.textContent = "690.121";

        updateFilter();
      });

    // 更新过滤函数
    function updateFilter() {
      console.log(
        "Filtering earthquakes: Magnitude ≥",
        magnitudeSlider.value,
        "Depth ≤",
        depthSlider.value
      );

      const layerId = "1-0xq6zb"; // 这里假设有一个图层 ID 为 "1-0xq6zb" (请根据你的实际图层名称修改)
      if (!map.getLayer(layerId)) {
        console.error(`图层 "${layerId}" 不存在!`);
        return;
      }

      // 使用新筛选条件
      const filterConditions = [
        [">=", ["to-number", ["get", "Mag"]], magnitudeSlider.value],
        ["<=", ["to-number", ["get", "Depth (km)"]], depthSlider.value]
      ];

      map.setFilter(layerId, ["all", ...filterConditions]);
    }
  });

  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }),
    "bottom-right"
  );

  let popup = null;

  // 创建一个 div 用于显示坐标（如果 HTML 没有这个元素，就动态创建）
  let coordinateBox = document.getElementById("coordinate-box");
  if (!coordinateBox) {
    coordinateBox = document.createElement("div");
    coordinateBox.id = "coordinate-box";
    document.body.appendChild(coordinateBox);
  }

  // 监听鼠标移动事件，更新坐标显示
  map.on("mousemove", function (e) {
    const lng = e.lngLat.lng.toFixed(5);
    const lat = e.lngLat.lat.toFixed(5);
    coordinateBox.innerHTML = `Lng: ${lng}, Lat: ${lat}`;
  });

  map.on("load", function () {
    const layerId = "1-0xq6zb"; // 假设地图图层 ID 是 "1-0xq6zb"
    if (!map.getLayer(layerId)) {
      console.error(`图层 "${layerId}" 不存在!`);
      return;
    }

    map.on("mouseenter", layerId, function (e) {
      const coordinates = e.lngLat;
      const properties = e.features[0].properties;
      const timestamp = properties["Time (UTC)"];
      const formattedTime = new Date(timestamp).toLocaleString();

      if (popup) popup.remove();

      popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(coordinates)
        .setHTML(
          `
          <h3>${properties.Place}</h3>
          <p><strong>Magnitude:</strong> ${properties.Mag}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Depth:</strong> ${properties["Depth (km)"]} km</p>
        `
        )
        .addTo(map);
    });

    map.on("mouseleave", layerId, function () {
      if (popup) popup.remove();
    });
  });

  // 控制搜索框
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    language: "en",
    placeholder: "Search for a place...",
    zoom: 3
  });

  map.addControl(geocoder, "top-right");

  document.getElementById("point-map-btn").addEventListener("click", () => {
    map.setStyle("mapbox://styles/wenqiz/cm76l5vs1007501s67y9m1jph"); // 点图
  });

  document.getElementById("heatmap-btn").addEventListener("click", () => {
    map.setStyle("mapbox://styles/wenqiz/cm76em8j8009301s6431z1ztw"); // 热力图
  });

  // 初始化筛选功能
  document.getElementById("magnitude").addEventListener("input", function () {
    minMagnitude = parseFloat(this.value);
    document.getElementById("magnitude-value").textContent = this.value;
    updateFilter();
  });

  document.getElementById("depth").addEventListener("input", function () {
    maxDepth = parseFloat(this.value);
    document.getElementById("depth-value").textContent = this.value;
    updateFilter();
  });

  function updateFilter() {
    const layerId = "1-0xq6zb"; // 图层 ID
    if (!map.getLayer(layerId)) {
      console.error(`图层 "${layerId}" 不存在!`);
      return;
    }

    const filterConditions = [
      [">=", ["to-number", ["get", "Mag"]], minMagnitude],
      ["<=", ["to-number", ["get", "Depth (km)"]], maxDepth]
    ];

    map.setFilter(layerId, ["all", ...filterConditions]);
  }

  // 重置筛选
  document
    .getElementById("reset-filter")
    .addEventListener("click", function () {
      document.getElementById("magnitude").value = 1.12;
      document.getElementById("depth").value = 690.121;
      document.getElementById("magnitude-value").textContent = "1.12";
      document.getElementById("depth-value").textContent = "690.121";
      updateFilter();
    });
};

// 语言切换函数
function switchLanguage(lang) {
  language = lang;

  let translations = {
    en: {
      mapTitle:
        "Global Earthquake Distribution Map (Jan 16, 2025 - Feb 15, 2025)",
      filterTitle: "Filter Earthquakes",
      magnitudeLabel: "Magnitude ≥",
      depthLabel: "Depth ≤",
      resetFilter: "Reset Filter",
      applyFilter: "Apply Filter",
      pointMap: "Point Map",
      heatmap: "Heatmap",
      startDate: "Start Date:",
      endDate: "End Date:",
      english: "English",
      placeholder: "Search for a place...",
      chinese: "中文"
    },
    zh: {
      mapTitle: "2025.01.16 - 2025.02.15 全球地震分布图",
      filterTitle: "筛选地震",
      magnitudeLabel: "震级 ≥",
      depthLabel: "深度 ≤",
      resetFilter: "重置筛选",
      applyFilter: "应用筛选",
      pointMap: "点图",
      heatmap: "热力图",
      startDate: "开始日期:",
      endDate: "结束日期:",
      english: "英语",
      placeholder: "搜索地点...",
      chinese: "中文"
    }
  };

  let t = translations[language];

  document.getElementById("map-title").textContent = t.mapTitle;
  document.querySelector("h3").textContent = t.filterTitle;
  document.querySelector("h3").textContent = t.filterTitle;
  // 更新搜索框 placeholder
  document.querySelector(".mapboxgl-ctrl-geocoder input").placeholder =
    t.placeholder;

  // 更新日期选择框的标签
  document.querySelector(
    "label[for='start-date']"
  ).innerHTML = `<i class="fas fa-calendar-alt"></i> ${t.startDate}`;
  document.querySelector(
    "label[for='end-date']"
  ).innerHTML = `<i class="fas fa-calendar-alt"></i> ${t.endDate}`;
  document.querySelector("label[for='magnitude']").innerHTML = `${
    t.magnitudeLabel
  } <span id="magnitude-value">${
    document.getElementById("magnitude").value
  }</span>`;
  document.querySelector("label[for='depth']").innerHTML = `${
    t.depthLabel
  } <span id="depth-value">${document.getElementById("depth").value}</span> km`;

  document.getElementById("reset-filter").textContent = t.resetFilter;
  document.getElementById("point-map-btn").textContent = t.pointMap;
  document.getElementById("heatmap-btn").textContent = t.heatmap;

  document.getElementById("language-en").textContent = t.english;
  document.getElementById("language-zh").textContent = t.chinese;
}

// 绑定语言切换按钮
document
  .getElementById("language-en")
  .addEventListener("click", () => switchLanguage("en"));
document
  .getElementById("language-zh")
  .addEventListener("click", () => switchLanguage("zh"));
