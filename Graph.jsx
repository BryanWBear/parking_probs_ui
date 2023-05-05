
import React, { useState, useEffect } from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries, Hint, MarkSeries } from 'react-vis';
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

    const {selectedFeature} = props;

    const data = []

    if (selectedFeature) {
      selectedFeature.forEach(a => {
        data.push({x: Math.floor((a.offset + 1) * 15), y: a.prob})
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
            id="expected-value">Expected Value</InputLabel>
        <XYPlot 
        height={400} 
        width={600} 
        onMouseLeave={handleUnhover}
        margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        >
          <VerticalGridLines style={{ strokeWidth: 0.5, stroke: '#f5f5f5' }} />
          <HorizontalGridLines style={{ strokeWidth: 0.5, stroke: '#f5f5f5' }} />
          <XAxis title="Duration" />
          <YAxis title="Probability" />
          <LineSeries data={data} style={{
            fill: "none",
            stroke: "#69b3a2"
            }} 
            onNearestX={handleHover}/>
          {hovered && (
            <Hint value={hovered} distance={200}>
              <div>{`Duration: ${hovered.x}, P: ${Math.round(hovered.y * 100) / 100}`}</div>
            </Hint>
            
          )}
          {renderMark()}
        </XYPlot>
      </div> ) : ( <div></div> )
    );
  }

  export default Graph;