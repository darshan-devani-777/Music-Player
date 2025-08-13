import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Spinner";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editId, setEditId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [tempAnswer, setTempAnswer] = useState({});
  const [openId, setOpenId] = useState(null);
  const [createError, setCreateError] = useState("");
  const [answerError, setAnswerError] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const LOADER_DELAY = 1000;

  // FETCH FAQS
  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        unansweredOnly
          ? "/auth/faq/get-unanswered-faq"
          : "/auth/faq/get-all-faq",
        { headers }
      );
      setFaqs(res.data.data || []);
    } catch (err) {
      console.error("Error fetching FAQs", err);
      toast.error("Failed to fetch FAQs.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // CREATE FAQ
  const handleCreate = async () => {
    if (!newQuestion.trim()) {
      setCreateError("Question cannot be empty.");
      return;
    }
    setCreateError("");

    setLoading(true);
    try {
      await api.post(
        "/auth/faq/create-faq",
        { question: newQuestion },
        { headers }
      );
      toast.success("FAQ created successfully...");
      setNewQuestion("");
      fetchFaqs();
    } catch (err) {
      console.error("Create FAQ Error", err);
      toast.error("Failed to create FAQ.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // EDIT FAQ
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(
        `/auth/faq/update-faq/${editId}`,
        { question: editQuestion, answer: editAnswer },
        { headers }
      );
      toast.success("FAQ updated successfully...");
      setEditId(null);
      setEditQuestion("");
      setEditAnswer("");
      fetchFaqs();
    } catch (err) {
      console.error("Update FAQ Error", err);
      toast.error("Failed to update FAQ.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // DELETE FAQ
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    setLoading(true);
    try {
      await api.delete(`/auth/faq/delete-faq/${id}`, { headers });
      toast.success("FAQ deleted successfully...");
      fetchFaqs();
    } catch (err) {
      console.error("Delete FAQ Error", err);
      toast.error("Failed to delete FAQ.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // ANSWER FAQ
  const handleAnswer = async (id, answer) => {
    if (!answer.trim()) {
      setAnswerError((prev) => ({ ...prev, [id]: "Answer cannot be empty." }));
      return;
    }
    setAnswerError((prev) => ({ ...prev, [id]: "" }));

    setLoading(true);
    try {
      await api.put(`/auth/faq/answer-faq/${id}`, { answer }, { headers });
      toast.success("FAQ answered successfully...");
      fetchFaqs();
    } catch (err) {
      console.error("Answer FAQ Error", err);
      toast.error("Failed to answer FAQ.");
    } finally {
      setTimeout(() => setLoading(false), LOADER_DELAY);
    }
  };

  // OPEN EDIT FORM
  const handleEdit = (faq) => {
    setEditId(faq._id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer || "");
  };

  useEffect(() => {
    fetchFaqs();
  }, [unansweredOnly]);

  return (
    <div className="min-h-full mx-auto px-2">
      {/* Loader */}
      {loading && <Loader />}
      
      {!loading && (
        <>
          <h2 className="text-2xl font-sans font-semibold underline">
            Frequently Asked Questions
          </h2>

          {/* Filter */}
          <div className="flex justify-end mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={unansweredOnly}
                onChange={(e) => setUnansweredOnly(e.target.checked)}
                className="form-checkbox cursor-pointer"
              />
              Show only unanswered
            </label>
          </div>

          {/* Create FAQ */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-5">
            <div className="flex-1 flex flex-col">
              <input
                type="text"
                className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 text-sm placeholder:text-sm
        ${
          createError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
        }`}
                placeholder="Enter a new FAQ question..."
                value={newQuestion}
                onChange={(e) => {
                  setNewQuestion(e.target.value);
                  if (createError) setCreateError("");
                }}
              />
              {createError && (
                <p className="text-red-600 text-sm mt-1">{createError}</p>
              )}
            </div>
            <button
              onClick={handleCreate}
              className="bg-purple-600 text-white px-3 py-2 text-[13px] rounded-sm hover:bg-purple-800 transition duration-300 cursor-pointer"
            >
              Add FAQ
            </button>
          </div>

          {/* FAQ List */}
          <div className="space-y-5 mt-10">
            {faqs.length === 0 ? (
              <p className="text-center text-gray-500">No FAQs found.</p>
            ) : (
              faqs.map((faq) => {
                const isOpen = openId === faq._id;
                return (
                  <div
                    key={faq._id}
                    className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 bg-white"
                  >
                    {/* Question Header */}
                    <div
                      onClick={() => setOpenId(isOpen ? null : faq._id)}
                      className="cursor-pointer p-2 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white hover:from-blue-100"
                    >
                      <h3 className="text-md font-semibold text-gray-800">
                        {faq.question}
                      </h3>
                      <FiChevronDown
                        className={`text-2xl text-purple-600 transition-transform duration-300 transform ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>

                    {/* Answer Area */}
                    <div
                      className={`transition-all duration-400 ease-in-out ${
                        isOpen ? "max-h-[600px] p-5" : "max-h-0 p-0"
                      } overflow-hidden bg-white text-gray-400 text-sm`}
                    >
                      {editId === faq._id ? (
                        <>
                          <input
                            className="w-full border px-3 py-1 mb-2 rounded-lg"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                          />
                          <textarea
                            className="w-full border px-3 py-1 mb-2 rounded-lg"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            placeholder="Answer..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
                              className="bg-green-500 transition duration-300 cursor-pointer hover:bg-green-600 text-white px-2 py-1 rounded-md text-[12px]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="bg-gray-300 transition duration-300 cursor-pointer hover:bg-gray-400 text-black px-2 py-1 rounded-md text-[12px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {faq.answer || tempAnswer[faq._id]?.trim() ? (
                            <p className="mb-3">{faq.answer}</p>
                          ) : (
                            <em className="text-red-500 mb-3 block">
                              No answer yet
                            </em>
                          )}

                          {!faq.answer && (
                            <div className="mt-2 flex items-start gap-2">
                              <div className="flex-1 flex flex-col">
                                <input
                                  type="text"
                                  placeholder="Write answer..."
                                  className={`border px-2 py-1 rounded-lg ${
                                    answerError[faq._id]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  value={tempAnswer[faq._id] || ""}
                                  onChange={(e) => {
                                    setTempAnswer((prev) => ({
                                      ...prev,
                                      [faq._id]: e.target.value,
                                    }));
                                    if (answerError[faq._id]) {
                                      setAnswerError((prev) => ({
                                        ...prev,
                                        [faq._id]: "",
                                      }));
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAnswer(
                                        faq._id,
                                        tempAnswer[faq._id]
                                      );
                                      setTempAnswer((prev) => ({
                                        ...prev,
                                        [faq._id]: "",
                                      }));
                                    }
                                  }}
                                />
                                {/* Error message below input */}
                                {answerError[faq._id] && (
                                  <p className="text-red-600 text-xs mt-1">
                                    {answerError[faq._id]}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  handleAnswer(faq._id, tempAnswer[faq._id]);
                                  setTempAnswer((prev) => ({
                                    ...prev,
                                    [faq._id]: "",
                                  }));
                                }}
                                className="bg-indigo-600 hover:bg-indigo-800 transition duration-300 cursor-pointer text-white px-3 py-1 rounded-lg self-center"
                              >
                                Send
                              </button>
                            </div>
                          )}

                          <div className="mt-3 flex gap-4 text-sm">
                            <button
                              onClick={() => handleEdit(faq)}
                              className="px-2 py-1 bg-yellow-400 text-white rounded-md text-[12px] cursor-pointer transition duration-300 hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(faq._id)}
                              className="px-2 py-1 bg-red-400 text-white rounded-md text-[12px] cursor-pointer transition duration-300 hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
