const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// GET ALL ACTIVITIES
router.get('/activities/recent', authMiddleware , isAdmin , activityController.getAllActivities);

// GET UNSEEN COUNT
router.get('/activities/unseen-count', authMiddleware, isAdmin, activityController.getUnseenActivityCount);

// MARK ALL COUNT SEEN
router.post('/activities/mark-as-seen', authMiddleware, isAdmin, activityController.markAllSeen);

// GET USER ADDITIONS
router.get('/activities/get-user-additions', authMiddleware , isAdmin , activityController.getUserAdditions);


module.exports = router;
