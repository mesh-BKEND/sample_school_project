import { useEffect, useState } from "react";
import { Plus, Users2 } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    assignedClass: "",
    subjects: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err.message || "Unable to load teachers");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeacher() {
    setError("");
    try {
      const created = await api.createTeacher({
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        assignedClass: form.assignedClass,
        subjects: form.subjects
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setTeachers([created, ...teachers]);
      setForm({
        fullName: "",
        username: "",
        password: "",
        assignedClass: "",
        subjects: "",
      });
      setOpen(false);
    } catch (err) {
      setError(err.message || "Unable to create teacher");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Teacher Management</CardTitle>
              <CardDescription>
                Create teacher accounts and assign classes and subjects
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Teacher Account</DialogTitle>
                  <DialogDescription>
                    The teacher will use these credentials on the login page.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {error ? (
                    <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={form.fullName}
                      onChange={(event) =>
                        setForm({ ...form, fullName: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={form.username}
                      onChange={(event) =>
                        setForm({ ...form, username: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm({ ...form, password: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned Class</Label>
                    <Input
                      placeholder="Class 1"
                      value={form.assignedClass}
                      onChange={(event) =>
                        setForm({ ...form, assignedClass: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subjects</Label>
                    <Input
                      placeholder="Math, English, Science"
                      value={form.subjects}
                      onChange={(event) =>
                        setForm({ ...form, subjects: event.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleCreateTeacher}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Create Teacher
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading teachers...</div> : null}
          {error && !open ? (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Assigned Class</TableHead>
                  <TableHead>Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.length ? (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.fullName}</TableCell>
                      <TableCell>{teacher.user?.username || "-"}</TableCell>
                      <TableCell>{teacher.assignedClass}</TableCell>
                      <TableCell>{teacher.subjects?.join(", ") || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No teachers created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-slate-700">
              <Users2 className="h-4 w-4" />
              Teacher permissions
            </div>
            Teachers can only manage performance records for their assigned class and subjects.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
