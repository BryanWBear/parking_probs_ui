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
import Graph from './Graph';

import {csv} from 'd3-request';

// Source data GeoJSON
const DATA_PATH = {
  PROBS:
    './probs_with_offset.csv',
  ROADS: './streets.json'
};

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

const WIDTH_SCALE = scaleLinear().clamp(true).domain([0, 1]).range([10, 50]);

const INITIAL_VIEW_STATE = {
  latitude: 37.755,
  longitude: -122.41,
  zoom: 12,
  minZoom: 4,
  maxZoom: 35
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

function renderTooltip({probsDict, hoverInfo}) {
  const {object, x, y} = hoverInfo;

  if (!object || !probsDict) {
    return null;
  }

  const props = object.properties;
  // const key = getKey(props);
  const r = probsDict[props.street_id];

  const content = r ? (
    <div>
      <b>{Math.round(r * 100) / 100}</b> probability of getting a ticket.

    </div>
  ) : (
    <div>
      0 probability of getting a ticket / no meters.
    </div>
  );

  return (
    <div className="tooltip" style={{left: x, top: y}}>
      <big>
      {props.street_id}
      </big>
      {content}
    </div>
  );
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

function onStreetClick(info, probs, weekday, startTimeString) {
    const streetId = info.object.properties.street_id
    const filteredProbs = probs.filter(row => row.days === weekday && row.time === startTimeString && row.streets === streetId);
    return filteredProbs
}

export default function App({roads = DATA_PATH.ROADS, probs, mapStyle = MAP_STYLE}) {
  const [hoverInfo, setHoverInfo] = useState({});
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  // console.log("selected feature", selectedFeature);
  const [startTime, setStartTime] = useState(dayjs('2022-04-17T15:30'));
  const startTimeString = startTime.format("HH:mm:00");

  const [offset, setOffset] = useState(15);
  const [weekday, setWeekday] = useState("Monday")
  // console.log("incidents", incidents)

  const normalizedOffset = Math.floor(offset / 15) - 1
  const filteredProbs = probs.filter(row => row.days === weekday && row.time === startTimeString && row.offset === normalizedOffset);
  const probsDict = filteredProbsToDict(filteredProbs);

  //  console.log("filtered probs", probsDict);

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
      onHover: setHoverInfo,
      onClick: (info) => {
        if (info.object) {
          setSelectedFeature(onStreetClick(info, probs, weekday, startTimeString));
          setSelectedStreet(info.object.properties.street_id)
        } else {
          setSelectedFeature(null);
          setSelectedStreet(null);
        }
      },

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

      {renderTooltip({probsDict, hoverInfo})}
    </DeckGL>
    <ControlPanel weekday={weekday} 
    onWeekdayChange={setWeekday} 
    startTime={startTime}
    onStartTimeChange={setStartTime}
    offset={offset}
    onOffsetChange={setOffset}> 
    </ControlPanel>
    <Graph selectedFeature={selectedFeature} selectedStreet={selectedStreet}></Graph>
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
