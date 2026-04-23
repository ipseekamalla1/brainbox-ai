// prisma/seed.ts — Brainbox AI Database Seeder
// Run: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Brainbox AI database...\n");

  // ─── Clear existing data ──────────────────────────


  // ─── Users ────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@brainbox.ai",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: "Dr. James Smith",
      email: "james.smith@university.edu",
      passwordHash: password,
      role: "TEACHER",
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Prof. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      passwordHash: password,
      role: "TEACHER",
    },
  });

  const students = await Promise.all(
    [
      { name: "Alex Chen", email: "alex.chen@student.edu" },
      { name: "Priya Sharma", email: "priya.sharma@student.edu" },
      { name: "Maria Garcia", email: "maria.garcia@student.edu" },
      { name: "James Kim", email: "james.kim@student.edu" },
      { name: "Emily Davis", email: "emily.davis@student.edu" },
    ].map((s) =>
      prisma.user.create({
        data: { ...s, passwordHash: password, role: "STUDENT" },
      })
    )
  );

  console.log("✓ Created 8 users (1 admin, 2 teachers, 5 students)");

  // ─── Courses ──────────────────────────────────────
  const cs101 = await prisma.course.create({
    data: {
      title: "Introduction to Computer Science",
      description: "Fundamental concepts of CS including data structures, algorithms, and complexity analysis.",
      subject: "Computer Science",
      code: "CS101",
    },
  });

  const math201 = await prisma.course.create({
    data: {
      title: "Calculus II",
      description: "Integration techniques, sequences, series, and multivariable calculus.",
      subject: "Mathematics",
      code: "MATH201",
    },
  });

  const phys101 = await prisma.course.create({
    data: {
      title: "Physics I — Mechanics",
      description: "Newtonian mechanics, energy, momentum, and rotational dynamics.",
      subject: "Physics",
      code: "PHYS101",
    },
  });

  console.log("✓ Created 3 courses");

  // ─── Enrollments ──────────────────────────────────
  const enrollments = [];
  for (const student of students) {
    enrollments.push(
      prisma.enrollment.create({ data: { userId: student.id, courseId: cs101.id, role: "STUDENT" } }),
      prisma.enrollment.create({ data: { userId: student.id, courseId: math201.id, role: "STUDENT" } })
    );
  }
  // Enroll first 3 students in physics
  for (let i = 0; i < 3; i++) {
    enrollments.push(
      prisma.enrollment.create({ data: { userId: students[i].id, courseId: phys101.id, role: "STUDENT" } })
    );
  }
  // Teachers
  enrollments.push(
    prisma.enrollment.create({ data: { userId: teacher1.id, courseId: cs101.id, role: "TEACHER" } }),
    prisma.enrollment.create({ data: { userId: teacher1.id, courseId: phys101.id, role: "TEACHER" } }),
    prisma.enrollment.create({ data: { userId: teacher2.id, courseId: math201.id, role: "TEACHER" } })
  );
  await Promise.all(enrollments);

  console.log("✓ Created enrollments");

  // ─── Notes ────────────────────────────────────────
  const notesData = [
    { title: "Introduction to Data Structures", subject: "Computer Science", topic: "Arrays & Linked Lists", fileType: "pdf", uploadedBy: teacher1.id, courseId: cs101.id, summary: "Covers fundamental data structures including arrays, linked lists, stacks, and queues. Key concepts include time complexity analysis, memory allocation patterns, and traversal algorithms." },
    { title: "Binary Search Trees", subject: "Computer Science", topic: "Trees", fileType: "pdf", uploadedBy: teacher1.id, courseId: cs101.id, summary: "Comprehensive overview of BST operations: insertion O(log n), deletion (3 cases), and traversals (in-order, pre-order, post-order). Includes balanced BST variants." },
    { title: "Sorting Algorithms Comparison", subject: "Computer Science", topic: "Algorithms", fileType: "pptx", uploadedBy: teacher1.id, courseId: cs101.id },
    { title: "Graph Theory Fundamentals", subject: "Computer Science", topic: "Graphs", fileType: "pdf", uploadedBy: teacher1.id, courseId: cs101.id },
    { title: "Integration Techniques", subject: "Mathematics", topic: "Integration", fileType: "pdf", uploadedBy: teacher2.id, courseId: math201.id, summary: "Covers integration by parts, trigonometric substitution, partial fractions, and improper integrals with worked examples." },
    { title: "Sequences and Series", subject: "Mathematics", topic: "Series", fileType: "docx", uploadedBy: teacher2.id, courseId: math201.id },
    { title: "Newton's Laws of Motion", subject: "Physics", topic: "Mechanics", fileType: "pdf", uploadedBy: teacher1.id, courseId: phys101.id },
    { title: "Energy and Work", subject: "Physics", topic: "Energy", fileType: "pptx", uploadedBy: teacher1.id, courseId: phys101.id },
  ];

  for (const note of notesData) {
    await prisma.note.create({
      data: {
        ...note,
        fileUrl: `https://firebasestorage.googleapis.com/v0/b/demo/o/${encodeURIComponent(note.title.toLowerCase().replace(/ /g, "_"))}.${note.fileType}?alt=media`,
        fileSize: Math.floor(Math.random() * 5000000) + 500000,
      },
    });
  }

  console.log("✓ Created 8 notes");

  // ─── Videos ───────────────────────────────────────
  const videosData = [
    { title: "Arrays Explained — Full Lecture", description: "Complete introduction to arrays, operations, and complexity.", duration: 2400, uploadedBy: teacher1.id, courseId: cs101.id },
    { title: "Linked Lists Deep Dive", duration: 1800, uploadedBy: teacher1.id, courseId: cs101.id },
    { title: "Binary Search Tree Operations", duration: 2100, uploadedBy: teacher1.id, courseId: cs101.id },
    { title: "Merge Sort & Quick Sort", duration: 2700, uploadedBy: teacher1.id, courseId: cs101.id },
    { title: "Integration by Parts — Worked Examples", duration: 3000, uploadedBy: teacher2.id, courseId: math201.id },
    { title: "Taylor Series Intuition", duration: 1500, uploadedBy: teacher2.id, courseId: math201.id },
  ];

  const createdVideos = [];
  for (const v of videosData) {
    const video = await prisma.video.create({
      data: { ...v, url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` },
    });
    createdVideos.push(video);
  }

  // Add video progress for students
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < createdVideos.length; j++) {
      const watched = Math.floor(Math.random() * (createdVideos[j].duration || 1800));
      await prisma.videoProgress.create({
        data: {
          userId: students[i].id,
          videoId: createdVideos[j].id,
          watchedSeconds: watched,
          completed: watched > (createdVideos[j].duration || 1800) * 0.9,
        },
      });
    }
  }

  console.log("✓ Created 6 videos with progress tracking");

  // ─── Quizzes ──────────────────────────────────────
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Data Structures Fundamentals",
      description: "Test your knowledge of arrays, linked lists, stacks, and queues.",
      courseId: cs101.id,
      createdById: teacher1.id,
      timeLimit: 15,
      isPublished: true,
      questions: {
        create: [
          { type: "MCQ", question: "What is the time complexity of accessing an element in an array by index?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correctAnswer: "O(1)", points: 1, order: 0 },
          { type: "MCQ", question: "Which data structure uses LIFO ordering?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: "Stack", points: 1, order: 1 },
          { type: "MCQ", question: "What is the worst-case time complexity of inserting at the beginning of an array?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(n)", points: 2, order: 2 },
          { type: "SHORT_ANSWER", question: "What data structure uses FIFO ordering?", correctAnswer: "Queue", points: 1, order: 3 },
          { type: "MCQ", question: "In a singly linked list, what is the time complexity of deleting the last node?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(n)", points: 2, order: 4 },
        ],
      },
    },
    include: { questions: true },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Sorting Algorithms",
      description: "MCQ quiz covering comparison-based sorting algorithms.",
      courseId: cs101.id,
      createdById: teacher1.id,
      timeLimit: 10,
      isPublished: true,
      questions: {
        create: [
          { type: "MCQ", question: "Which sorting algorithm has O(n log n) average AND worst case?", options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Selection Sort"], correctAnswer: "Merge Sort", points: 2, order: 0 },
          { type: "MCQ", question: "Which sort is in-place but NOT stable?", options: ["Merge Sort", "Insertion Sort", "Quick Sort", "Bubble Sort"], correctAnswer: "Quick Sort", points: 2, order: 1 },
          { type: "MCQ", question: "What is the best-case time complexity of Bubble Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"], correctAnswer: "O(n)", points: 1, order: 2 },
          { type: "SHORT_ANSWER", question: "Name a stable O(n log n) sorting algorithm.", correctAnswer: "Merge Sort", points: 2, order: 3 },
        ],
      },
    },
    include: { questions: true },
  });

  const quiz3 = await prisma.quiz.create({
    data: {
      title: "Integration Techniques",
      description: "Test your integration skills.",
      courseId: math201.id,
      createdById: teacher2.id,
      timeLimit: 20,
      isPublished: true,
      questions: {
        create: [
          { type: "MCQ", question: "∫ x·eˣ dx is best solved using:", options: ["Substitution", "Integration by Parts", "Partial Fractions", "Trig Substitution"], correctAnswer: "Integration by Parts", points: 1, order: 0 },
          { type: "MCQ", question: "∫ 1/(x²+1) dx equals:", options: ["ln(x²+1)", "arctan(x)", "arcsin(x)", "1/x"], correctAnswer: "arctan(x)", points: 2, order: 1 },
          { type: "SHORT_ANSWER", question: "What is ∫ 1/x dx?", correctAnswer: "ln|x| + C", points: 1, order: 2 },
        ],
      },
    },
    include: { questions: true },
  });

  console.log("✓ Created 3 quizzes with questions");

  // ─── Quiz Attempts ────────────────────────────────
  // Simulate students taking quizzes with varied scores
  const quizAttemptData = [
    { quiz: quiz1, student: students[0], answers: ["O(1)", "Stack", "O(n)", "Queue", "O(n)"] },
    { quiz: quiz1, student: students[1], answers: ["O(1)", "Stack", "O(n)", "Queue", "O(log n)"] },
    { quiz: quiz1, student: students[2], answers: ["O(n)", "Queue", "O(n)", "Queue", "O(n)"] },
    { quiz: quiz1, student: students[3], answers: ["O(1)", "Stack", "O(1)", "Stack", "O(n)"] },
    { quiz: quiz2, student: students[0], answers: ["Merge Sort", "Quick Sort", "O(n)", "Merge Sort"] },
    { quiz: quiz2, student: students[1], answers: ["Quick Sort", "Quick Sort", "O(n)", "Merge Sort"] },
    { quiz: quiz2, student: students[4], answers: ["Merge Sort", "Quick Sort", "O(n²)", "Bubble Sort"] },
    { quiz: quiz3, student: students[0], answers: ["Integration by Parts", "arctan(x)", "ln|x| + C"] },
    { quiz: quiz3, student: students[1], answers: ["Substitution", "arctan(x)", "ln|x| + C"] },
  ];

  for (const ad of quizAttemptData) {
    const questions = ad.quiz.questions;
    let score = 0;
    const maxScore = questions.reduce((s, q) => s + q.points, 0);

    const attempt = await prisma.quizAttempt.create({
      data: { quizId: ad.quiz.id, userId: ad.student.id },
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = ad.answers[i] || "";
      const isCorrect = ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) score += q.points;

      await prisma.quizAnswer.create({
        data: { attemptId: attempt.id, questionId: q.id, answer: ans, isCorrect },
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;
    await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: { score, maxScore, percentage, submittedAt: new Date(Date.now() - Math.random() * 7 * 86400000) },
    });
  }

  console.log("✓ Created 9 quiz attempts with graded answers");

  // ─── Exam ─────────────────────────────────────────
  const exam1 = await prisma.exam.create({
    data: {
      title: "CS101 — Midterm Examination",
      description: "Comprehensive midterm covering data structures and algorithms.",
      courseId: cs101.id,
      createdById: teacher1.id,
      timeLimit: 60,
      isPublished: true,
      sections: {
        create: [
          {
            title: "Section A: Multiple Choice",
            description: "Choose the best answer for each question.",
            order: 0,
            questions: {
              create: [
                { type: "MCQ", question: "Which traversal of a BST gives sorted output?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], correctAnswer: "In-order", points: 2, order: 0 },
                { type: "MCQ", question: "The height of a balanced BST with n nodes is:", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: "O(log n)", points: 2, order: 1 },
                { type: "MCQ", question: "BFS uses which data structure?", options: ["Stack", "Queue", "Heap", "Array"], correctAnswer: "Queue", points: 2, order: 2 },
              ],
            },
          },
          {
            title: "Section B: Short Answer",
            description: "Answer each question concisely.",
            order: 1,
            questions: {
              create: [
                { type: "SHORT_ANSWER", question: "What is the time complexity of Dijkstra's algorithm with a binary heap?", correctAnswer: "O((V+E) log V)", points: 3, order: 0 },
                { type: "SHORT_ANSWER", question: "Name the graph traversal that can detect cycles.", correctAnswer: "DFS", points: 2, order: 1 },
              ],
            },
          },
          {
            title: "Section C: Long Answer",
            description: "Write detailed answers.",
            order: 2,
            questions: {
              create: [
                { type: "LONG_ANSWER", question: "Compare and contrast BFS and DFS. Include time complexity, space complexity, and use cases for each.", points: 8, order: 0 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✓ Created 1 exam with 3 sections");

  // ─── Contact Messages ─────────────────────────────
  await prisma.contactMessage.createMany({
    data: [
      { name: "John Doe", email: "john@example.com", subject: "Feature Request", message: "Would love to see a mobile app version of Brainbox AI!" },
      { name: "Jane Smith", email: "jane@example.com", subject: "Partnership", message: "Interested in integrating Brainbox AI with our university LMS." },
    ],
  });

  console.log("✓ Created 2 contact messages");

  // ─── Summary ──────────────────────────────────────
  console.log("\n✅ Seeding complete!\n");
  console.log("┌─────────────────────────────────────────┐");
  console.log("│  Demo Login Credentials                 │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│  Admin:   admin@brainbox.ai             │");
  console.log("│  Teacher: james.smith@university.edu    │");
  console.log("│  Teacher: sarah.johnson@university.edu  │");
  console.log("│  Student: alex.chen@student.edu         │");
  console.log("│  Student: priya.sharma@student.edu      │");
  console.log("│                                         │");
  console.log("│  Password (all): password123            │");
  console.log("└─────────────────────────────────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());