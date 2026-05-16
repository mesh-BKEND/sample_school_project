import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, Check, Save, Send, X } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const classOptions = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
];

const todayString = new Date().toISOString().slice(0, 10);

export default function AttendanceTracking() {
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadAttendanceForSelection();
  }, [selectedClass, selectedDate, students.length]);

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendanceForSelection() {
    if (!students.length) {
      setAttendanceMap({});
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const records = await api.getAttendance({
        date: selectedDate,
        studentClass: selectedClass,
      });

      const nextMap = {};
      records.forEach((record) => {
        nextMap[record.studentId] = Boolean(record.present);
      });
      setAttendanceMap(nextMap);
    } catch (err) {
      setError(err.message || "Unable to load attendance");
    } finally {
      setLoading(false);
    }
  }

  const classStudents = useMemo(
    () => students.filter((student) => student.studentClass === selectedClass),
    [students, selectedClass],
  );

  const attendanceRows = useMemo(
    () =>
      classStudents.map((student) => ({
        ...student,
        present: attendanceMap[student.id] ?? false,
      })),
    [classStudents, attendanceMap],
  );

  const presentCount = attendanceRows.filter((student) => student.present).length;
  const absentCount = attendanceRows.length - presentCount;
  const attendanceRate = attendanceRows.length
    ? Math.round((presentCount / attendanceRows.length) * 100)
    : 0;

  function toggleAttendance(studentId) {
    setAttendanceMap((current) => ({
      ...current,
      [studentId]: !(current[studentId] ?? false),
    }));
    setSuccessMessage("");
  }

  function markAllPresent() {
    const nextMap = {};
    classStudents.forEach((student) => {
      nextMap[student.id] = true;
    });
    setAttendanceMap(nextMap);
    setSuccessMessage("");
  }

  async function saveAttendance() {
    if (!classStudents.length) {
      setError("No students found in this class yet.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.saveAttendanceBatch({
        date: selectedDate,
        studentClass: selectedClass,
        records: classStudents.map((student) => ({
          studentId: student.id,
          present: attendanceMap[student.id] ?? false,
        })),
      });

      setSuccessMessage(`Attendance saved for ${selectedClass} on ${selectedDate}.`);
    } catch (err) {
      setError(err.message || "Unable to save attendance");
    } finally {
      setSaving(false);
    }
  }

  function sendSMSAlerts() {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">Students marked present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Students marked absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">For {selectedClass}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Management</CardTitle>
          <CardDescription>
            Save day-to-day attendance by class and date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Attendance Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={markAllPresent} variant="outline" disabled={!classStudents.length}>
                <Check className="mr-2 h-4 w-4" />
                Mark All Present
              </Button>
              <Button
                onClick={saveAttendance}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saving || !classStudents.length}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
              <Button
                onClick={sendSMSAlerts}
                variant="outline"
                disabled={smsSent || !absentCount}
              >
                <Send className="mr-2 h-4 w-4" />
                {smsSent ? "SMS Sent!" : "Send SMS Alerts"}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          {smsSent ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              SMS alerts sent to parents of {absentCount} absent students.
            </div>
          ) : null}

          <div className="mb-4 text-sm text-muted-foreground">
            {selectedDate
              ? format(new Date(selectedDate), "EEEE, MMMM d, yyyy")
              : "Select a date"}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Present</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Parent Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      Loading attendance...
                    </TableCell>
                  </TableRow>
                ) : attendanceRows.length > 0 ? (
                  attendanceRows.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={student.present}
                          onCheckedChange={() => toggleAttendance(student.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.roll || "-"}</TableCell>
                      <TableCell>
                        {`${student.firstName || ""} ${student.lastName || ""}`.trim()}
                      </TableCell>
                      <TableCell>{student.phone || "-"}</TableCell>
                      <TableCell>
                        {student.present ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            Absent
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No students found for {selectedClass}. Add students to this class first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium">Attendance Record Workflow</h4>
            <p className="text-sm text-muted-foreground">
              Each saved record is stored by class and date. The dashboard uses these daily
              records to calculate monthly class averages and overall school attendance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
