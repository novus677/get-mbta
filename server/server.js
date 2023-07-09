const express = require('express');
const cors = require('cors');
const mbtaRoutes = require('./routes/mbta');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/mbta', mbtaRoutes);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
