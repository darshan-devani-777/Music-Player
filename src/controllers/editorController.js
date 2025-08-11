const EditorContent = require("../models/editorModel");
const Activity = require("../models/activityModel");
const cloudinary = require("../utils/cloudinary");
const draftToHtml = require("draftjs-to-html");

// ADD CONTENT
exports.addContent = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    const entityMap = content.entityMap || {};

    for (const key in entityMap) {
      const entity = entityMap[key];
      if (
        entity.type === "IMAGE" &&
        entity.data?.src?.startsWith("data:image/")
      ) {
        const uploadRes = await cloudinary.uploader.upload(entity.data.src, {
          folder: "music-app/editors",
          allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        });

        entity.data.src = uploadRes.secure_url;
      }
    }

    const images = Object.values(entityMap)
      .filter((e) => e.type === "IMAGE" && e.data?.src)
      .map((e) => e.data.src);

    const saved = await EditorContent.create({
      content,
      createdBy: userId,
    });

    await Activity.create({
      user: userId,
      action: "Created_editor_content",
      targetType: "EditorContent",
      targetId: saved._id,
    });

    res.status(201).json({
      success: true,
      message: "Content Saved Successfully...",
      data: {
        _id: saved._id,
        content: saved.content,
        images,
        createdBy: saved.createdBy,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in addContent:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// GET ALL CONTENT
exports.getAllContent = async (req, res) => {
  try {
    const data = await EditorContent.find().sort({ createdAt: -1 });

    const htmlContent = data.map((item) => draftToHtml(item.content));
    console.log(htmlContent);

    return res.status(200).json({
      success: true,
      message: "Content Fetched Successfully...",
      count: htmlContent.length,
      data: htmlContent,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: err.message,
    });
  }
};
