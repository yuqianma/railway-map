import { useState, useEffect, useRef, useCallback } from 'react';
import "./index.css";

type TimelineProps = {
	onTimeChange?: (time: number) => void;
};

export const Timeline = ({
	onTimeChange
}: TimelineProps) => {
	return (
		<div className="timeline">
			<input type="range"></input>
		</div>
	);
};
