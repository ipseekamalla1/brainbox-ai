"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface Question {
  id: string;
  type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface ExamItem {
  id: string;
  title: string;
  description?: string;
  timeLimit: number;
  isPublished: boolean;
  createdAt: string;
  sections: { _count: { questions: number }; title: string }[];
  _count: { attempts: number };
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const emptySection = (): Section => ({
  id: Math.random().toString(36).slice(2),
  title: "",
  description: "",
  questions: [],
});

const emptyQuestion = (): Question => ({
  id: Math.random().toString(36).slice(2),
  type: "MCQ",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 1,
});

const totalQuestions = (exam: ExamItem) =>
  exam.sections.reduce((sum, s) => sum + s._count.questions, 0);

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function TeacherExamsPage() {
  const { data: session } = useSession();

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("60");
  const [sections, setSections] = useState<Section[]>([emptySection()]);

  /* ─────────────────────────────
     FETCH EXAMS
  ───────────────────────────── */

  const fetchExams = useCallback(async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (data.success) setExams(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchExams();
  }, [session?.user?.id, fetchExams]);

  /* ─────────────────────────────
     CREATE EXAM (FIXED MISSING FUNCTION)
  ───────────────────────────── */

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          timeLimit: Number(timeLimit),
          sections,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowCreate(false);
        setTitle("");
        setTimeLimit("60");
        setSections([emptySection()]);
        fetchExams();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────────────────
     TOGGLE PUBLISH (FIXED MISSING FUNCTION)
  ───────────────────────────── */

  const togglePublish = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });

      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  /* ─────────────────────────────
     QUESTION HELPERS
  ───────────────────────────── */

  const updateQuestion = (
    sectionId: string,
    qId: string,
    field: keyof Question,
    value: string | number | string[]
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === qId ? { ...q, [field]: value } : q
              ),
            }
          : s
      )
    );
  };

  const addQuestion = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, emptyQuestion()] }
          : s
      )
    );
  };

  const removeQuestion = (sectionId: string, qId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.filter((q) => q.id !== qId),
            }
          : s
      )
    );
  };

  /* ─────────────────────────────
     UI
───────────────────────────────────────────── */

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-bold">Exams</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-primary text-white rounded-xl"
        >
          {showCreate ? "Cancel" : "+ Create Exam"}
        </button>
      </div>

      {/* CREATE FORM */}
      {showCreate && (
        <div className="p-6 border rounded-xl mb-6 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Exam title"
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Time limit"
          />

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="border p-3 rounded">
              <input
                value={section.title}
                onChange={(e) =>
                  setSections((prev) =>
                    prev.map((s) =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    )
                  )
                }
                placeholder="Section title"
                className="w-full p-2 border rounded mb-2"
              />

              {section.questions.map((q, qi) => (
                <div key={q.id} className="mb-2">
                  <input
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(section.id, q.id, "question", e.target.value)
                    }
                    placeholder={`Q${qi + 1}`}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}

              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-500 text-sm"
              >
                + Add Question
              </button>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Create Exam"}
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div key={exam.id} className="border p-4 rounded">
              <h3 className="font-semibold">{exam.title}</h3>

              <p className="text-sm text-gray-500">
                {totalQuestions(exam)} questions · {exam._count.attempts} attempts
              </p>

              <button
                onClick={() => togglePublish(exam.id, exam.isPublished)}
                className={`mt-2 px-3 py-1 text-xs rounded ${
                  exam.isPublished
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {exam.isPublished ? "Published" : "Draft"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}