const User = require('../models/userModel');
const Activity = require('../models/activityModel');

// GET ALL RECENT ACTIVITIES
exports.getAllActivities = async (req, res) => {
    try {
      const activities = await Activity.find()
        .populate('user', 'name email')  
        .sort({ createdAt: -1 })                            

      res.status(200).json({
        success: true,
        message: 'Recent activities fetched successfully...',
        data: activities
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Something went wrong while fetching activities.',
        error: err.message
      });
    }
};

// GET UNSEEN COUNT
exports.getUnseenActivityCount = async (req, res) => {
  try {
    const count = await Activity.countDocuments({
      $or: [{ seen: false }, { seen: { $exists: false } }]
    });

    return res.status(200).json({
      success: true,
      message: 'Unseen activity count fetched successfully...',
      count
    });
  } catch (error) {
    console.error("Error in getUnseenActivityCount:", error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching unseen count.',
      error: error.message
    });
  }
};

// MARK ALL SEEN
exports.markAllSeen = async (req, res) => {
  try {
    const result = await Activity.updateMany(
      { $or: [{ seen: false }, { seen: { $exists: false } }] },
      { $set: { seen: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'All activities marked as seen successfully...',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error in markAllAsSeen:", error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while marking activities as seen.',
      error: error.message
    });
  }
};

// GET USER ADDITIONS 
exports.getUserAdditions = async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "User additions per day",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user chart data",
      error: err.message,
    });
  }
};



