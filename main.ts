import './style.css';
import { Collection, Map, View } from 'ol';
import { Tile as TileLayerNormal } from 'ol/layer';
import TileLayer from 'ol/layer/WebGLTile';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import "./import_jquery.js";
import GeoTIFF from 'ol/source/GeoTIFF';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import BaseLayer from 'ol/layer/Base';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import RenderEvent from 'ol/render/Event';


proj4.defs("EPSG:3035", "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

let erreichbarkeit = new TileLayer({
  style: {
    color: ['interpolate', ['linear'], ['band', 1], 1, [0, 0, 0], 0.15, [0, 150, 0], 0.0001, [0, 255, 0], 0, [0, 0, 0, 0]],
  },
  source:
    new GeoTIFF({
      //convertToRGB: false,
      sources: [{
        url: './img/erreichbarkeit2021.tif',
        overviews: [`./img/erreichbarkeit2021.tif.ovr`],

        //min: 0,
        max: 13040,
        nodata: -999,
      }]


    })
});

let einwohnerminuten = new TileLayer({
  style: {
    color: ['interpolate', ['linear'], ['band', 1], 1, [0, 0, 0], 0.15, [0, 150, 0], 0.0001, [0, 255, 0], 0, [0, 0, 0, 0]],
  },
  source:
    new GeoTIFF({
      //convertToRGB: false,
      sources: [{
        url: './img/einwohnerminuten.tif',
        overviews: [`./img/einwohnerminuten.tif.ovr`],

        //min: 0,
        max: 60,
        nodata: -999,
      }]


    })
})

let einwohnerminuten2035 = new TileLayer({
  style: {
    color: ['interpolate', ['linear'], ['band', 1], 1, [0, 0, 0], 0.15, [0, 150, 0], 0.0001, [0, 255, 0], 0, [0, 0, 0, 0]],
  },
  source:
    new GeoTIFF({
      //convertToRGB: false,
      sources: [{
        url: './img/einwohnerminuten2035.tif',
        overviews: [`./img/einwohnerminuten2035.tif.ovr`],

        //min: 0,
        max: 60,
        nodata: -999,
      }]


    })
})

let erreichbarkeitDiff = new TileLayer({
  style: {
    color: ['interpolate', ['linear'], ['band', 1], 1, [0, 0, 0], 0.65, [0, 150, 0], 0.51, [0, 255, 0], 0.50999, [0, 0, 0, 0], 0.5, [0, 0, 0, 0], 0.49001, [0, 0, 0, 0], 0.49, [255, 0, 0], 0.35, [0, 0, 0], 0, [0, 0, 0]],
  },
  source:
    new GeoTIFF({
      //convertToRGB: false,
      sources: [{
        url: './img/ew_diff.tif',
        overviews: [`./img/ew_diff.tif.ovr`],

        min: -2900,
        max: 2900,
        nodata: 0,
      }]


    })
})

let einwohnerMinDiff = new TileLayer({
  style: {
    color: ['interpolate', ['linear'], ['band', 1], 0, [0, 255, 0], 0.75, [0, 0, 0, 0], 1, [255, 0, 0]],
  },
  source:
    new GeoTIFF({
      //convertToRGB: false,
      sources: [{
        url: './img/ewm_diff.tif',
        overviews: [`./img/ewm_diff.tif.ovr`],

        min: -15,
        max: 5,
        nodata: 0,
      }]


    })
})

let osm = new TileLayerNormal({
  source: new OSM(),
  opacity: 0.7
});

// https://medium.com/@xavierpenya/openlayers-3-osm-map-in-grayscale-5ced3a3ed942
// function applies greyscale to every pixel in canvas

function greyscale(context: CanvasRenderingContext2D) {
  var canvas = context.canvas;
  var width = canvas.width;
  var height = canvas.height;
  var imageData = context.getImageData(0, 0, width, height);
  var data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    // CIE luminance for the RGB
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Show white color instead of black color while loading new tiles:
    if (v === 0.0)
      v = 255.0;
    data[i + 0] = v; // Red
    data[i + 1] = v; // Green
    data[i + 2] = v; // Blue
    data[i + 3] = 255; // Alpha
  }
  context.putImageData(imageData, 0, 0);
}

osm.on('postrender', (event: RenderEvent) => { greyscale(event.context) })


let bahn = new VectorLayer({
  source: new VectorSource({
    url: './img/bahn.geojson',
    format: new GeoJSON(),
  }),
  style: (feature) => {
    let color = '#000000'
    switch (feature.get('shortkategorie')) {
      case 'A':
        color = '#f78800'
        break
      case 'S':
        color = '#ff0000'
        break;
      case 'U':
        color = '#0000ff'
        break;
      default:
        color = '#000000'
    }

    return new Style({
      stroke: new Stroke({
        color: color,
        width: 4,
      })
    })
  },
});



let neubau = new VectorLayer({
  source: new VectorSource({
    url: './img/neubau.geojson',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: '#ff0000',
      width: 2,
    })
  })
});


const map = new Map({
  target: 'map',
  layers: [
    osm,
    bahn
  ],
  view: new View({
    projection: 'EPSG:3035',
    center: transform([10.0, 53.54], 'EPSG:4326', 'EPSG:3035'),
    zoom: 11
  }),
  controls: [],
  interactions: []
});

let view = map.getView();

view.fit([4303100, 3365200, 4342700, 3403600])



let karten: { [id: number]: { view?: View, layer?: BaseLayer[] | Collection<BaseLayer> } } = {}

$(() => {
  console.log($("#text2").offset().top)
  $('.text').each((t, e) => {
    karten[$(e).offset().top] = {}
    karten[$(e).offset().top].view = $(e).data('view')
    karten[$(e).offset().top].layer = $(e).data('layer')
  })
  console.log(karten)
});

$(document).on('scroll', (e) => {
  //var limit = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) - window.innerHeight;

  let scroll = document.documentElement.scrollTop // limit;

  let last = ''
  for (const [key, value] of Object.entries(karten)) {
    if (last == '') last = key

    if (parseFloat(key) > scroll) {
      let part = (scroll - parseFloat(last)) / (parseFloat(key) - parseFloat(last))
      if (isNaN(part) || part < 0) part = 0
      if (part > 1) part = 1
      console.log(part)
      animate(karten[last].view, value.view, part)
      if (part > 0.5)
        map.setLayers(value.layer)
      else
        map.setLayers(karten[last].layer)
      break;
    }
    last = key;
  }



})



let bergedorf = new View({
  projection: 'EPSG:3035'
});
bergedorf.fit([4320038.248951906, 3364729.9658098426, 4344384.835278358, 3376001.53355357], { size: map.getSize() })

let reiherstieg = new View({
  projection: 'EPSG:3035'
});
reiherstieg.fit([4316851.192003815, 3376881.628141567, 4324285.537971712, 3380323.4549785564], { size: map.getSize() })

let hamburg = new View({
  projection: 'EPSG:3035'
});
hamburg.fit([4303100, 3365200, 4342700, 3403600], { size: map.getSize() });


let finkenwerder = new View({
  projection: 'EPSG:3035'
});
finkenwerder.fit([4309457, 3378692, 4314588, 3382523], { size: map.getSize() });

let s4 = new View({
  projection: 'EPSG:3035'
});
s4.fit([4324476.8688, 3382098.0807, 4334487.6251, 3389781.3361], { size: map.getSize() });

$('#text0').data('view', new View({
  projection: 'EPSG:3035',
  center: view.getCenter(),
  zoom: view.getZoom()
}))
$('#text0').data('layer', [osm, bahn])

$('#text1').data('view', hamburg)
$('#text1').data('layer', [osm, bahn])

$('#text2').data('view', hamburg);
$('#text2').data('layer', [osm, erreichbarkeit])

$('#text3').data('view', bergedorf);
$('#text3').data('layer', [osm, erreichbarkeit])

$('#text4').data('view', bergedorf);
$('#text4').data('layer', [osm, einwohnerminuten])

$('#text5').data('view', reiherstieg);
$('#text5').data('layer', [osm, einwohnerminuten])

$('#text6').data('view', finkenwerder);
$('#text6').data('layer', [osm, einwohnerminuten])

$('#text7').data('view', hamburg);
$('#text7').data('layer', [osm, einwohnerminuten])

$('#text8').data('view', hamburg);
$('#text8').data('layer', [osm, einwohnerminuten2035])

$('#text9').data('view', hamburg);
$('#text9').data('layer', [osm, einwohnerminuten2035, neubau])

$('#text10').data('view', hamburg);
$('#text10').data('layer', [osm, einwohnerMinDiff])

$('#text11').data('view', s4);
$('#text11').data('layer', [osm, einwohnerMinDiff])

function animate(from: View, to: View, percentage: number) {
  //console.log(percentage)
  let oldZoom = from.getZoom();
  let newZoom = to.getZoom();

  let interpolateZoom = function (oz: number, nz: number, pc: number) {
    console.log(pc)
    let z = oz + (nz - oz) * pc
    console.log(oz, nz, z);
    return z
  }

  let oldCenter = from.getCenter();
  let newCenter = to.getCenter();

  let interpolateCenter = function (oc: number[], nc: number[], pc: number) {
    let p: number[] = [];
    p[0] = oc[0] + (nc[0] - oc[0]) * pc;
    p[1] = oc[1] + (nc[1] - oc[1]) * pc;
    console.log(oc, nc, p);
    return p
  }

  if (oldZoom < newZoom) {
    if (percentage < 0.5) {
      view.setCenter(interpolateCenter(oldCenter, newCenter, percentage * 2.));
    } else {
      view.setZoom(interpolateZoom(oldZoom, newZoom, (percentage - 0.49) * 2.));
    }
  } else if (oldZoom > newZoom) {
    if (percentage < 0.5) {
      view.setZoom(interpolateZoom(oldZoom, newZoom, percentage * 2.));
    } else {
      view.setCenter(interpolateCenter(oldCenter, newCenter, (percentage - 0.49) * 2.));
    }
  } else {
    view.setCenter(interpolateCenter(oldCenter, newCenter, percentage));
  }
}




map.on('moveend', () => { $("#extent").html(view.calculateExtent().join(',')) })