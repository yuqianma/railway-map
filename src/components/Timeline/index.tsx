import { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from "mobx-react-lite";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useStore } from "../../useStore";
import "./index.css";

export const Timeline = observer(() => {
	const store = useStore();
	const initTimeRangeRef = useRef(store.timeRange);

  const handleChange = (event: Event, newValue: number | number[]) => {
    store.setTimeRange(newValue as number[]);
  };

	return (
		<div className="timeline">
			<Box sx={{ width: "98%" }}>
				<Slider
					min={initTimeRangeRef.current[0]}
					max={initTimeRangeRef.current[1]}
					valueLabelFormat={value => new Date(value).toLocaleString()}
					value={store.timeRange}
					onChange={handleChange}
					valueLabelDisplay="auto"
				/>
			</Box>
		</div>
	);
});
