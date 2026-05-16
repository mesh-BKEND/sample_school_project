import { useEffect, useMemo, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { BookOpen, DollarSign, TrendingUp, UserCheck, Users, UserX } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const classOptions = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
];

export default function DashboardOverview() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [approvedClassPerformance, setApprovedClassPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError("");

    const monthKey = format(new Date(), "yyyy-MM");

    try {
      const [studentData, feeData, attendanceData, classPerformanceData] = await Promise.all([
        api.getStudents(),
        api.getFees(),
        api.getAttendance({ month: monthKey }),
        api.getClassPerformance({ status: "approved" }),
      ]);

      setStudents(studentData);
      setFees(feeData);
      setAttendanceRecords(attendanceData);
      setApprovedClassPerformance(classPerformanceData);
    } catch (err) {
      setError(err.message || "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const studentsByClass = classOptions.reduce((accumulator, item) => {
      accumulator[item] = students.filter((student) => student.studentClass === item);
      return accumulator;
    }, {});

    const recordsByClass = classOptions.reduce((accumulator, item) => {
      accumulator[item] = attendanceRecords.filter((record) => record.studentClass === item);
      return accumulator;
    }, {});

    const classAverageData = classOptions.map((item) => {
      const classStudents = studentsByClass[item];
      const classRecords = recordsByClass[item];
      const days = new Set(classRecords.map((record) => record.date)).size;
      const totalPossible = classStudents.length * days;
      const totalPresent = classRecords.filter((record) => record.present).length;
      const average = totalPossible
        ? Math.round((totalPresent / totalPossible) * 100)
        : 0;

      return {
        class: item,
        average,
        present: totalPresent,
        enrolled: classStudents.length,
        days,
      };
    });

    const dailyGroups = {};
    attendanceRecords.forEach((record) => {
      if (!dailyGroups[record.date]) {
        dailyGroups[record.date] = [];
      }
      dailyGroups[record.date].push(record);
    });

    const dailyAttendanceData = Object.entries(dailyGroups)
      .sort(([left], [right]) => new Date(left) - new Date(right))
      .map(([date, records]) => {
        const present = records.filter((record) => record.present).length;
        const absent = records.length - present;
        const average = records.length ? Math.round((present / records.length) * 100) : 0;

        return {
          date: format(new Date(date), "MMM d"),
          present,
          absent,
          average,
        };
      });

    const totalStudents = students.length;
    const presentToday = attendanceRecords.filter((record) => {
      return record.date === format(new Date(), "yyyy-MM-dd") && record.present;
    }).length;
    const totalMarkedToday = attendanceRecords.filter(
      (record) => record.date === format(new Date(), "yyyy-MM-dd"),
    ).length;
    const absentToday = Math.max(totalMarkedToday - presentToday, 0);

    const totalExpectedFees = fees.reduce((sum, fee) => sum + Number(fee.totalFee || 0), 0);
    const totalCollected = fees.reduce((sum, fee) => sum + Number(fee.paid || 0), 0);
    const totalOutstandingFees = fees.reduce((sum, fee) => sum + Number(fee.balance || 0), 0);

    const monthStart = format(startOfMonth(new Date()), "MMM d");
    const monthEnd = format(endOfMonth(new Date()), "MMM d, yyyy");

    const overallMonthlyAverage = dailyAttendanceData.length
      ? Math.round(
          dailyAttendanceData.reduce((sum, day) => sum + day.average, 0) /
            dailyAttendanceData.length,
        )
      : 0;

    const topAttendanceClass = [...classAverageData].sort(
      (left, right) => right.average - left.average,
    )[0];

    const feeRecordsThisMonth = fees.filter((fee) => {
      const feeDate = fee.lastPayment || fee.createdAt;
      return feeDate && format(new Date(feeDate), "yyyy-MM") === format(new Date(), "yyyy-MM");
    });

    const feeDailyGroups = {};
    feeRecordsThisMonth.forEach((fee) => {
      const feeDate = format(new Date(fee.lastPayment || fee.createdAt), "yyyy-MM-dd");
      if (!feeDailyGroups[feeDate]) {
        feeDailyGroups[feeDate] = [];
      }
      feeDailyGroups[feeDate].push(fee);
    });

    const dailyFeeData = Object.entries(feeDailyGroups)
      .sort(([left], [right]) => new Date(left) - new Date(right))
      .map(([date, records]) => ({
        date: format(new Date(date), "MMM d"),
        collected: records.reduce((sum, fee) => sum + Number(fee.paid || 0), 0),
        debt: records.reduce((sum, fee) => sum + Number(fee.balance || 0), 0),
      }));

    const todayKey = format(new Date(), "yyyy-MM-dd");
    const classFeeDailyData = classOptions.map((item) => {
      const classFees = fees.filter((fee) => fee.student?.studentClass === item);
      const todayFees = classFees.filter((fee) => {
        const feeDate = fee.lastPayment || fee.createdAt;
        return feeDate && format(new Date(feeDate), "yyyy-MM-dd") === todayKey;
      });

      return {
        class: item,
        paidToday: todayFees.reduce((sum, fee) => sum + Number(fee.paid || 0), 0),
        debtToday: todayFees.reduce((sum, fee) => sum + Number(fee.balance || 0), 0),
        outstandingNow: classFees.reduce((sum, fee) => sum + Number(fee.balance || 0), 0),
      };
    });

    const totalCollectedToday = classFeeDailyData.reduce(
      (sum, item) => sum + item.paidToday,
      0,
    );
    const totalDebtToday = classFeeDailyData.reduce(
      (sum, item) => sum + item.debtToday,
      0,
    );

    return {
      classAverageData,
      dailyAttendanceData,
      dailyFeeData,
      classFeeDailyData,
      totalStudents,
      presentToday,
      absentToday,
      totalCollected,
      totalExpectedFees,
      totalOutstandingFees,
      totalCollectedToday,
      totalDebtToday,
      overallMonthlyAverage,
      monthLabel: `${monthStart} - ${monthEnd}`,
      topAttendanceClass,
      featuredClassPerformance: approvedClassPerformance.slice(0, 3),
    };
  }, [students, fees, attendanceRecords, approvedClassPerformance]);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              Students marked present today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.absentToday}</div>
            <p className="text-xs text-muted-foreground">Students marked absent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overallMonthlyAverage}%</div>
            <p className="text-xs text-muted-foreground">{summary.monthLabel}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>School Attendance By Day</CardTitle>
            <CardDescription>
              Overall daily attendance across the current month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.dailyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
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
            <CardTitle>Class Attendance Averages</CardTitle>
            <CardDescription>
              Daily average attendance for each class this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.classAverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Attendance Average (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection</CardTitle>
            <CardDescription>Current totals from saved fee records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-muted-foreground">Expected</span>
                <span className="font-semibold">
                  KES {summary.totalExpectedFees.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                <span className="text-sm text-muted-foreground">Collected</span>
                <span className="font-semibold text-green-700">
                  KES {summary.totalCollected.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                <span className="text-sm text-muted-foreground">Outstanding Debt</span>
                <span className="font-semibold text-red-700">
                  KES {summary.totalOutstandingFees.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Highlights</CardTitle>
            <CardDescription>Quick summary for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="font-medium">Overall School Average</p>
                <p className="text-sm text-muted-foreground">
                  {summary.overallMonthlyAverage}% average attendance for{" "}
                  {format(new Date(), "MMMM yyyy")}.
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="font-medium">Best Performing Class</p>
                <p className="text-sm text-muted-foreground">
                  {summary.topAttendanceClass?.class || "No class data yet"} at{" "}
                  {summary.topAttendanceClass?.average || 0}% average attendance.
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <p className="font-medium">Academic Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Attendance is now tracked daily and rolled into monthly class and school
                  averages automatically.
                </p>
              </div>
              {summary.featuredClassPerformance.map((record) => (
                <div key={record.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="font-medium">
                    {record.studentClass} · {record.subject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.averageScore}% average. {record.summary || "Approved by admin."}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Fee Payment And Debt</CardTitle>
            <CardDescription>
              Day-by-day fee payments and debt recorded this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm text-muted-foreground">Collected Today</p>
                <p className="text-xl font-semibold text-green-700">
                  KES {summary.totalCollectedToday.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-muted-foreground">Debt Logged Today</p>
                <p className="text-xl font-semibold text-red-700">
                  KES {summary.totalDebtToday.toLocaleString()}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.dailyFeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill="#16a34a" name="Collected" />
                <Bar dataKey="debt" fill="#dc2626" name="Debt" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Fee Snapshot</CardTitle>
            <CardDescription>
              Daily fee status by class for {format(new Date(), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.classFeeDailyData.map((item) => (
                <div
                  key={item.class}
                  className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-4"
                >
                  <div>
                    <p className="font-medium">{item.class}</p>
                    <p className="text-xs text-muted-foreground">Daily class view</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid Today</p>
                    <p className="font-semibold text-green-700">
                      KES {item.paidToday.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Debt Today</p>
                    <p className="font-semibold text-red-700">
                      KES {item.debtToday.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding Now</p>
                    <p className="font-semibold">
                      KES {item.outstandingNow.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading dashboard data...
        </div>
      )}
    </div>
  );
}
