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
const DATA_PATH = {
  PROBS:
    './probs_with_offset.csv',
  ROADS: './streets.json'
};

function getKey({days, streets, }) {
  return `${state}-${type}-${id}`;
}

export const COLOR_SCALE = scaleThreshold()
  .domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1])
  .range([
    [255, 255, 0],     // Yellow
    [255, 204, 0],     // Yellow-Orange
    [255, 153, 0],     // Orange
    [255, 102, 0],     // Orange-Red
    [255, 51, 0],      // Red-Orange
    [255, 0, 0],       // Red
    [204, 0, 0],       // Dark Red
    [153, 0, 0],       // Maroon
    [102, 0, 0],       // Dark Maroon
    [51, 0, 0]         // Deep Maroon
  ]);

const WIDTH_SCALE = scaleLinear().clamp(true).domain([0, 1]).range([5, 30]);

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
  return null;
  // const {object, x, y} = hoverInfo;

  // if (!object) {
  //   return null;
  // }

  // const props = object.properties;
  // const key = getKey(props);
  // const f = fatalities[year][key];
  // const r = incidents[year][key];

  // const content = r ? (
  //   <div>
  //     <b>{f}</b> people died in <b>{r}</b> crashes on{' '}
  //     {props.type === 'SR' ? props.state : props.type}-{props.id} in <b>{year}</b>
  //   </div>
  // ) : (
  //   <div>
  //     no accidents recorded in <b>{year}</b>
  //   </div>
  // );

  // return (
  //   <div className="tooltip" style={{left: x, top: y}}>
  //     <big>
  //       {props.name} ({props.state})
  //     </big>
  //     {content}
  //   </div>
  // );
}

function filteredProbsToDict(filteredProbs) {
  const probsDict = {}
  if (filteredProbs) {
    filteredProbs.forEach(
      p => {
        probsDict[p.streets] = p.prob
      }
    );
  }

  return probsDict;
}

export default function App({roads = DATA_PATH.ROADS, probs, mapStyle = MAP_STYLE}) {
  // console.log("color scale", COLOR_SCALE)
  const [hoverInfo, setHoverInfo] = useState({});
  const [startTime, setStartTime] = useState(dayjs('2022-04-17T15:30'));
  const startTimeString = startTime.format("HH:mm:00");

  const [offset, setOffset] = useState(15);
  const [weekday, setWeekday] = useState("Monday")
  // const {incidents, fatalities} = useMemo(() => aggregateAccidents(accidents), [accidents]);
  // console.log("incidents", incidents)

  const normalizedOffset = Math.floor(offset / 15) - 1
  const filteredProbs = probs.filter(row => row.days === weekday && row.time === startTimeString && row.offset === normalizedOffset);
  const probsDict = filteredProbsToDict(filteredProbs);

  // console.log("filtered probs", probsDict);

  const getLineColor = f => {
    const key = f.properties.street_id
    if (!probsDict[key]) {
      return [200, 200, 200];
    }
    return COLOR_SCALE(probsDict[key]);
  };

  const getLineWidth = f => {
    const key = f.properties.street_id
    if (!probsDict[key]) {
      return 5;
    }
    return WIDTH_SCALE(probsDict[key]);
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
      // onHover: setHoverInfo,

      updateTriggers: {
        getLineColor: {probsDict},
        getLineWidth: {probsDict}
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

      {/* {renderTooltip({incidents, fatalities, year, hoverInfo})} */}
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
    offset: Number(d.offset),
    prob: Number(d.prob)
  });

  csv(DATA_PATH.PROBS, formatRow, (error, response) => {
    if (!error) {
      root.render(<App probs={response}/>);
    }
  });
}
