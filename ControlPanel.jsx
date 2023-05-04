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
      label: '15 min',
    },
    {
      value: 30,
      label: '30 min',
    },
    {
      value: 45,
      label: '45 min',
    },
    {
      value: 60,
      label: '60 min',
    },
    {
      value: 75,
      label: '75 min',
    },
    {
      value: 90,
      label: '90 min',
    },   
    {
      value: 105,
      label: '105 min',
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
      top: '10px',
      right: '10px',
      width: `calc(10vw + ${windowDimensions.width * 0.15}px)`,
      height: `calc(10vh + ${windowDimensions.height * 0.2}px)`,
      backgroundColor: '#ffffff',
      border: '1px solid #000000',
    }}>
      <InputLabel id="start-time-picker">Start Time</InputLabel>
      <TimePicker
        id="start-time-picker"
        value={startTime}
        onChange={onStartTimeChange}
        minutesStep={15}
      />
      <InputLabel id="duration-picker">Parking Duration</InputLabel>
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
      />
      <InputLabel id="demo-simple-select-label">Weekday</InputLabel>
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
  );
}

export default ControlPanel;



