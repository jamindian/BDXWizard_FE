import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { isStopwatchSelector } from "@redux/Actions/Auth";

const Timer = () => {
    const timer: string = useSelector(isStopwatchSelector);

	const [isActive, setIsActive] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [time, setTime] = useState<number>(0);
 
    React.useEffect(() => {
        if (timer === "start") {
            handleStart();
        }
        else if (timer === "stop") {
            handlePauseResume();
        }
        else if (timer === "reset") {
            handleReset();
        }
    }, [timer]);

    React.useEffect(() => {
        let interval = null;
 
        if (isActive && isPaused === false) {
            interval = setInterval(() => {
                setTime((time) => time + 10);
            }, 10);
        } else {
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        };
    }, [isActive, isPaused]);
 
    const handleStart = (): void => {
        setIsActive(true);
        setIsPaused(false);
    };
 
    const handlePauseResume = (): void => {
        setIsPaused(!isPaused);
    };
 
    const handleReset = (): void => {
        setIsActive(false);
        setTime(0);
    };

	return (
		<div
			style={{ textAlign: "center", margin: "auto" }}
		>
			<h2>Sheet Load Time</h2>
			<div className="timer">
                <span className="digits">
                    <span className="timer-heading">HH</span>
                    {("0" + Math.floor((time / 3600000) % 24)).slice(-2)}:
                </span>
                <span className="digits">
                <span className="timer-heading">MM</span>
                    {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
                </span>
                <span className="digits">
                    <span className="timer-heading">SS</span>
                    {("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
                </span>
                <span className="digits mili-sec">
                    <span className="timer-heading">MS</span>
                    {("0" + ((time / 10) % 100)).slice(-2)}
                </span>
            </div>
		</div>
	);
};

export default Timer;