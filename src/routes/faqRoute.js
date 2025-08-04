const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// CREATE FAQ (Admin / User)
router.post("/faq/create-faq", authMiddleware , faqController.createFAQ);

// ANSWERED FAQ (Admin)
router.put("/faq/answer-faq/:id", authMiddleware , isAdmin , faqController.answerFAQ);

// GET ALL FAQ (Admin / User)
router.get("/faq/get-all-faq", authMiddleware , faqController.getAllFAQs);

// GET UNANSWERED FAQ (Admin)
router.get("/faq/get-unanswered-faq", authMiddleware , isAdmin , faqController.getUnansweredFAQs);

// GET SPECIFIC FAQ (Admin / User)
router.get("/faq/get-specific-faq/:id", authMiddleware , faqController.getFAQById);

// UPDATE FAQ (Admin)
router.put("/faq/update-faq/:id", authMiddleware , isAdmin , faqController.updateFAQ);

// DELETE FAQ (Admin)
router.delete("/faq/delete-faq/:id", authMiddleware , isAdmin , faqController.deleteFAQ);

module.exports = router;
