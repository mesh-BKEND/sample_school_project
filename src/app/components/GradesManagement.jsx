import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, CheckCircle2, FileText, Send, TrendingUp } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";

const termOptions = ["Term 1", "Term 2", "Term 3"];

function getGradeColor(grade) {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-700";
    case "B":
      return "bg-blue-100 text-blue-700";
    case "C":
      return "bg-yellow-100 text-yellow-700";
    case "D":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export default function GradesManagement({ currentUser }) {
  const role = currentUser?.role || "admin";
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isParent = role === "parent";

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [classPerformanceRecords, setClassPerformanceRecords] = useState([]);
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentScores, setStudentScores] = useState({});
  const [classPerformanceForm, setClassPerformanceForm] = useState({
    subject: "",
    averageScore: "",
    summary: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const teacherProfile = useMemo(
    () => teachers.find((teacher) => teacher.id === currentUser?.teacherId) || null,
    [teachers, currentUser?.teacherId],
  );

  const visibleSubjects = teacherProfile?.subjects?.length
    ? teacherProfile.subjects
    : ["Mathematics", "English", "Science", "Social Studies"];

  useEffect(() => {
    loadData();
  }, [currentUser?.id, selectedClass, selectedTerm]);

  useEffect(() => {
    if (isTeacher && teacherProfile?.assignedClass) {
      setSelectedClass(teacherProfile.assignedClass);
    }
  }, [isTeacher, teacherProfile?.assignedClass]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const performanceFilters = {
        term: selectedTerm,
        studentClass: isTeacher ? teacherProfile?.assignedClass || selectedClass : selectedClass,
      };

      const studentFilters = isParent
        ? { parentStudentId: currentUser?.parentStudentId }
        : {};

      const studentPerformanceFilters = isParent
        ? {
            studentId: currentUser?.parentStudentId,
            status: "approved",
            term: selectedTerm,
          }
        : isTeacher
          ? {
              teacherId: currentUser?.teacherId,
              studentClass: teacherProfile?.assignedClass || selectedClass,
              term: selectedTerm,
            }
          : performanceFilters;

      const classPerformanceFilters = isParent
        ? {}
        : isTeacher
          ? {
              teacherId: currentUser?.teacherId,
              studentClass: teacherProfile?.assignedClass || selectedClass,
              term: selectedTerm,
            }
          : { studentClass: selectedClass, term: selectedTerm };

      const [studentData, teacherData, performanceData, classPerformanceData] =
        await Promise.all([
          api.getStudents(studentFilters),
          api.getTeachers(),
          api.getStudentPerformance(studentPerformanceFilters),
          api.getClassPerformance(classPerformanceFilters),
        ]);

      setStudents(studentData);
      setTeachers(teacherData);
      setPerformanceRecords(performanceData);
      setClassPerformanceRecords(classPerformanceData);

      if (!selectedStudentId && studentData.length) {
        setSelectedStudentId(String(studentData[0].id));
      }
    } catch (err) {
      setError(err.message || "Unable to load performance data");
    } finally {
      setLoading(false);
    }
  }

  const visibleStudents = useMemo(() => {
    if (isParent) return students;
    if (isTeacher) {
      return students.filter(
        (student) => student.studentClass === (teacherProfile?.assignedClass || selectedClass),
      );
    }
    return students.filter((student) => student.studentClass === selectedClass);
  }, [students, isParent, isTeacher, teacherProfile?.assignedClass, selectedClass]);

  const visiblePerformanceRecords = useMemo(() => {
    if (isParent) return performanceRecords.filter((record) => record.status === "approved");
    if (isTeacher) return performanceRecords;
    return performanceRecords;
  }, [performanceRecords, isParent, isTeacher]);

  const classAverage = visiblePerformanceRecords.length
    ? Math.round(
        visiblePerformanceRecords.reduce((sum, record) => sum + Number(record.average || 0), 0) /
          visiblePerformanceRecords.length,
      )
    : 0;

  const topPerformers = [...visiblePerformanceRecords]
    .sort((left, right) => Number(right.average || 0) - Number(left.average || 0))
    .slice(0, 3);

  const pendingPerformance = performanceRecords.filter((record) => record.status === "submitted");
  const pendingClassPerformance = classPerformanceRecords.filter(
    (record) => record.status === "submitted",
  );

  const approvedClassPerformance = classPerformanceRecords.filter(
    (record) => record.status === "approved",
  );

  async function saveStudentPerformance(status) {
    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const saved = await api.saveStudentPerformance({
        studentId: Number(selectedStudentId),
        teacherId: currentUser.teacherId,
        term: selectedTerm,
        scores: studentScores,
        status,
      });

      setPerformanceRecords((current) => {
        const next = current.filter((record) => record.id !== saved.id);
        return [saved, ...next];
      });
      setSuccessMessage(
        status === "submitted"
          ? "Student performance submitted to admin."
          : "Student performance saved as draft.",
      );
    } catch (err) {
      setError(err.message || "Unable to save student performance");
    }
  }

  async function saveClassPerformance(status) {
    setError("");
    setSuccessMessage("");

    try {
      const saved = await api.saveClassPerformance({
        teacherId: currentUser.teacherId,
        studentClass: teacherProfile?.assignedClass || selectedClass,
        term: selectedTerm,
        subject: classPerformanceForm.subject,
        averageScore: Number(classPerformanceForm.averageScore || 0),
        summary: classPerformanceForm.summary,
        status,
      });

      setClassPerformanceRecords((current) => {
        const next = current.filter((record) => record.id !== saved.id);
        return [saved, ...next];
      });
      setSuccessMessage(
        status === "submitted"
          ? "Class performance submitted to admin."
          : "Class performance saved as draft.",
      );
      setClassPerformanceForm({ subject: "", averageScore: "", summary: "" });
    } catch (err) {
      setError(err.message || "Unable to save class performance");
    }
  }

  async function approveStudentRecord(id) {
    try {
      const approved = await api.approveStudentPerformance(id);
      setPerformanceRecords((current) =>
        current.map((record) => (record.id === id ? approved : record)),
      );
    } catch (err) {
      setError(err.message || "Unable to approve student performance");
    }
  }

  async function approveClassRecord(id) {
    try {
      const approved = await api.approveClassPerformance(id);
      setClassPerformanceRecords((current) =>
        current.map((record) => (record.id === id ? approved : record)),
      );
    } catch (err) {
      setError(err.message || "Unable to approve class performance");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isParent ? "Student Average" : "Class Average"}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAverage}%</div>
            <p className="text-xs text-muted-foreground">
              {isParent
                ? "Approved student performance"
                : `${isTeacher ? teacherProfile?.assignedClass || selectedClass : selectedClass} performance`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topPerformers[0]?.average ? `${topPerformers[0].average}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topPerformers[0]?.student
                ? `${topPerformers[0].student.firstName} ${topPerformers[0].student.lastName}`
                : "No performance record yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? "Pending Approval" : "Approved Results"}
            </CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAdmin
                ? pendingPerformance.length + pendingClassPerformance.length
                : visiblePerformanceRecords.filter((record) => record.status === "approved")
                    .length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Teacher submissions waiting for admin" : "Ready to view"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedClassPerformance.length}</div>
            <p className="text-xs text-muted-foreground">
              Approved class performance summaries
            </p>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {!isParent ? (
        <Card>
          <CardHeader>
            <CardTitle>Performance Scope</CardTitle>
            <CardDescription>
              {isTeacher
                ? `You are assigned to ${teacherProfile?.assignedClass || "-"} and these subjects: ${visibleSubjects.join(", ")}`
                : "View and approve submitted performance records"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={isTeacher}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"].map(
                      (item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {termOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isTeacher ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Entry</CardTitle>
              <CardDescription>
                Save as draft or submit to admin for approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleStudents.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.roll ? `${student.roll} · ` : ""}
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {visibleSubjects.map((subject) => (
                  <div key={subject} className="space-y-2">
                    <Label>{subject}</Label>
                    <Input
                      type="number"
                      value={studentScores[subject] || ""}
                      onChange={(event) =>
                        setStudentScores({
                          ...studentScores,
                          [subject]: event.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => saveStudentPerformance("draft")}>
                  Save Draft
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => saveStudentPerformance("submitted")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit To Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Performance Summary</CardTitle>
              <CardDescription>
                Submit class-level subject performance to admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={classPerformanceForm.subject}
                  onValueChange={(value) =>
                    setClassPerformanceForm({ ...classPerformanceForm, subject: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Average Score</Label>
                <Input
                  type="number"
                  value={classPerformanceForm.averageScore}
                  onChange={(event) =>
                    setClassPerformanceForm({
                      ...classPerformanceForm,
                      averageScore: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Class Summary</Label>
                <Textarea
                  value={classPerformanceForm.summary}
                  onChange={(event) =>
                    setClassPerformanceForm({
                      ...classPerformanceForm,
                      summary: event.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => saveClassPerformance("draft")}>
                  Save Draft
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => saveClassPerformance("submitted")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit To Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            {isParent
              ? "Approved Student Performance"
              : isTeacher
                ? "Submitted Student Records"
                : "Student Performance Records"}
          </CardTitle>
          <CardDescription>
            {isParent
              ? "You can only view approved performance results for your child"
              : "Performance records by class and term"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Scores</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin ? <TableHead>Action</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="py-8 text-center">
                      Loading performance records...
                    </TableCell>
                  </TableRow>
                ) : visiblePerformanceRecords.length ? (
                  visiblePerformanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.student
                          ? `${record.student.firstName} ${record.student.lastName}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell>{record.studentClass}</TableCell>
                      <TableCell>{record.term}</TableCell>
                      <TableCell className="max-w-sm">
                        {Object.entries(record.scores || {})
                          .map(([subject, value]) => `${subject}: ${value}`)
                          .join(", ")}
                      </TableCell>
                      <TableCell>{record.average}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getGradeColor(record.grade)}>
                          {record.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.status}</TableCell>
                      {isAdmin ? (
                        <TableCell>
                          {record.status === "submitted" ? (
                            <Button size="sm" onClick={() => approveStudentRecord(record.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          ) : (
                            "Approved"
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 8 : 7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No performance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class Performance Summaries</CardTitle>
          <CardDescription>
            Teacher class submissions and approved summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin ? <TableHead>Action</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classPerformanceRecords.length ? (
                  classPerformanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.studentClass}</TableCell>
                      <TableCell>{record.term}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>{record.averageScore}%</TableCell>
                      <TableCell>{record.summary || "-"}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      {isAdmin ? (
                        <TableCell>
                          {record.status === "submitted" ? (
                            <Button size="sm" onClick={() => approveClassRecord(record.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          ) : (
                            "Approved"
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 7 : 6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No class performance summaries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
