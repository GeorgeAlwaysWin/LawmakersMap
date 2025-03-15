import { LOCATION, NAMES, BOUNDS } from "./variables";
import {
  COMMON_LOCATION_PARAMS,
  getBounds,
  getRandomPoints,
  getPoints,
  MARGIN,
} from "./common";
window.map = null;
main();
async function main() {
  // Waiting for all api elements to be loaded
  await ymaps3.ready;
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
    ymaps3;
  const { YMapClusterer, clusterByGrid } = await ymaps3.import(
    "@yandex/ymaps3-clusterer"
  );
  map = new YMap(
    document.getElementById("map"),
    { location: LOCATION, showScaleInCopyrights: true, margin: MARGIN },
    [
      // Add a map scheme layer
      new YMapDefaultSchemeLayer({}),
      // Add a layer of geo objects to display the markers
      new YMapDefaultFeaturesLayer({}),
    ]
  );
  window.names = NAMES;
  /* We declare the function for rendering ordinary markers, we will submit it to the clusterer settings.
    Note that the function must return any Entity element. In the example, this is YMapDefaultMarker. */
  const marker = (feature) => {
    const markerContainerElement = document.createElement("div");
    markerContainerElement.classList.add("marker-container");
    const markerText = document.createElement("div");
    markerText.id = feature.id;
    markerText.classList.add("marker-text", "hidden");
    markerText.innerText = window.names[feature.id];
    markerText.style.top = "-15px";
    markerText.style.position = "relative";
    markerContainerElement.onmouseover = () => {
      markerText.classList.replace("hidden", "visible");
    };
    markerContainerElement.onmouseout = () => {
      markerText.classList.replace("visible", "hidden");
    };
    // const markerElement = document.createElement("div");
    // markerElement.classList.add("marker");
    const markerImage = document.createElement("div");

    markerImage.classList.add("circle");
    markerImage.innerHTML = `
    <div class="circle-content">
        <span class="circle-text"></span>
    </div>
`;
    markerImage.onclick = () => {
          var request = new XMLHttpRequest();
        //   console.log(feature.code);
          request.open(
            "GET",
            "http://publication.pravo.gov.ru/documents/search?block=" +
            feature.block +
            "&org=" +
            feature.code +
            "&pageSize=200&periodType=weekly",
            true
          );
          request.onload = function () {
            let ans = request.status == 200
            ? request.responseText.replaceAll('href=\"/', 'target=\"_blank\" href=\"http://publication.pravo.gov.ru/').replaceAll('src=\"/', 'src=\"http://publication.pravo.gov.ru/')
            : "При запросе документов произошла ошибка";
            let iframeElement = document.getElementById("documents");
            iframeElement.contentWindow.document.open();
            iframeElement.contentWindow.document.write(ans);
            iframeElement.contentWindow.document.close();
          };
          request.send();
        }
    markerContainerElement.appendChild(markerImage);
    markerContainerElement.appendChild(markerText);
    // markerContainerElement.appendChild(markerElement);
    return new YMapMarker(
      {
        coordinates: feature.geometry.coordinates,
      },
      markerContainerElement
    );
  };
  // As for ordinary markers, we declare a cluster rendering function that also returns an Entity element.
  const cluster = (coordinates, features) =>
    new YMapMarker(
      {
        coordinates,
        onClick() {
          const bounds = getBounds(
            features.map((feature) => feature.geometry.coordinates)
          );
          map.update({ location: { bounds, ...COMMON_LOCATION_PARAMS } });
        },
      },
      circle(features.length).cloneNode(true)
    );

  function circle(count) {
    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.innerHTML = `
                  <div class="circle-content">
                      <span class="circle-text">${count}</span>
                  </div>
              `;
    return circle;
  }
  /* We create a clusterer object and add it to the map object.
    As parameters, we pass the clustering method, an array of features, the functions for rendering markers and clusters.
    For the clustering method, we will pass the size of the grid division in pixels. */
  const clusterer = new YMapClusterer({
    method: clusterByGrid({ gridSize: 64 }),
    features: [],
    marker,
    cluster,
  });
  window.clusterer = clusterer;
  map.addChild(clusterer);
  document.getElementById('update_map').onclick = () => {
    let lawmks = JSON.parse(document.getElementById("filter_div").getAttribute("unicorn:data"))['authorities'];
    window.names =  Object.keys(lawmks);
    window.attrs = Object.values(lawmks);
    // console.log(window.names);
    change_clusterer();
  };
}


async function change_clusterer() {
  let points = await getPoints();
  window.clusterer.update({ features: points });
}
