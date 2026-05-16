import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { BookOpen, TrendingUp, TrendingDown, Award, FileText } from 'lucide-react';

const mockGrades = [
  {
    id: 1,
    roll: '001',
    name: 'John Kamau',
    math: 85,
    english: 78,
    science: 82,
    social: 75,
    average: 80,
    grade: 'B',
  },
  {
    id: 2,
    roll: '002',
    name: 'Grace Wanjiru',
    math: 92,
    english: 88,
    science: 90,
    social: 85,
    average: 89,
    grade: 'A',
  },
  {
    id: 3,
    roll: '003',
    name: 'David Ochieng',
    math: 70,
    english: 75,
    science: 72,
    social: 68,
    average: 71,
    grade: 'C',
  },
  {
    id: 4,
    roll: '004',
    name: 'Sarah Achieng',
    math: 88,
    english: 90,
    science: 86,
    social: 92,
    average: 89,
    grade: 'A',
  },
];

export default function GradesManagement() {
  const [selectedClass, setSelectedClass] = useState('Class 4');
  const [selectedTerm, setSelectedTerm] = useState('Term 2');
  const [grades, setGrades] = useState(mockGrades);
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-700';
      case 'B':
        return 'bg-blue-100 text-blue-700';
      case 'C':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  const classAverage = Math.round(
    grades.reduce((sum, student) => sum + student.average, 0) / grades.length
  );

  const topPerformers = [...grades].sort((a, b) => b.average - a.average).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAverage}%</div>
            <p className="text-xs text-muted-foreground">{selectedClass} performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Highest in class</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Students passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Cards</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250</div>
            <p className="text-xs text-muted-foreground">Generated this term</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grades">Grade Entry</TabsTrigger>
          <TabsTrigger value="reports">Report Cards</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Grade Entry & Management</CardTitle>
                  <CardDescription>Enter and manage student grades</CardDescription>
                </div>
                <Dialog open={isAddGradeOpen} onOpenChange={setIsAddGradeOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Enter Grades
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enter Student Grades</DialogTitle>
                      <DialogDescription>Enter marks for each subject</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Student</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map(student => (
                              <SelectItem key={student.id} value={student.roll}>
                                {student.roll} - {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Mathematics</Label>
                          <Input type="number" placeholder="0-100" />
                        </div>
                        <div className="space-y-2">
                          <Label>English</Label>
                          <Input type="number" placeholder="0-100" />
                        </div>
                        <div className="space-y-2">
                          <Label>Science</Label>
                          <Input type="number" placeholder="0-100" />
                        </div>
                        <div className="space-y-2">
                          <Label>Social Studies</Label>
                          <Input type="number" placeholder="0-100" />
                        </div>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Save Grades
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label>Class</Label>
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
                <div className="flex-1">
                  <Label>Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Math</TableHead>
                      <TableHead>English</TableHead>
                      <TableHead>Science</TableHead>
                      <TableHead>Social</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.roll}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.math}</TableCell>
                        <TableCell>{student.english}</TableCell>
                        <TableCell>{student.science}</TableCell>
                        <TableCell>{student.social}</TableCell>
                        <TableCell className="font-bold">{student.average}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getGradeColor(student.grade)}>
                            {student.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Card Generation</CardTitle>
              <CardDescription>Generate and send report cards to parents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Select Class</Label>
                    <Select defaultValue="Class 4">
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
                  <div className="space-y-2">
                    <Label>Select Term</Label>
                    <Select defaultValue="Term 2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report Cards
                </Button>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Report cards will be generated as PDFs and SMS notifications with USSD access codes
                    will be sent to parents for easy access on basic phones.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students with highest averages in {selectedClass}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No. {student.roll}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{student.average}%</p>
                      <Badge variant="secondary" className={getGradeColor(student.grade)}>
                        Grade {student.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
