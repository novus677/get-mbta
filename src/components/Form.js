import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import Select from 'react-select';
import { parseTime } from '../utils/display_time';
import routeData from '../mbta_info/routes.json';
import '../App.css';

function Form() {
    const [routes, setRoutes] = useState({});

    const [routeId, setRouteId] = useState("");
    const [directionId, setDirectionId] = useState("");
    const [stopId, setStopId] = useState("");

    const [directions, setDirections] = useState({});
    const [stops, setStops] = useState({});

    const [arrivalTimes, setArrivalTimes] = useState([]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (routeId && directionId && stopId) {
            axios
                .get(`http://localhost:5001/api/mbta/${routeId}/${directionId}/${stopId}`)
                .then(response => setArrivalTimes(response.data.arrivalTimes))
                .catch(err => console.log(err));
        }
    }

    useEffect(() => {
        setRoutes(routeData);
    }, []);

    useEffect(() => {
        if (routeId && routes[routeId]) {
            setDirections(routes[routeId].directions);
            setDirectionId("");
            setStops({});
            setStopId("");
        }
    }, [routeId, routes]);

    useEffect(() => {
        if (directionId && directions[directionId]) {
            setStops(directions[directionId].stops);
            setStopId("");
        }
    }, [directionId, directions]);

    return (
        <div>
            <div className='header'>
                <h1>MBTA Query</h1>
            </div>

            <div className='main-content'>
                <div className='form-container'>
                    <h2>Query Your Route</h2>

                    <form onSubmit={handleSubmit}>
                        <label>
                            Route:
                            <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                                <option value="">--Select a Route--</option>
                                {Object.entries(routes).map(([routeId, routeData], index) => 
                                    <option key={index} value={routeId}>{routeData.name}</option>
                                )}
                            </select>
                        </label>
                        <label>
                            Direction:
                            <select value={directionId} onChange={e => setDirectionId(e.target.value)} disabled={!routeId}>
                                <option value="">--Select a Direction--</option>
                                {Object.entries(directions).map(([directionId, directionData], index) => 
                                    <option key={index} value={directionId}>{directionData.name}</option>
                                )}
                            </select>
                        </label>
                        <label>
                            Stop:
                            <select value={stopId} onChange={e => setStopId(e.target.value)} disabled={!directionId}>
                                <option value="">--Select a Stop--</option>
                                {directions[directionId]?.stops.map((stop, index) => 
                                    <option key={index} value={Object.keys(stop)[0]}>{Object.values(stop)[0]}</option>
                                )}
                            </select>
                        </label>
                        <div className='button-container'>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>

                <div className='arrival-times-container'>
                    <h2>Arrival Times</h2>
                    {arrivalTimes.length > 0 && arrivalTimes.map((time, index) => {
                        const currentTime = moment().tz("America/New_York");
                        const arrivalTime = moment.tz(time, "America/New_York");
                        const timeDifference = arrivalTime.diff(currentTime, 'minutes');                    

                        return (
                            <div key={index} className="arrival-time-card">
                                <p>{parseTime(time)}<span className='arrival-time-spacing'>(in {timeDifference} min)</span></p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className='footer'>
                <p>Copyright © {new Date().getFullYear()} MBTA Query</p>
            </div>
        </div>
    );     
}
  
export default Form;