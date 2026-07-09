import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("general");

  const [editId, setEditId] = useState(null);

  // ---------------- FETCH FAQS ----------------
  const fetchFaqs = async () => {
    try {
      const res = await axios.get(
        "https://chatbot-backend-production-fe14.up.railway.app/api/admin/faqs"
      );

      setFaqs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFaqs();
  }, []);

  // ---------------- ADD FAQ ----------------
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://chatbot-backend-production-fe14.up.railway.app/api/admin/add-faq",
        {
          question,
          answer,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      resetForm();
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- DELETE FAQ ----------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://chatbot-backend-production-fe14.up.railway.app/api/admin/delete-faq/${id}`
      );

      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- EDIT FAQ ----------------
  const startEdit = (faq) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "general");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ---------------- UPDATE FAQ ----------------
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `https://chatbot-backend-production-fe14.up.railway.app/api/admin/update-faq/${editId}`,
        {
          question,
          answer,
          category,
        }
      );

      resetForm();
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- RESET ----------------
  const resetForm = () => {
    setEditId(null);
    setQuestion("");
    setAnswer("");
    setCategory("general");
  };

  // ---------------- FILTER ----------------
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      faq.answer
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              FAQ Admin Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Manage your AI chatbot knowledge base
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10
              backdrop-blur-xl text-white placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <span className="absolute right-4 top-3.5 text-gray-500">
              🔍
            </span>
          </div>
        </div>

        {/* FORM */}
        <div
          className="bg-white/5 border border-white/10 backdrop-blur-2xl
          rounded-3xl p-6 shadow-2xl mb-10"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">
              {editId ? "Edit FAQ" : "Create FAQ"}
            </h2>

            {editId && (
              <button
                onClick={resetForm}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form
            onSubmit={editId ? handleUpdate : handleAdd}
            className="space-y-5"
          >
            {/* QUESTION */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Question
              </label>

              <input
                type="text"
                placeholder="Enter FAQ question..."
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10
                text-white placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            {/* ANSWER */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Answer
              </label>

              <textarea
                rows={5}
                placeholder="Enter FAQ answer..."
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10
                text-white placeholder:text-gray-500 resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Category
              </label>

              <select
                   className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10
                   text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                       <option className="bg-slate-900" value="greeting">
                             Greeting
                        </option>

  <option className="bg-slate-900" value="farewell">
    Farewell
  </option>

  <option className="bg-slate-900" value="order_status">
    Order Status
  </option>

  <option className="bg-slate-900" value="refund">
    Refund
  </option>

  <option className="bg-slate-900" value="password_reset">
    Password Reset
  </option>

  <option className="bg-slate-900" value="billing">
    Billing
  </option>

  <option className="bg-slate-900" value="technical_support">
    Technical Support
  </option>

  <option className="bg-slate-900" value="product_info">
    Product Info
  </option>

  <option className="bg-slate-900" value="complaint">
    Complaint
  </option>

  <option className="bg-slate-900" value="human_agent">
    Human Agent
  </option>

  <option className="bg-slate-900" value="thanks">
    Thanks
  </option>
</select>
            </div>

            {/* BUTTON */}
            <button
              className="w-full py-3 rounded-2xl font-semibold text-white
              bg-linear-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700
              transition-all duration-200 active:scale-95
              shadow-lg hover:shadow-blue-500/30"
            >
              {editId ? "Update FAQ" : "Add FAQ"}
            </button>
          </form>
        </div>

        {/* FAQ GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="group relative overflow-hidden
              bg-white/5 border border-white/10
              backdrop-blur-2xl rounded-3xl p-6
              hover:border-blue-500/40
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-2xl hover:shadow-blue-500/10"
            >

              {/* CATEGORY */}
              <div className="flex items-center justify-between mb-5">

                <span
                  className="px-3 py-1 text-xs font-medium rounded-full
                  bg-blue-500/15 text-blue-300 border border-blue-500/20"
                >
                  {faq.category || "general"}
                </span>

                <span className="text-xs text-gray-500">
                  FAQ #{faq.id}
                </span>
              </div>

              {/* QUESTION */}
              <h3 className="text-lg font-semibold text-white leading-relaxed">
                {faq.question}
              </h3>

              {/* ANSWER */}
              <p className="text-gray-400 mt-4 leading-7 text-sm">
                {faq.answer}
              </p>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => startEdit(faq)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium
                  bg-yellow-500/20 text-yellow-300 border border-yellow-500/20
                  hover:bg-yellow-500/30 transition"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(faq.id)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium
                  bg-red-500/20 text-red-300 border border-red-500/20
                  hover:bg-red-500/30 transition"
                >
                  🗑️ Delete
                </button>

              </div>
            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {filteredFaqs.length === 0 && (
          <div
            className="mt-16 text-center p-10 rounded-3xl
            bg-white/5 border border-white/10"
          >
            <h3 className="text-2xl font-semibold text-white">
              No FAQs Found
            </h3>

            <p className="text-gray-400 mt-2">
              Try adjusting your search or add a new FAQ.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
