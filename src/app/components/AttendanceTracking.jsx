import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Calendar, Send, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const mockAttendance = [
  { id: 1, roll: '001', name: 'John Kamau', class: 'Class 4', present: true, parentPhone: '+254 712 345 678' },
  { id: 2, roll: '002', name: 'Grace Wanjiru', class: 'Class 5', present: true, parentPhone: '+254 723 456 789' },
  { id: 3, roll: '003', name: 'David Ochieng', class: 'Class 3', present: false, parentPhone: '+254 734 567 890' },
  { id: 4, roll: '004', name: 'Sarah Achieng', class: 'Class 6', present: true, parentPhone: '+254 745 678 901' },
  { id: 5, roll: '005', name: 'Michael Kipchoge', class: 'Class 2', present: false, parentPhone: '+254 756 789 012' },
  { id: 6, roll: '006', name: 'Lucy Nyambura', class: 'Class 4', present: true, parentPhone: '+254 767 890 123' },
  { id: 7, roll: '007', name: 'James Mwangi', class: 'Class 4', present: true, parentPhone: '+254 778 901 234' },
];

export default function AttendanceTracking() {
  const [selectedClass, setSelectedClass] = useState('Class 4');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState(mockAttendance);
  const [smsSent, setSmsSent] = useState(false);

  const filteredAttendance = attendance.filter(student => student.class === selectedClass);
  const presentCount = filteredAttendance.filter(s => s.present).length;
  const absentCount = filteredAttendance.filter(s => !s.present).length;
  const attendanceRate = filteredAttendance.length > 0
    ? Math.round((presentCount / filteredAttendance.length) * 100)
    : 0;

  const toggleAttendance = (id) => {
    setAttendance(attendance.map(student =>
      student.id === id ? { ...student, present: !student.present } : student
    ));
  };

  const markAllPresent = () => {
    setAttendance(attendance.map(student =>
      student.class === selectedClass ? { ...student, present: true } : student
    ));
  };

  const sendSMSAlerts = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

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
            <p className="text-xs text-muted-foreground">Students present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Students absent today</p>
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
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class 1">Class 1</SelectItem>
                  <SelectItem value="Class 2">Class 2</SelectItem>
                  <SelectItem value="Class 3">Class 3</SelectItem>
                  <SelectItem value="Class 4">Class 4</SelectItem>
                  <SelectItem value="Class 5">Class 5</SelectItem>
                  <SelectItem value="Class 6">Class 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={markAllPresent} variant="outline">
                <Check className="h-4 w-4 mr-2" />
                Mark All Present
              </Button>
              <Button
                onClick={sendSMSAlerts}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={smsSent}
              >
                <Send className="h-4 w-4 mr-2" />
                {smsSent ? 'SMS Sent!' : 'Send SMS Alerts'}
              </Button>
            </div>
          </div>

          {smsSent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                SMS alerts sent to parents of {absentCount} absent students
              </p>
            </div>
          )}

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
                {filteredAttendance.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={student.present}
                        onCheckedChange={() => toggleAttendance(student.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.roll}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.parentPhone}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">SMS Alert System</h4>
            <p className="text-sm text-muted-foreground">
              When attendance is marked, parents of absent students automatically receive an SMS notification.
              This helps maintain communication and allows parents to quickly respond if their child is unexpectedly absent.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
