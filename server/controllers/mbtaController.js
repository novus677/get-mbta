const axios = require('axios');

exports.getArrivalTime = async (req, res) => {
    const { route_id, direction_id, stop_id } = req.params;
    const url = `https://api-v3.mbta.com/predictions?filter[route]=${route_id}&filter[direction_id]=${direction_id}&filter[stop]=${stop_id}&api_key=${process.env.MBTA_API_KEY}`;
    const NUM_TIMES = 5;

    try {
        const response = await axios.get(url);
        const data = response.data;
        
        let arrivalTimes = [];
        let count = 0;
        for (let entry of data.data) {
            if (count < NUM_TIMES && entry.attributes.arrival_time !== null) {
                arrivalTimes.push(entry.attributes.arrival_time);
                count++;
            }
        }

        res.json({arrivalTimes: arrivalTimes})
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};
