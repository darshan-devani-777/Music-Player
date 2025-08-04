import React, { useState, useRef } from "react";
import api from "../api/axios";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  AtomicBlockUtils,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { FileUpload } from "primereact/fileupload";
import EmojiPicker from "emoji-picker-react";
import imageCompression from "browser-image-compression";

export default function PrimeTextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const editorRef = useRef(null);
  const fileUploadRef = useRef(null);

  const focusEditor = () => editorRef.current.focus();

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (type) => {
    setEditorState(RichUtils.toggleBlockType(editorState, type));
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

  const handleImageUpload = async (event) => {
    const file = event.files[0];
    if (!file) return;
    fileUploadRef.current.clear();

    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
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

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression failed", error);
    }
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
    COLOR_DYNAMIC: { color: textColor },
    BG_DYNAMIC: { backgroundColor: bgColor },
    FONT_SIZE: { fontSize: fontSize },
    FONT_FAMILY: { fontFamily: fontFamily },
  };

  const StyledButton = ({ label, onClick, active }) => (
    <button
      onClick={onClick}
      className={`px-2 py-[2px] text-[13px] font-medium font-sans border rounded focus:outline-none
        ${
          active
            ? "bg-gray-300 text-gray-900 border-gray-400 cursor-pointer"
            : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
        }
      `}
    >
      {label}
    </button>
  );

  const currentStyle = editorState.getCurrentInlineStyle();
  const blockType = RichUtils.getCurrentBlockType(editorState);

  const handleSend = async () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const token = localStorage.getItem("token");

    try {
      const response = await api.post(
        "/auth/editor/add-content",
        { content: rawContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("✅ Content Saved Successfully...!");
      setEditorState(EditorState.createEmpty());
    } catch (error) {
      alert(
        "Save failed: " +
          (error.response?.data?.message || "Something went wrong")
      );
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold text-gray-800 underline mb-5">
      ✍️ Text Editor
      </h2>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center border-b border-b-gray-300 mb-8 pb-5">
        <StyledButton
          label="𝐁"
          onClick={() => toggleInlineStyle("BOLD")}
          active={currentStyle.has("BOLD")}
        />

        <StyledButton
          label="𝐼"
          onClick={() => toggleInlineStyle("ITALIC")}
          active={currentStyle.has("ITALIC")}
        />

        <StyledButton
          label="𝑈"
          onClick={() => toggleInlineStyle("UNDERLINE")}
          active={currentStyle.has("UNDERLINE")}
        />

        <StyledButton
          label="𝑆"
          onClick={() => toggleInlineStyle("STRIKETHROUGH")}
          active={currentStyle.has("STRIKETHROUGH")}
        />

        <StyledButton
          label="•"
          onClick={() => toggleBlockType("unordered-list-item")}
          active={blockType === "unordered-list-item"}
        />

        <StyledButton
          label="1."
          onClick={() => toggleBlockType("ordered-list-item")}
          active={blockType === "ordered-list-item"}
        />

        <StyledButton
          label="❝"
          onClick={() => toggleBlockType("blockquote")}
          active={blockType === "blockquote"}
        />

        <StyledButton
          label="</>"
          onClick={() => toggleBlockType("code-block")}
          active={blockType === "code-block"}
        />

        <StyledButton
          label="⤺"
          onClick={() => setEditorState(EditorState.undo(editorState))}
        />

        <StyledButton
          label="⤻"
          onClick={() => setEditorState(EditorState.redo(editorState))}
        />

        <StyledButton
          label="❌"
          onClick={() => setEditorState(EditorState.createEmpty())}
        />

        {/* Controls */}
        <label className="text-sm text-gray-500">Text:</label>
        <input
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            toggleInlineStyle("COLOR_DYNAMIC");
          }}
          className="w-9 h-7 border rounded border-gray-300 cursor-pointer hover:bg-gray-100 active:bg-gray-300"
        />

        <label className="text-sm text-gray-500">BG:</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => {
            setBgColor(e.target.value);
            toggleInlineStyle("BG_DYNAMIC");
          }}
          className="w-9 h-7 border border-gray-300 rounded hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
        />

        <label className="text-sm text-gray-500">Size:</label>
        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            toggleInlineStyle("FONT_SIZE");
          }}
          className="text-sm px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 active:bg-gray-300 cursor-pointer text-gray-500"
        >
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>

        <label className="text-sm text-gray-500">Font:</label>
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            toggleInlineStyle("FONT_FAMILY");
          }}
          className="text-sm px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 active:bg-gray-300 cursor-pointer text-gray-500"
        >
          <optgroup label="System Fonts">
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </optgroup>
          <optgroup label="Google Fonts">
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
            <option value="Raleway">Raleway</option>
            <option value="Nunito">Nunito</option>
          </optgroup>
        </select>

        <StyledButton
          label="😊"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />

        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="image"
          accept="image/*"
          customUpload
          uploadHandler={handleImageUpload}
          chooseLabel="📸"
          className="text-sm px-2 py-1 rounded bg-white transition duration-300"
        />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div
        className="DraftEditor-root min-h-[200px] border border-gray-300 text-sm p-4 rounded bg-white focus-within:ring-1 focus-within:ring-blue-400"
        onClick={focusEditor}
      >
        <div className="public-DraftEditor-content">
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

      {/* Send button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSend}
          className="px-4 py-2 text-sm text-white bg-indigo-500 rounded hover:bg-indigo-700 transition duration-300 cursor-pointer"
        >
          📤 Send
        </button>
      </div>
    </div>
  );
}
