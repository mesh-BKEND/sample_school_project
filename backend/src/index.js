const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dataFile = path.join(__dirname, "..", "data", "store.json");

const seedAdminUser = {
  id: 1,
  role: "admin",
  username: "admin",
  password: "admin123",
  displayName: "School Administrator",
  createdAt: "2026-05-16T00:00:00.000Z",
  updatedAt: "2026-05-16T00:00:00.000Z",
};

async function readStore() {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [seedAdminUser],
      students: Array.isArray(parsed.students) ? parsed.students : [],
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : [],
      fees: Array.isArray(parsed.fees) ? parsed.fees : [],
      attendanceRecords: Array.isArray(parsed.attendanceRecords)
        ? parsed.attendanceRecords
        : [],
      studentPerformance: Array.isArray(parsed.studentPerformance)
        ? parsed.studentPerformance
        : [],
      classPerformance: Array.isArray(parsed.classPerformance)
        ? parsed.classPerformance
        : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        users: [seedAdminUser],
        students: [],
        teachers: [],
        fees: [],
        attendanceRecords: [],
        studentPerformance: [],
        classPerformance: [],
      };
    }
    throw error;
  }
}

async function writeStore(store) {
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2));
}

function nextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function safeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    role: user.role,
    username: user.username,
    displayName: user.displayName,
    parentStudentId: user.parentStudentId || null,
    teacherId: user.teacherId || null,
  };
}

function withStudent(fee, students) {
  return {
    ...fee,
    student: students.find((student) => student.id === fee.studentId) || null,
  };
}

function withAttendanceStudent(record, students) {
  return {
    ...record,
    student: students.find((student) => student.id === record.studentId) || null,
  };
}

function withPerformanceStudent(record, students, teachers) {
  return {
    ...record,
    student: students.find((student) => student.id === record.studentId) || null,
    teacher: teachers.find((teacher) => teacher.id === record.teacherId) || null,
  };
}

function withClassPerformanceTeacher(record, teachers) {
  return {
    ...record,
    teacher: teachers.find((teacher) => teacher.id === record.teacherId) || null,
  };
}

function calculateAverage(scores) {
  const values = Object.values(scores)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function calculateGrade(average) {
  if (average >= 80) return "A";
  if (average >= 70) return "B";
  if (average >= 60) return "C";
  if (average >= 50) return "D";
  return "E";
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const store = await readStore();
  const user = store.users.find(
    (entry) => entry.username === username && entry.password === password,
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({ user: safeUser(user) });
});

app.get("/users", async (req, res) => {
  const store = await readStore();
  res.json(store.users.map(safeUser));
});

app.get("/teachers", async (req, res) => {
  const store = await readStore();
  res.json(
    store.teachers.map((teacher) => ({
      ...teacher,
      user: safeUser(store.users.find((user) => user.teacherId === teacher.id)),
    })),
  );
});

app.post("/teachers", async (req, res) => {
  const { fullName, username, password, assignedClass, subjects } = req.body;

  if (!fullName || !username || !password || !assignedClass) {
    return res
      .status(400)
      .json({ error: "fullName, username, password and assignedClass are required" });
  }

  try {
    const store = await readStore();

    if (store.users.some((user) => user.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const timestamp = new Date().toISOString();
    const teacher = {
      id: nextId(store.teachers),
      fullName,
      assignedClass,
      subjects: Array.isArray(subjects) ? subjects : [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const user = {
      id: nextId(store.users),
      role: "teacher",
      username,
      password,
      displayName: fullName,
      teacherId: teacher.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.teachers.unshift(teacher);
    store.users.push(user);
    await writeStore(store);

    res.status(201).json({ ...teacher, user: safeUser(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/students", async (req, res) => {
  const { parentStudentId } = req.query;
  const store = await readStore();
  let students = [...store.students];

  if (parentStudentId) {
    students = students.filter((student) => student.id === Number(parentStudentId));
  }

  students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(students);
});

app.get("/students/:id", async (req, res) => {
  const store = await readStore();
  const id = parseInt(req.params.id, 10);
  const student = store.students.find((entry) => entry.id === id);
  if (!student) return res.status(404).json({ error: "Not found" });
  res.json(student);
});

app.post("/students", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dob,
    studentClass,
    roll,
    parentName,
    phone,
    status,
    parentUsername,
    parentPassword,
  } = req.body;

  if (!firstName || !parentName || !parentUsername || !parentPassword) {
    return res.status(400).json({
      error: "firstName, parentName, parentUsername and parentPassword are required",
    });
  }

  try {
    const store = await readStore();

    if (email && store.students.some((student) => student.email === email)) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (roll && store.students.some((student) => student.roll === roll)) {
      return res.status(400).json({ error: "Roll number already exists" });
    }

    if (store.users.some((user) => user.username === parentUsername)) {
      return res.status(400).json({ error: "Parent username already exists" });
    }

    const timestamp = new Date().toISOString();
    const studentId = nextId(store.students);
    const student = {
      id: studentId,
      firstName,
      lastName: lastName || "",
      email: email || null,
      dob: dob || null,
      studentClass: studentClass || null,
      roll: roll || null,
      parentName,
      phone: phone || null,
      status: status || "Active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const parentUser = {
      id: nextId(store.users),
      role: "parent",
      username: parentUsername,
      password: parentPassword,
      displayName: parentName,
      parentStudentId: studentId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    student.parentUserId = parentUser.id;

    store.students.unshift(student);
    store.users.push(parentUser);
    await writeStore(store);

    res.status(201).json({
      ...student,
      parentUser: safeUser(parentUser),
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/students/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {
    firstName,
    lastName,
    email,
    dob,
    studentClass,
    roll,
    parentName,
    phone,
    status,
  } = req.body;
  try {
    const store = await readStore();
    const index = store.students.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Not found" });
    }

    if (
      email &&
      store.students.some((student) => student.email === email && student.id !== id)
    ) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (
      roll &&
      store.students.some((student) => student.roll === roll && student.id !== id)
    ) {
      return res.status(400).json({ error: "Roll number already exists" });
    }

    const existing = store.students[index];
    const student = {
      ...existing,
      firstName: firstName ?? existing.firstName,
      lastName: lastName ?? existing.lastName,
      email: email ?? existing.email,
      dob: dob ?? existing.dob,
      studentClass: studentClass ?? existing.studentClass,
      roll: roll ?? existing.roll,
      parentName: parentName ?? existing.parentName,
      phone: phone ?? existing.phone,
      status: status ?? existing.status,
      updatedAt: new Date().toISOString(),
    };

    store.students[index] = student;

    const parentUser = store.users.find((user) => user.id === student.parentUserId);
    if (parentUser && parentName) {
      parentUser.displayName = parentName;
      parentUser.updatedAt = new Date().toISOString();
    }

    await writeStore(store);
    res.json(student);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const store = await readStore();
    const student = store.students.find((entry) => entry.id === id);
    if (!student) {
      return res.status(404).json({ error: "Not found" });
    }

    store.students = store.students.filter((entry) => entry.id !== id);
    store.fees = store.fees.filter((fee) => fee.studentId !== id);
    store.attendanceRecords = store.attendanceRecords.filter(
      (record) => record.studentId !== id,
    );
    store.studentPerformance = store.studentPerformance.filter(
      (record) => record.studentId !== id,
    );
    if (student.parentUserId) {
      store.users = store.users.filter((user) => user.id !== student.parentUserId);
    }

    await writeStore(store);
    res.json({ deleted: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/fees", async (req, res) => {
  const { studentId } = req.query;
  const store = await readStore();
  let fees = [...store.fees];

  if (studentId) {
    fees = fees.filter((fee) => fee.studentId === Number(studentId));
  }

  fees.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(fees.map((fee) => withStudent(fee, store.students)));
});

app.post("/fees", async (req, res) => {
  const {
    studentId,
    totalFee,
    paid,
    paymentMethod,
    receiptNumber,
    lastPayment,
  } = req.body;
  try {
    const store = await readStore();
    const student = store.students.find((entry) => entry.id === Number(studentId));
    if (!student) {
      return res.status(400).json({ error: "Student not found" });
    }

    const balance = Number(totalFee) - Number(paid || 0);
    const status =
      balance === 0 ? "Paid" : balance > 0 ? "Partial" : "Overpaid";
    const timestamp = new Date().toISOString();
    const fee = {
      id: nextId(store.fees),
      studentId: Number(studentId),
      totalFee: Number(totalFee),
      paid: Number(paid || 0),
      balance,
      status,
      paymentMethod: paymentMethod || null,
      receiptNumber: receiptNumber || null,
      lastPayment: lastPayment || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.fees.unshift(fee);
    await writeStore(store);
    res.status(201).json(withStudent(fee, store.students));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/fees/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { totalFee, paid, paymentMethod, receiptNumber, lastPayment } = req.body;
  try {
    const store = await readStore();
    const index = store.fees.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Not found" });
    }

    const existing = store.fees[index];
    const balance = Number(totalFee) - Number(paid || 0);
    const status =
      balance === 0 ? "Paid" : balance > 0 ? "Partial" : "Overpaid";
    const fee = {
      ...existing,
      totalFee: Number(totalFee),
      paid: Number(paid || 0),
      balance,
      status,
      paymentMethod: paymentMethod || null,
      receiptNumber: receiptNumber || null,
      lastPayment: lastPayment || null,
      updatedAt: new Date().toISOString(),
    };

    store.fees[index] = fee;
    await writeStore(store);
    res.json(withStudent(fee, store.students));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/fees/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const store = await readStore();
    const exists = store.fees.some((fee) => fee.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Not found" });
    }

    store.fees = store.fees.filter((fee) => fee.id !== id);
    await writeStore(store);
    res.json({ deleted: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/attendance", async (req, res) => {
  const { date, studentClass, month } = req.query;
  const store = await readStore();
  let records = [...store.attendanceRecords];

  if (date) records = records.filter((record) => record.date === date);
  if (month) records = records.filter((record) => record.date.startsWith(month));
  if (studentClass) {
    records = records.filter((record) => record.studentClass === studentClass);
  }

  records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(records.map((record) => withAttendanceStudent(record, store.students)));
});

app.post("/attendance/batch", async (req, res) => {
  const { date, studentClass, records } = req.body;

  if (!date || !studentClass || !Array.isArray(records)) {
    return res.status(400).json({ error: "date, studentClass and records are required" });
  }

  try {
    const store = await readStore();
    const timestamp = new Date().toISOString();

    const normalizedRecords = records.map((record) => {
      const student = store.students.find(
        (entry) =>
          entry.id === Number(record.studentId) &&
          entry.studentClass === studentClass,
      );

      if (!student) {
        throw new Error(`Student ${record.studentId} not found in ${studentClass}`);
      }

      const existingIndex = store.attendanceRecords.findIndex(
        (entry) =>
          entry.studentId === student.id &&
          entry.date === date &&
          entry.studentClass === studentClass,
      );

      const nextRecord = {
        id:
          existingIndex >= 0
            ? store.attendanceRecords[existingIndex].id
            : nextId(store.attendanceRecords),
        studentId: student.id,
        studentClass,
        date,
        present: Boolean(record.present),
        note: record.note || null,
        createdAt:
          existingIndex >= 0
            ? store.attendanceRecords[existingIndex].createdAt
            : timestamp,
        updatedAt: timestamp,
      };

      if (existingIndex >= 0) {
        store.attendanceRecords[existingIndex] = nextRecord;
      } else {
        store.attendanceRecords.push(nextRecord);
      }

      return withAttendanceStudent(nextRecord, store.students);
    });

    await writeStore(store);
    res.status(201).json(normalizedRecords);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/performance/student", async (req, res) => {
  const { studentId, studentClass, term, status, teacherId } = req.query;
  const store = await readStore();
  let records = [...store.studentPerformance];

  if (studentId) records = records.filter((record) => record.studentId === Number(studentId));
  if (studentClass) records = records.filter((record) => record.studentClass === studentClass);
  if (term) records = records.filter((record) => record.term === term);
  if (status) records = records.filter((record) => record.status === status);
  if (teacherId) records = records.filter((record) => record.teacherId === Number(teacherId));

  records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(
    records.map((record) =>
      withPerformanceStudent(record, store.students, store.teachers),
    ),
  );
});

app.post("/performance/student", async (req, res) => {
  const { studentId, teacherId, term, scores, status } = req.body;

  if (!studentId || !teacherId || !term || !scores) {
    return res
      .status(400)
      .json({ error: "studentId, teacherId, term and scores are required" });
  }

  try {
    const store = await readStore();
    const student = store.students.find((entry) => entry.id === Number(studentId));
    const teacher = store.teachers.find((entry) => entry.id === Number(teacherId));

    if (!student) return res.status(400).json({ error: "Student not found" });
    if (!teacher) return res.status(400).json({ error: "Teacher not found" });
    if (teacher.assignedClass !== student.studentClass) {
      return res.status(400).json({ error: "Teacher is not assigned to this class" });
    }

    const normalizedScores = Object.fromEntries(
      Object.entries(scores).map(([subject, value]) => [subject, Number(value || 0)]),
    );
    const average = calculateAverage(normalizedScores);
    const grade = calculateGrade(average);
    const timestamp = new Date().toISOString();

    const existingIndex = store.studentPerformance.findIndex(
      (entry) => entry.studentId === Number(studentId) && entry.term === term,
    );

    const record = {
      id:
        existingIndex >= 0
          ? store.studentPerformance[existingIndex].id
          : nextId(store.studentPerformance),
      studentId: Number(studentId),
      teacherId: Number(teacherId),
      studentClass: student.studentClass,
      term,
      scores: normalizedScores,
      average,
      grade,
      status: status || "draft",
      createdAt:
        existingIndex >= 0
          ? store.studentPerformance[existingIndex].createdAt
          : timestamp,
      updatedAt: timestamp,
    };

    if (existingIndex >= 0) {
      store.studentPerformance[existingIndex] = record;
    } else {
      store.studentPerformance.unshift(record);
    }

    await writeStore(store);
    res.status(201).json(withPerformanceStudent(record, store.students, store.teachers));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/performance/student/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const store = await readStore();
  const index = store.studentPerformance.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Performance record not found" });
  }

  store.studentPerformance[index] = {
    ...store.studentPerformance[index],
    status: "approved",
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  res.json(
    withPerformanceStudent(
      store.studentPerformance[index],
      store.students,
      store.teachers,
    ),
  );
});

app.get("/performance/class", async (req, res) => {
  const { studentClass, teacherId, term, status } = req.query;
  const store = await readStore();
  let records = [...store.classPerformance];

  if (studentClass) records = records.filter((record) => record.studentClass === studentClass);
  if (teacherId) records = records.filter((record) => record.teacherId === Number(teacherId));
  if (term) records = records.filter((record) => record.term === term);
  if (status) records = records.filter((record) => record.status === status);

  records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(records.map((record) => withClassPerformanceTeacher(record, store.teachers)));
});

app.post("/performance/class", async (req, res) => {
  const { teacherId, studentClass, term, subject, averageScore, summary, status } = req.body;

  if (!teacherId || !studentClass || !term || !subject) {
    return res
      .status(400)
      .json({ error: "teacherId, studentClass, term and subject are required" });
  }

  try {
    const store = await readStore();
    const teacher = store.teachers.find((entry) => entry.id === Number(teacherId));

    if (!teacher) return res.status(400).json({ error: "Teacher not found" });
    if (teacher.assignedClass !== studentClass) {
      return res.status(400).json({ error: "Teacher is not assigned to this class" });
    }

    const timestamp = new Date().toISOString();
    const existingIndex = store.classPerformance.findIndex(
      (entry) =>
        entry.teacherId === Number(teacherId) &&
        entry.studentClass === studentClass &&
        entry.term === term &&
        entry.subject === subject,
    );

    const record = {
      id:
        existingIndex >= 0
          ? store.classPerformance[existingIndex].id
          : nextId(store.classPerformance),
      teacherId: Number(teacherId),
      studentClass,
      term,
      subject,
      averageScore: Number(averageScore || 0),
      summary: summary || "",
      status: status || "draft",
      createdAt:
        existingIndex >= 0 ? store.classPerformance[existingIndex].createdAt : timestamp,
      updatedAt: timestamp,
    };

    if (existingIndex >= 0) {
      store.classPerformance[existingIndex] = record;
    } else {
      store.classPerformance.unshift(record);
    }

    await writeStore(store);
    res.status(201).json(withClassPerformanceTeacher(record, store.teachers));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/performance/class/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const store = await readStore();
  const index = store.classPerformance.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Class performance record not found" });
  }

  store.classPerformance[index] = {
    ...store.classPerformance[index],
    status: "approved",
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  res.json(withClassPerformanceTeacher(store.classPerformance[index], store.teachers));
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
