const mongoose = require("mongoose");

const editorSchema = new mongoose.Schema(
  {
    content: Object,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EditorContent", editorSchema);
