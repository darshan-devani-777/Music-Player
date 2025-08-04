const FAQ = require("../models/faqModel");
const Activity = require("../models/activityModel");

// CREATE FAQ QUESTION
exports.createFAQ = async (req, res) => {
  try {
    const { question } = req.body;

    const faq = await FAQ.create({
      question,
      createdBy: req.user._id,
    });

    await Activity.create({
      user: req.user._id,
      action: "Created_FAQ",
      targetType: "FAQ",
      targetId: faq._id,
    });

    res.status(201).json({
      success: true,
      message: "FAQ question submitted successfully...",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ANSWER A FAQ
exports.answerFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found to answer.",
      });
    }

    faq.answer = answer;
    faq.answeredBy = req.user._id;
    await faq.save();

    await Activity.create({
      user: req.user._id,
      action: "Answered_FAQ",
      targetType: "FAQ",
      targetId: faq._id,
    });

    res.status(200).json({
      success: true,
      message: "FAQ answered successfully...",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL FAQS
exports.getAllFAQs = async (req, res) => {
    try {
      const faqs = await FAQ.find()
        .populate("createdBy", "name email")
        .populate("answeredBy", "name email");
  
      res.status(200).json({
        success: true,
        message: "All FAQs retrieved successfully...",
        total: faqs.length,
        data: faqs,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};

// GET UNANSWERED FAQS
exports.getUnansweredFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ answer: "" });

    res.status(200).json({
      success: true,
      message: "Unanswered FAQs retrieved successfully...",
      total: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SPECIFIC FAQ BY ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("answeredBy", "name email");

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found with the provided ID.",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully...",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    let faq = await FAQ.findById(id)
      .populate('createdBy', 'name email')      
      .populate('answeredBy', 'name email');     

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    let isUpdated = false;

    if (question !== undefined) {
      faq.question = question;
      isUpdated = true;
    }

    if (answer !== undefined) {
      faq.answer = answer;
      faq.answeredBy = req.user._id;
      isUpdated = true;
    }

    if (!isUpdated) {
      return res.status(400).json({
        success: false,
        message: "No changes were made to the FAQ.",
      });
    }

    await faq.save();

    faq = await FAQ.findById(faq._id)
      .populate('createdBy', 'name email')
      .populate('answeredBy', 'name email');

    await Activity.create({
      user: req.user._id,
      action: "Updated_FAQ",
      targetType: "FAQ",
      targetId: faq._id,
    });

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully...",
      faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// DELETE FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faqToDelete = await FAQ.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("answeredBy", "name email");

    if (!faqToDelete) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found to delete.",
      });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    await Activity.create({
      user: req.user._id,
      action: "Deleted_FAQ",
      targetType: "FAQ",
      targetId: faqToDelete._id,
    });

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully...",
      deletedFAQId: faqToDelete._id,
      deletedQuestion: faqToDelete.question,
      createdBy: faqToDelete.createdBy,
      answeredBy: faqToDelete.answeredBy,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

