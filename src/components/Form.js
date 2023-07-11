import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import Select from 'react-select';
import { parseTime } from '../utils/display_time';
import routeData from '../mbta_info/routes.json';
import '../App.css';

function Form() {
    const [routes, setRoutes] = useState([]);

    const [routeId, setRouteId] = useState(null);
    const [directionId, setDirectionId] = useState(null);
    const [stopId, setStopId] = useState(null);

    const [directions, setDirections] = useState([]);
    const [stops, setStops] = useState([]);

    const [arrivalTimes, setArrivalTimes] = useState([]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (routeId && directionId && stopId) {
            axios
                .get(`http://localhost:5001/api/mbta/${routeId.value}/${directionId.value}/${stopId.value}`)
                .then(response => setArrivalTimes(response.data.arrivalTimes))
                .catch(err => console.log(err));
        }
    }

    useEffect(() => {
        const formattedRoutes = Object.entries(routeData).map(([routeId, route]) => ({
            value: routeId,
            label: route.name,
        }));
        setRoutes(formattedRoutes);
    }, []);

    useEffect(() => {
        if (routeId) {
            const route = routeData[routeId.value];
            const formattedDirections = Object.entries(route.directions).map(([directionId, direction]) => ({
                value: directionId,
                label: direction.name,
            }));
            setDirections(formattedDirections);
            setDirectionId(null);
            setStops([]);
            setStopId(null);
        }
    }, [routeId]);

    useEffect(() => {
        if (directionId && routeId) {
            const stopsData = routeData[routeId.value].directions[directionId.value].stops;
            const formattedStops = stopsData.map(stop => ({
                value: Object.keys(stop)[0],
                label: Object.values(stop)[0],
            }));
            setStops(formattedStops);
            setStopId(null);
        }
    }, [directionId, routeId]);

    return (
        <div>
            <div className='header'>
                <h1>MBTA Query</h1>
            </div>

            <div className='main-content'>
                <div className='form-container'>
                    <h2>Enter Your Stop</h2>

                    <form onSubmit={handleSubmit}>
                        <label>
                            Route:
                            <Select
                                options={routes}
                                value={routeId}
                                onChange={setRouteId}
                                placeholder="--Select a Route--"
                            />
                        </label>
                        <label>
                            Direction:
                            <Select
                                options={directions}
                                value={directionId}
                                onChange={setDirectionId}
                                placeholder="--Select a Direction--"
                                isDisabled={!routeId}
                            />
                        </label>
                        <label>
                            Stop:
                            <Select
                                options={stops}
                                value={stopId}
                                onChange={setStopId}
                                placeholder="--Select a Stop--"
                                isDisabled={!directionId}
                            />
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