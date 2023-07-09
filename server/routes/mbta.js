const router = require('express').Router();
const mbtaController = require('../controllers/mbtaController');

router.route('/:route_id/:direction_id/:stop_id').get(mbtaController.getArrivalTime);

module.exports = router;
