import React, {useState, useMemo, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {scaleLinear, scaleThreshold} from 'd3-scale';
import ControlPanel from './ControlPanel';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";

import {csv} from 'd3-request';

// Source data GeoJSON
const DATA_URL = {
  ACCIDENTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/highway/accidents.csv',
  ROADS: './streets.json'
};

function getKey({state, type, id}) {
  return `${state}-${type}-${id}`;
}

export const COLOR_SCALE = scaleThreshold()
  .domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1])
  .range([
    [26, 152, 80],
    [102, 189, 99],
    [166, 217, 106],
    [217, 239, 139],
    [255, 255, 191],
    [254, 224, 139],
    [253, 174, 97],
    [244, 109, 67],
    [215, 48, 39],
    [168, 0, 0]
  ]);

const WIDTH_SCALE = scaleLinear().clamp(true).domain([0, 200]).range([10, 2000]);

const INITIAL_VIEW_STATE = {
  latitude: 37.755,
  longitude: -122.41,
  zoom: 12,
  minZoom: 4,
  maxZoom: 35
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

function aggregateAccidents(accidents) {
  const incidents = {};
  const fatalities = {};

  if (accidents) {
    accidents.forEach(a => {
      const r = (incidents[a.year] = incidents[a.year] || {});
      const f = (fatalities[a.year] = fatalities[a.year] || {});
      const key = getKey(a);
      r[key] = a.incidents;
      f[key] = a.fatalities;
    });
  }
  return {incidents, fatalities};
}

function renderTooltip({fatalities, incidents, year, hoverInfo}) {
  const {object, x, y} = hoverInfo;

  if (!object) {
    return null;
  }

  const props = object.properties;
  const key = getKey(props);
  const f = fatalities[year][key];
  const r = incidents[year][key];

  const content = r ? (
    <div>
      <b>{f}</b> people died in <b>{r}</b> crashes on{' '}
      {props.type === 'SR' ? props.state : props.type}-{props.id} in <b>{year}</b>
    </div>
  ) : (
    <div>
      no accidents recorded in <b>{year}</b>
    </div>
  );

  return (
    <div className="tooltip" style={{left: x, top: y}}>
      <big>
        {props.name} ({props.state})
      </big>
      {content}
    </div>
  );
}

export default function App({roads = DATA_URL.ROADS, accidents, mapStyle = MAP_STYLE}) {
  // console.log("accidents", accidents)
  // console.log("color scale", COLOR_SCALE)
  const year = 2000;
  const [hoverInfo, setHoverInfo] = useState({});
  const [startTime, setStartTime] = useState(dayjs('2022-04-17T15:30'));
  const [offset, setOffset] = useState(15);
  const [weekday, setWeekday] = useState("Monday")
  const {incidents, fatalities} = useMemo(() => aggregateAccidents(accidents), [accidents]);
  // console.log("incidents", incidents)

  const getLineColor = f => {
    // if (!fatalities[year]) {
    //   return [200, 200, 200];
    // }
    // const key = getKey(f.properties);
    // const fatalitiesPer1KMile = ((fatalities[year][key] || 0) / f.properties.length) * 1000;
    // return COLOR_SCALE(fatalitiesPer1KMile);
    return [200, 200, 200]
  };

  const getLineWidth = f => {
    // if (!incidents[year]) {
    //   return 10;
    // }
    // const key = getKey(f.properties);
    // const incidentsPer1KMile = ((incidents[year][key] || 0) / f.properties.length) * 1000;
    // return WIDTH_SCALE(incidentsPer1KMile);
    return 10;
  };

  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data: roads,
      stroked: false,
      filled: false,
      lineWidthMinPixels: 0.5,
      parameters: {
        depthTest: false
      },

      getLineColor,
      getLineWidth,

      pickable: true,
      onHover: setHoverInfo,

      updateTriggers: {
        getLineColor: {year},
        getLineWidth: {year}
      },

      transitions: {
        getLineColor: 1000,
        getLineWidth: 1000
      }
    })
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DeckGL
      layers={layers}
      pickingRadius={5}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />

      {renderTooltip({incidents, fatalities, year, hoverInfo})}
    </DeckGL>
    <ControlPanel weekday={weekday} 
    onWeekdayChange={setWeekday} 
    startTime={startTime}
    onStartTimeChange={setStartTime}
    offset={offset}
    onOffsetChange={setOffset}> 
    </ControlPanel>
    </LocalizationProvider>
  );
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);

  const formatRow = d => ({
    ...d,
    incidents: Number(d.incidents),
    fatalities: Number(d.fatalities)
  });

  csv(DATA_URL.ACCIDENTS, formatRow, (error, response) => {
    if (!error) {
      root.render(<App accidents={response}/>);
    }
  });
}
