"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Question {
  id: string;
  type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  isPublished: boolean;
  createdAt: string;
  _count: { questions: number; attempts: number };
}

const emptyQuestion = (): Question => ({
  id: crypto.randomUUID(),
  type: "MCQ",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 1,
});

export default function TeacherQuizzesPage() {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/quizzes");
      const data: { success: boolean; data: Quiz[] } = await res.json();
      if (data.success) setQuizzes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchQuizzes();
  }, [session?.user?.id, fetchQuizzes]);

  // ✅ TYPE-SAFE FUNCTION (NO ANY)
  const updateQuestion = <K extends keyof Question>(
    id: string,
    field: K,
    value: Question[K]
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        if (field === "options") {
          return { ...q, options: value as string[], correctAnswer: "" };
        }

        return { ...q, [field]: value };
      })
    );
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;

        const newOptions = q.options.map((o, i) =>
          i === index ? value : o
        );

        const correctAnswer =
          q.correctAnswer === q.options[index] ? "" : q.correctAnswer;

        return { ...q, options: newOptions, correctAnswer };
      })
    );
  };

  const validateQuestions = () => {
    return questions.filter((q) => {
      if (!q.question.trim()) return false;

      if (q.type === "MCQ") {
        return (
          q.options.some((o) => o.trim()) &&
          q.correctAnswer.trim()
        );
      }

      if (q.type === "SHORT_ANSWER") {
        return q.correctAnswer.trim();
      }

      if (q.type === "LONG_ANSWER") {
        return true;
      }

      return false;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const validQs = validateQuestions();
    if (validQs.length === 0) return;

    setSaving(true);

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          timeLimit: timeLimit ? Number(timeLimit) : undefined,
          questions: validQs.map((q, i) => ({
            type: q.type,
            question: q.question,
            options:
              q.type === "MCQ"
                ? q.options.filter((o) => o.trim())
                : undefined,
            correctAnswer:
              q.type === "LONG_ANSWER" ? "" : q.correctAnswer,
            points: q.points || 1,
            order: i,
          })),
        }),
      });

      const data: { success: boolean; data: Quiz } = await res.json();

      if (data.success) {
        setQuizzes((prev) => [data.data, ...prev]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowCreate(false);
    setTitle("");
    setDescription("");
    setTimeLimit("");
    setQuestions([emptyQuestion()]);
  };

  const togglePublish = async (quizId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });

      if (res.ok) {
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === quizId
              ? { ...q, isPublished: !current }
              : q
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <button
          onClick={() =>
            showCreate ? resetForm() : setShowCreate(true)
          }
          className="px-4 py-2 bg-primary text-white rounded-xl"
        >
          {showCreate ? "Cancel" : "+ Create Quiz"}
        </button>
      </div>

      {showCreate && (
        <div className="p-6 border rounded-xl space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
            className="w-full border p-2 rounded"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border p-2 rounded"
          />

          {questions.map((q, i) => (
            <div key={q.id} className="border p-3 rounded space-y-2">
              <textarea
                value={q.question}
                onChange={(e) =>
                  updateQuestion(q.id, "question", e.target.value)
                }
                placeholder={`Question ${i + 1}`}
                className="w-full border p-2 rounded"
              />

              <select
                value={q.type}
                onChange={(e) =>
                  updateQuestion(q.id, "type", e.target.value as Question["type"])
                }
                className="border p-1 rounded"
              >
                <option value="MCQ">MCQ</option>
                <option value="SHORT_ANSWER">Short</option>
                <option value="LONG_ANSWER">Long</option>
              </select>

              {q.type === "MCQ" &&
                q.options.map((opt, oi) => (
                  <input
                    key={oi}
                    value={opt}
                    onChange={(e) =>
                      updateOption(q.id, oi, e.target.value)
                    }
                    placeholder={`Option ${oi + 1}`}
                    className="w-full border p-1 rounded"
                  />
                ))}

              {q.type !== "LONG_ANSWER" && (
                <input
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(q.id, "correctAnswer", e.target.value)
                  }
                  placeholder="Correct answer"
                  className="w-full border p-1 rounded"
                />
              )}
            </div>
          ))}

          <button
            onClick={() =>
              setQuestions((prev) => [...prev, emptyQuestion()])
            }
          >
            + Add Question
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {!loading &&
        quizzes.map((q) => (
          <div key={q.id} className="border p-3 mt-2 rounded">
            {q.title}
            <button onClick={() => togglePublish(q.id, q.isPublished)}>
              {q.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        ))}
    </div>
  );
}