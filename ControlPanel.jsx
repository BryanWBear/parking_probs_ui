import React, { useState, useEffect } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';


function ControlPanel(props) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { weekday, onWeekdayChange, startTime, onStartTimeChange, offset, onOffsetChange} = props;
  
  const handleWeekdayChange = (event) => {
    onWeekdayChange(event.target.value);
  };  


  const marks = [
    {
      value: 15,
      label: '15',
    },
    {
      value: 30,
      label: '30',
    },
    {
      value: 45,
      label: '45',
    },
    {
      value: 60,
      label: '60',
    },
    {
      value: 75,
      label: '75',
    },
    {
      value: 90,
      label: '90',
    },   
    {
      value: 105,
      label: '105',
    },
  ];

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  

  return (
    <div style={{
      position: 'absolute',
      top: '5px',
      right: '5px',
      width: `calc(10vw + ${windowDimensions.width * 0.2}px)`,
      height: `calc(10vh + ${windowDimensions.height * 0.15}px)`,
      backgroundColor: 'gainsboro',
      border: '1px solid #000000',
      // display: "flex",
      padding: 20,
      // overflow: "hidden",
      //alignItems: "center",
      //justifyContent: "center",
    }}>
      
     <div style={{
      display: "flex",
      //alignItems: "center",
      //justifyContent: "center",
     }}>

        <div style={{
          marginRight: "10px",
          //alignItems: "center",
          //justifyContent: "center",
        }}>

          <InputLabel sx={{
              color: 'black',
              fontWeight: 'bold',
            }}
            id="start-time-picker">Start Time</InputLabel>
            <TimePicker
              id="start-time-picker"
              value={startTime}
              onChange={onStartTimeChange}
              minutesStep={15}
            />
        </div>
        <div style={{
          //alignItems: "center",
          //justifyContent: "center",
        }}>
            <InputLabel sx={{
              color: 'black',
              fontWeight: 'bold',
            }} id="demo-simple-select-label">Weekday</InputLabel>
            <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={weekday}
            label="Weekday"
            onChange={handleWeekdayChange}
          >
            <MenuItem value={"Monday"}>Monday</MenuItem>
            <MenuItem value={"Tuesday"}>Tuesday</MenuItem>
            <MenuItem value={"Wednesday"}>Wednesday</MenuItem>
            <MenuItem value={"Thursday"}>Thursday</MenuItem>
            <MenuItem value={"Friday"}>Friday</MenuItem>
            <MenuItem value={"Saturday"}>Saturday</MenuItem>
            <MenuItem value={"Sunday"}>Sunday</MenuItem>
            </Select>
        </div>

      </div>

      <div style={{
        marginTop: "30px",
        //marginLeft: "30px",
        //marginRight: "30px",
        alignItems: "center",
        justifyContent: "center",
      }}>

          <InputLabel sx={{
              color: 'black',
              fontWeight: 'bold',
            }}
            id="duration-picker">Parking Duration (in minutes)</InputLabel>
          <Slider
            id='duration-picker'
            aria-label="Parking Duration"
            value={offset}
            onChange={onOffsetChange}
            valueLabelDisplay="auto"
            step={15}
            marks={marks}
            min={15}
            max={105}
            sx={{
              width: 350,
              color: '#4c5661',
            }}
          />
      </div>
    </div>
  );
}

export default ControlPanel;



