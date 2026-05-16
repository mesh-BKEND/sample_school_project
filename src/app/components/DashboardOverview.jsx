import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, UserCheck, UserX, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const attendanceData = [
  { month: 'Jan', present: 450, absent: 50 },
  { month: 'Feb', present: 470, absent: 30 },
  { month: 'Mar', present: 460, absent: 40 },
  { month: 'Apr', present: 480, absent: 20 },
  { month: 'May', present: 465, absent: 35 },
];

const performanceData = [
  { class: 'Class 1', average: 75 },
  { class: 'Class 2', average: 78 },
  { class: 'Class 3', average: 72 },
  { class: 'Class 4', average: 80 },
  { class: 'Class 5', average: 76 },
  { class: 'Class 6', average: 82 },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">500</div>
            <p className="text-xs text-muted-foreground">+12 from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">465</div>
            <p className="text-xs text-muted-foreground">93% attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">SMS alerts sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,000</div>
            <p className="text-xs text-muted-foreground">85% collected this term</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Monthly attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>Average scores by class</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} name="Average Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates from the school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="h-2 w-2 mt-2 bg-blue-600 rounded-full"></div>
              <div>
                <p className="font-medium">Parent-Teacher Meeting Scheduled</p>
                <p className="text-sm text-muted-foreground">Meeting scheduled for May 15, 2026. SMS notifications sent to all parents.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
              <div className="h-2 w-2 mt-2 bg-green-600 rounded-full"></div>
              <div>
                <p className="font-medium">Term Exams Completed</p>
                <p className="text-sm text-muted-foreground">All Class 1-6 exams completed. Grade entry in progress.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-orange-50 rounded-lg">
              <div className="h-2 w-2 mt-2 bg-orange-600 rounded-full"></div>
              <div>
                <p className="font-medium">Fee Payment Reminders</p>
                <p className="text-sm text-muted-foreground">45 payment reminders sent via SMS today.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
