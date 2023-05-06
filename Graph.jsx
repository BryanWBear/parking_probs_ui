
import React, { useState } from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries, Hint, MarkSeries, ChartLabel, Crosshair } from 'react-vis';
import InputLabel from '@mui/material/InputLabel';

function Graph(props) {
    const [hovered, setHovered] = useState(null);

    function handleHover(point) {
      setHovered(point);
    }

    function handleUnhover() {
      setHovered(null);
    }

    const renderMark = () => {
      if (hovered) {
        const { x, y } = hovered;
        return <MarkSeries
                data={[{ x, y }]}             
                stroke="white"
                fill="#69b3a2"
                size={8} />;
      }
      return null;
    };  

    const {selectedFeature, selectedStreet} = props;

    const xTickValues = [15, 30, 45, 60, 75, 90, 105, 120];
    const yTickValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    const yTickFormat = (d) => `$${d}`;

    const data = []
    const parkingData = []

    xTickValues.forEach(a => {
      parkingData.push({x: a, y: a/60 * 3.5})
    })

    if (selectedFeature) {
      selectedFeature.forEach(a => {
        data.push({x: Math.floor((a.offset + 1) * 15), y: a.prob * 93.5})
      });  
    }
  
    return (
      (selectedFeature && selectedFeature.length !== 0) ? (<div style={{
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
            id="expected-value">Expected Cost on {selectedStreet}</InputLabel>
        <XYPlot 
        height={400} 
        width={700} 
        onMouseLeave={handleUnhover}
        margin={{ left: 80, right: 20, top: 40, bottom: 60 }}
        >
          <VerticalGridLines style={{ strokeWidth: 0.5, stroke: '#f5f5f5' }} />
          <HorizontalGridLines style={{ strokeWidth: 0.5, stroke: '#f5f5f5' }} />
          <LineSeries data={data} style={{
            fill: "none",
            stroke: "#69b3a2"
            }} 
            onNearestX={handleHover}/>

          {hovered && (
            <Hint value={hovered} distance={200}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ margin: 0 }}>Duration: {hovered.x} mins</p>
                <p style={{ margin: 0 }}>Expected Cost without Paying: ${hovered.y.toFixed(2)}</p>
                <p style={{ margin: 0 }}>Expected Cost with Paying: ${(hovered.x/60 * 3.5).toFixed(2)}</p>
              </div>
            </Hint>
            
          )}
          {renderMark()}
          <XAxis tickValues={xTickValues} />
          <YAxis tickValues={yTickValues} tickFormat={yTickFormat}/>
        
          <ChartLabel
            text="Duration (minutes)"
            className="alt-x-label"
            includeMargin={false}
            xPercent={0.35}
            yPercent={1.3}
            tickValues={xTickValues}
            />
          <ChartLabel
            text="Expected Cost (dollars)"
            className="alt-y-label"
            includeMargin={false}
            xPercent={-0.09}
            yPercent={0.8}
            style={{
              transform: 'rotate(-90)',
              // textAnchor: 'end'
            }}
            />
        </XYPlot>
      </div> ) : ( <div></div> )
    );
  }

  export default Graph;