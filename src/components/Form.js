import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { parseTime } from '../utils/display_time';
import routeData from '../mbta_info/routes.json';
import '../App.css';

function Form() {
    const [routes, setRoutes] = useState({});

    const [routeId, setRouteId] = useState("");
    const [directionId, setDirectionId] = useState("");
    const [stopId, setStopId] = useState("");

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
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Route ID:
                    <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                        <option value="">--Select a Route--</option>
                        {Object.entries(routes).map(([routeId, routeName], index) => 
                            <option key={index} value={routeId}>{routeName}</option>
                        )}
                    </select>
                </label>
                <label>
                    Direction ID:
                    <input type="text" value={directionId} onChange={e => setDirectionId(e.target.value)} />
                </label>
                <label>
                    Stop ID:
                    <input type="text" value={stopId} onChange={e => setStopId(e.target.value)} />
                </label>
                <button type="submit">Submit</button>
            </form>
            {(arrivalTimes.length > 0) && <p>Next arrival times: {arrivalTimes.map(time => parseTime(time)).join(", ")}</p>}
        </div>
    );     
}
  
export default Form;