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

let osm = new TileLayerNormal({
  source: new OSM(),
  opacity: 0.7
});


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
hamburg.fit([4303100, 3365200, 4342700, 3403600], { size: map.getSize() })

$('#text0').data('view', new View({
  projection: 'EPSG:3035',
  center: view.getCenter(),
  zoom: view.getZoom()
}))
$('#text0').data('layer', [osm, bahn])

$('#text1').data('view', hamburg);
$('#text1').data('layer', [osm, erreichbarkeit])

$('#text2').data('view', bergedorf);
$('#text2').data('layer', [osm, erreichbarkeit])

$('#text3').data('view', bergedorf);
$('#text3').data('layer', [osm, einwohnerminuten])

$('#text4').data('view', reiherstieg);
$('#text4').data('layer', [osm, einwohnerminuten])

$('#text5').data('view', hamburg);
$('#text5').data('layer', [osm, einwohnerminuten, bahn])

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