ymaps3.ready.then(() => {
  ymaps3.import.registerCdn("https://cdn.jsdelivr.net/npm/{package}", [
    "@yandex/ymaps3-clusterer@0.0",
  ]);
});
// Function for generating a pseudorandom number
const seed = (s) => () => {
  s = Math.sin(s) * 10000;
  return s - Math.floor(s);
};
const rnd = seed(10000); // () => Math.random()
// Generating random coordinates of a point [lng, lat] in a given boundary
const getRandomPointCoordinates = (bounds) => [
  bounds[0][0] + (bounds[1][0] - bounds[0][0]) * rnd(),
  bounds[1][1] + (bounds[0][1] - bounds[1][1]) * rnd(),
];

async function getPoint(name) {
  const httpApiUrl = "https://geocode-maps.yandex.ru/1.x";
  const queryString = new URLSearchParams({
    apikey: "e519bd9b-9dd5-405d-b96a-54fca8fd861d",
    geocode: name, //.replaceAll(" ", "+"),
    format: "json",
  }).toString();
  const fullUrl = `${httpApiUrl}?${queryString}`;

  // Проверяем, есть ли ответ в кэше
  const cache = await caches.open("geoobject-cache");
  const cachedResponse = await cache.match(fullUrl);
  let data;
  if (cachedResponse) {
    // Если ответ найден в кэше, возвращаем его
    data = await cachedResponse.json();
  } else {
    // Если ответ отсутствует в кэше, делаем запрос к серверу
    const response = await fetch(fullUrl);

    // Кэшируем полученный ответ для будущего использования
    await cache.put(fullUrl, response.clone());
    data = await response.json();
  }

  if (data.response) {
    const geoobject =
      data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
    if (geoobject) {
      const country =
        geoobject.metaDataProperty.GeocoderMetaData.Address.country_code;
      if (country != "RU") {
        return null;
      }
      let coords = geoobject.Point.pos;
      let coordsToInt = coords.split(" ").map(Number);
      coordsToInt[0] += rnd() / 100;
      return coordsToInt;
    } else {
      return null;
    }
  }
}

export const COMMON_LOCATION_PARAMS = { easing: "ease-in-out", duration: 2000 };
export function getBounds(coordinates) {
  let minLat = Infinity,
    minLng = Infinity;
  let maxLat = -Infinity,
    maxLng = -Infinity;
  for (const coords of coordinates) {
    const lat = coords[1];
    const lng = coords[0];
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
// A function that creates an array with parameters for each clusterer random point
export const getRandomPoints = (bounds) => {
  return Array.from({ length: 1 }, (_, index) => ({
    type: "Feature",
    id: 0,
    geometry: { type: "Point", coordinates: getRandomPointCoordinates(bounds) },
    properties: {
      name: "marker",
      description: "",
    },
  }));
};

export async function getPoints() {
  var arr = [];
  for (let i = 0; i < window.names.length; i++) {
    let coords = await getPoint(window.names[i]);
    console.log(coords);

    if ((coords != null) & (coords != undefined)) {
      arr.push([i, coords, window.attrs[i][0], window.attrs[i][1]]);
    }
  }
  return Array.from({ length: arr.length }, (_, index) => ({
    type: "Feature",
    id: arr[index][0],
    code: arr[index][2],
    block: arr[index][3],
    geometry: {
      type: "Point",
      coordinates: arr[index][1],
    },
    properties: {
      name: "marker",
      description: "",
    },
  }));
}

export const MARGIN = [100, 100, 100, 100];
