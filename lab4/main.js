const BRTA_ATTRIBUTION =
  'Kaartgegevens: © <a href="http://www.cbs.nl">CBS</a>, <a href="http://www.kadaster.nl">Kadaster</a>, <a href="http://openstreetmap.org">OpenStreetMap</a><span class="printhide">-auteurs (<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>).</span>';

// a function for obtaining a layer object, which can be added to the map
function getWMTSLayer(layername, attribution) {
  return L.tileLayer(
    `https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/${layername}/EPSG:28992/{z}/{x}/{y}.png`,
    {
      WMTS: false,
      attribution: attribution,
      crossOrigin: true,
    }
  );
}

// 1. BRT-backdrop map variants from PDOK:
const brtRegular = getWMTSLayer("standaard", BRTA_ATTRIBUTION);
const brtGrijs = getWMTSLayer("grijs", BRTA_ATTRIBUTION);
const brtPastel = getWMTSLayer("pastel", BRTA_ATTRIBUTION);
const brtWater = getWMTSLayer("water", BRTA_ATTRIBUTION);

// see "Nederlandse richtlijn tiling" https://www.geonovum.nl/uploads/standards/downloads/nederlandse_richtlijn_tiling_-_versie_1.1.pdf
// Resolution (in pixels per meter) for each zoomlevel
var res = [
  3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72,
  3.36, 1.68, 0.84, 0.42,
];

// The map object - Javascript object that represents the zoomable map component
// Projection parameters for RD projection (EPSG:28992):
var map = L.map("map-canvas", {
  continuousWorld: true,
  crs: new L.Proj.CRS(
    "EPSG:28992",
    "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs",
    {
      transformation: L.Transformation(-1, -1, 0, 0),
      resolutions: res,
      origin: [-285401.92, 903401.92],
      bounds: L.bounds([-285401.92, 903401.92], [595401.92, 22598.08]),
    }
  ),
  layers: [brtRegular],
  center: [52.0047529, 4.3702697],
  zoom: 10,
});

// 2. aerial photo * not working at this moment (see Assignment)
//    - can be switched on/off by toggle thru L.control.layers (see below in this script)
var wms_aerial_url = "https://geodata1.nationaalgeoregister.nl/luchtfoto/wms?";
var basemap_aerial = new L.tileLayer.wms(wms_aerial_url, {
  layers: ["luchtfoto_png"],
  styles: "",
  format: "image/png",
  transparent: true,
  pointerCursor: true,
});
basemap_aerial.getAttribution = function () {
  return 'Luchtfoto WMS <a href="https://www.kadaster.nl">Kadaster</a>.';
};

// 3. a thematic WMS as overlay map
var wms_sound_url = "https://data.rivm.nl/geo/alo/wms?";
var sound = new L.tileLayer.wms(wms_sound_url, {
  layers: ["vw_rivm_r96_20170912_lg_rijksweg2016lden"],
  styles: "",
  format: "image/png",
  transparent: true,
  attribution:
    '© <a href="https://www.nationaalgeoregister.nl/geonetwork/srv/dut/catalog.search#/metadata/cb1ac266-b9e7-4adf-a2a2-d04f5d1f1d2c?tab=general"> Rijkswaterstaat</a>',
  pointerCursor: true,
});

var overlays = {
  "Road noise [WMS]": sound,
};

var baseLayers = {
  "BRT-Achtergrondkaart [WMTS]": brtRegular,
  "BRT-Achtergrondkaart Grijs [WMTS]": brtGrijs,
  "BRT-Achtergrondkaart Pastel [WMTS]": brtPastel,
  "BRT-Achtergrondkaart Water [WMTS]": brtWater,
  "Aerial photo [WMS]": basemap_aerial,
};

L.control.layers(baseLayers, overlays).addTo(map);
