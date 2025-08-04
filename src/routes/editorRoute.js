const express = require("express");
const router = express.Router();
const editorController = require("../controllers/editorController");
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// ADD CONTENT (Admin)
router.post("/editor/add-content", authMiddleware , isAdmin , editorController.addContent);

// GET ALL CONTENT (Admin / User)
router.get("/editor/get-all-content", authMiddleware , editorController.getAllContent);

module.exports = router;
