
import React, { useState, useEffect } from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import InputLabel from '@mui/material/InputLabel';

function Graph(props) {
    const data = [
      {x: 0, y: 8},
      {x: 1, y: 5},
      {x: 2, y: 4},
      {x: 3, y: 9},
      {x: 4, y: 1},
      {x: 5, y: 7},
      {x: 6, y: 6},
      {x: 7, y: 3},
      {x: 8, y: 2},
      {x: 9, y: 0}
    ];
  
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: "gainsboro",
        //borderRadius: '5px', 
        //width: `calc(10vw + ${windowDimensions.width * 0.2}px)`,
        //height: `calc(10vh + ${windowDimensions.height * 0.15}px)`,
      }} className="graph-container">
        <InputLabel sx={{
              color: 'black',
              fontWeight: 'bold',
              top: '5px',
              left: '5px',
            }}
            id="expected-value">Expected Value</InputLabel>
        <XYPlot height={300} width={400}>
          <LineSeries data={data} style={{
            fill: "none",
            stroke: "red"
            }} />
        </XYPlot>
      </div>
    );
  }

  export default Graph;