import React, { useState, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  AtomicBlockUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";

import { FileUpload } from "primereact/fileupload";
import EmojiPicker from "emoji-picker-react";

export default function PrimeTextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef(null);
  const fileUploadRef = useRef(null);

  const focusEditor = () => editorRef.current.focus();

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (type) => {
    setEditorState(RichUtils.toggleBlockType(editorState, type));
  };

  const toggleFontStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleEmojiClick = (emojiData) => {
    const contentState = editorState.getCurrentContent();
    const contentWithEmoji = Modifier.insertText(
      contentState,
      editorState.getSelection(),
      emojiData.emoji
    );
    const newEditorState = EditorState.push(
      editorState,
      contentWithEmoji,
      "insert-characters"
    );
    setEditorState(newEditorState);
  };

  const handleImageUpload = (event) => {
    const file = event.files[0];
    if (!file) return;
    fileUploadRef.current.clear();

    const reader = new FileReader();
    reader.onload = () => {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "IMAGE",
        "IMMUTABLE",
        {
          src: reader.result,
        }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        EditorState.set(editorState, {
          currentContent: contentStateWithEntity,
        }),
        entityKey,
        " "
      );

      setEditorState(newEditorState);
    };

    reader.readAsDataURL(file);
  };

  const mediaBlockRenderer = (block) => {
    if (block.getType() === "atomic") {
      return {
        component: Media,
        editable: false,
      };
    }
    return null;
  };

  const Media = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();
    return (
      <img
        src={src}
        alt="Uploaded"
        className="my-4 object-contain rounded"
        style={{ width: "300px", height: "200px" }}
      />
    );
  };

  const customStyleMap = {
    FONT_SANS: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
    FONT_SERIF: { fontFamily: "ui-serif, Georgia, serif" },
    FONT_MONO: { fontFamily: "ui-monospace, SFMono-Regular, monospace" },

    // Font Sizes
    FONTSIZE_12: { fontSize: "12px" },
    FONTSIZE_14: { fontSize: "14px" },
    FONTSIZE_16: { fontSize: "16px" },
    FONTSIZE_18: { fontSize: "18px" },
    FONTSIZE_20: { fontSize: "20px" },
    FONTSIZE_24: { fontSize: "24px" },
    FONTSIZE_32: { fontSize: "32px" },
  };

  const handleFontChange = (e) => {
    const fontStyle = e.target.value;
    if (fontStyle) {
      toggleFontStyle(fontStyle);
    }
  };

  const StyledButton = ({ label, onClick }) => (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md hover:from-indigo-600 hover:to-purple-600 transition duration-300 shadow cursor-pointer"
    >
      {label}
    </button>
  );

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4 underline">
        📝 Text Editor
      </h3>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <StyledButton label="Bold" onClick={() => toggleInlineStyle("BOLD")} />
        <StyledButton
          label="Italic"
          onClick={() => toggleInlineStyle("ITALIC")}
        />
        <StyledButton
          label="Underline"
          onClick={() => toggleInlineStyle("UNDERLINE")}
        />
        <StyledButton
          label="Strike"
          onClick={() => toggleInlineStyle("STRIKETHROUGH")}
        />

        <StyledButton
          label="• Bullet"
          onClick={() => toggleBlockType("unordered-list-item")}
        />
        <StyledButton
          label="1. Ordered"
          onClick={() => toggleBlockType("ordered-list-item")}
        />
        <StyledButton
          label="❝ Quote"
          onClick={() => toggleBlockType("blockquote")}
        />
        <StyledButton
          label="⎇ Code"
          onClick={() => toggleBlockType("code-block")}
        />
        <StyledButton
          label="↶ Undo"
          onClick={() => setEditorState(EditorState.undo(editorState))}
        />
        <StyledButton
          label="↷ Redo"
          onClick={() => setEditorState(EditorState.redo(editorState))}
        />

        <button
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-700 transition duration-300 shadow cursor-pointer"
          onClick={() => setEditorState(EditorState.createEmpty())}
        >
          Clear
        </button>

        {/* Font Style Dropdown */}
        <select
          className="px-3 py-1.5 border text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          defaultValue=""
          onChange={handleFontChange}
        >
          <option value="" disabled>
            Font Style
          </option>
          <option value="FONT_SANS">Sans</option>
          <option value="FONT_SERIF">Serif</option>
          <option value="FONT_MONO">Monospace</option>
        </select>

        {/* Font Size Dropdown */}
        <select
          className="px-3 py-1.5 border text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          defaultValue=""
          onChange={(e) => toggleFontStyle(e.target.value)}
        >
          <option value="" disabled>
            Font Size
          </option>
          <option value="FONTSIZE_12">12px</option>
          <option value="FONTSIZE_14">14px</option>
          <option value="FONTSIZE_16">16px</option>
          <option value="FONTSIZE_18">18px</option>
          <option value="FONTSIZE_20">20px</option>
          <option value="FONTSIZE_24">24px</option>
          <option value="FONTSIZE_32">32px</option>
        </select>

        <StyledButton
          label="😊 Emoji"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />

        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="image"
          accept="image/*"
          customUpload
          uploadHandler={handleImageUpload}
          chooseLabel="🖼 Upload"
          className="px-2 py-1.5 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md hover:from-indigo-600 hover:to-purple-600 transition duration-300 shadow cursor-pointer"
        />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Editor */}
      <div
        className="border border-gray-300 p-4 rounded min-h-[200px] bg-white"
        onClick={focusEditor}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          placeholder="Start typing here..."
          blockRendererFn={mediaBlockRenderer}
          customStyleMap={customStyleMap}
        />
      </div>
    </div>
  );
}
