import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Plus, Edit, Eye, Phone } from "lucide-react";
import { api } from "../../lib/api";

const classOptions = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
];

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    roll: "",
    parent: "",
    phone: "",
    parentUsername: "",
    parentPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter((student) => {
    const displayName = `${student.firstName} ${student.lastName}`
      .trim()
      .toLowerCase();
    const matchesSearch =
      displayName.includes(searchTerm.toLowerCase()) ||
      (student.roll || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || student.studentClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      setError("Student name is required");
      return;
    }
    if (!newStudent.parent.trim()) {
      setError("Parent name is required");
      return;
    }
    if (!newStudent.parentUsername.trim() || !newStudent.parentPassword.trim()) {
      setError("Parent username and password are required");
      return;
    }

    const [firstName, ...remaining] = newStudent.name.trim().split(" ");
    const lastName = remaining.join(" ");

    setLoading(true);
    setError("");

    try {
      const created = await api.createStudent({
        firstName,
        lastName,
        studentClass: newStudent.class,
        roll: newStudent.roll,
        parentName: newStudent.parent,
        phone: newStudent.phone,
        parentUsername: newStudent.parentUsername,
        parentPassword: newStudent.parentPassword,
        status: "Active",
      });

      setStudents([created, ...students]);
      setNewStudent({
        name: "",
        class: "",
        roll: "",
        parent: "",
        phone: "",
        parentUsername: "",
        parentPassword: "",
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Manage student enrollment and records
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter student details to register
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {error ? (
                    <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label>Student Name</Label>
                    <Input
                      placeholder="Enter full name"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                      value={newStudent.class}
                      onValueChange={(value) =>
                        setNewStudent({ ...newStudent, class: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
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
                  <div className="space-y-2">
                    <Label>Roll Number</Label>
                    <Input
                      placeholder="Enter roll number"
                      value={newStudent.roll}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, roll: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent/Guardian Name</Label>
                    <Input
                      placeholder="Enter parent name"
                      value={newStudent.parent}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, parent: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Phone Number</Label>
                    <Input
                      placeholder="+254 7XX XXX XXX"
                      value={newStudent.phone}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Parent Username</Label>
                      <Input
                        placeholder="parent.abel"
                        value={newStudent.parentUsername}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            parentUsername: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent Password</Label>
                      <Input
                        type="password"
                        placeholder="Create password"
                        value={newStudent.parentPassword}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            parentPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddStudent}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Register Student"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or roll number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Parent Login</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.roll || "—"}
                      </TableCell>
                      <TableCell>
                        {`${student.firstName} ${student.lastName}`.trim()}
                      </TableCell>
                      <TableCell>{student.studentClass || "—"}</TableCell>
                      <TableCell>{student.parentName || "—"}</TableCell>
                      <TableCell>
                        {student.parentUser?.username || student.parentUsername || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {student.phone || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
