import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import Select, { components } from 'react-select';
import { parseTime } from '../utils/display_time';
import routeData from '../mbta_info/routes.json';
import '../App.css';

function Form() {
    const [routes, setRoutes] = useState([]);
    const [directions, setDirections] = useState([]);
    const [stops, setStops] = useState([]);

    const [routeId, setRouteId] = useState(null);
    const [directionId, setDirectionId] = useState(null);
    const [stopId, setStopId] = useState(null);

    const [arrivalTimes, setArrivalTimes] = useState([]);

    const [savedQueries, setSavedQueries] = useState([]);
    const [savedQueryName, setSavedQueryName] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);

    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (routeId && directionId && stopId) {
            axios
                .get(`/api/mbta/`, {
                    params: {
                        route_id: routeId.value,
                        direction_id: directionId.value,
                        stop_id: stopId.value,
                    },
                })
                .then(response => setArrivalTimes(response.data.arrivalTimes))
                .catch(err => console.log(err));
        }
    }

    const handleSave = () => {
        if (routeId && directionId && stopId) {
            setShowSaveForm(true);
        }
    }

    const handleSaveSubmit = (e) => {
        e.preventDefault();
    
        const newQuery = {
            routeId: {value: routeId.value, label: routeId.label},
            directionId: {value: directionId.value, label: directionId.label},
            stopId: {value: stopId.value, label: stopId.label},
            label: savedQueryName
        };
      
        let savedQueries = JSON.parse(localStorage.getItem('savedQueries')) || [];
      
        const queryExists = savedQueries.some(query => 
            query.routeId.value === newQuery.routeId.value &&
            query.directionId.value === newQuery.directionId.value &&
            query.stopId.value === newQuery.stopId.value
        );
      
        if (!queryExists) {
            savedQueries.push(newQuery);
            localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
      
            setSavedQueries(prev => [...prev, {value: savedQueries.length - 1, label: savedQueryName}]);
        } else {
            alert("This query is already saved!");
        }
    
        // Reset the form
        setShowSaveForm(false);
        setSavedQueryName('');
    }

    const Option = ({ children, data, ...props }) => {
        return (
            <components.Option {...props} className="select__option">
                <div>{children}</div>
                <button className="delete-button" onClick={(e) => handleDelete(e, data)}>-</button>
            </components.Option>
        );
    }; 
      
    const handleDelete = (e, option) => {
        e.stopPropagation();
        let savedQueries = JSON.parse(localStorage.getItem('savedQueries')) || [];
        const newQueries = savedQueries.filter((query, index) => index !== option.value);
        localStorage.setItem('savedQueries', JSON.stringify(newQueries));
        
        setSavedQueries(newQueries.map((query, index) => ({
            value: index,
            label: query.label,
        })));
    };        

    useEffect(() => {
        const formattedRoutes = Object.entries(routeData).map(([routeId, route]) => ({
            value: routeId,
            label: route.name,
        }));
        setRoutes(formattedRoutes);
    
        let savedQueries = JSON.parse(localStorage.getItem('savedQueries')) || [];
        setSavedQueries(savedQueries.map((query, index) => ({
            value: index,
            label: query.label
        })));
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

                    <div className='saved-queries-group'>
                        <label>
                            Saved Routes:
                            <Select
                                options={savedQueries}
                                onChange={index => {
                                    const savedQuery = JSON.parse(localStorage.getItem('savedQueries'))[index.value];
                                    setRouteId(savedQuery.routeId);
                                    setDirectionId(null);
                                    setStopId(null);
                                    
                                    // Use a timeout to allow previous states to update
                                    setTimeout(() => {
                                        setDirectionId(savedQuery.directionId);
                                        setTimeout(() => {
                                            setStopId(savedQuery.stopId);
                                        }, 25);
                                    }, 25);
                                }}
                                components={{ Option }}                            
                            />
                        </label>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
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
                        </div>
                        <div className='button-container'>
                            <button type="submit">Submit</button>
                            <button type="button" onClick={handleSave}>Save</button>
                        </div>
                    </form>
                </div>

                <div className='arrival-times-container'>
                    <h2>Arrival Times</h2>
                    {arrivalTimes.length > 0 
                        ? arrivalTimes.map((time, index) => {
                            const currentTime = moment().tz("America/New_York");
                            const arrivalTime = moment.tz(time, "America/New_York");
                            const timeDifference = arrivalTime.diff(currentTime, 'minutes');                    

                            return (
                                <div key={index} className="arrival-time-card">
                                    <p>{parseTime(time)}<span className='arrival-time-spacing'>(in {timeDifference} min)</span></p>
                                </div>
                            );
                        })
                        : <p>No arrival times. Sorry!</p>
                    }
                </div>
            </div>

            <div className='footer'>
                <p>Copyright © {new Date().getFullYear()} MBTA Query</p>
            </div>

            {showSaveForm && 
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h2>Save Query</h2>
                        <form onSubmit={handleSaveSubmit}>
                            <label>
                                <label>Name:</label>
                                <input type="text" value={savedQueryName} onChange={e => setSavedQueryName(e.target.value)} />
                            </label>
                            <div className='button-container'>
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setShowSaveForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </div>
    );     
}
  
export default Form;