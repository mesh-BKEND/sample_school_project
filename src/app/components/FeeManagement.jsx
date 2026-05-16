import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, DollarSign, Plus, Send } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "./ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function FeeManagement({ currentUser }) {
  const role = currentUser?.role || "admin";
  const isParent = role === "parent";

  const [feeRecords, setFeeRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [paid, setPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [lastPayment, setLastPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remindersSent, setRemindersSent] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [studentData, feeData] = await Promise.all([
        api.getStudents(
          isParent && currentUser?.parentStudentId
            ? { parentStudentId: currentUser.parentStudentId }
            : undefined,
        ),
        api.getFees(
          isParent && currentUser?.parentStudentId
            ? { studentId: currentUser.parentStudentId }
            : undefined,
        ),
      ]);

      setStudents(studentData);
      setFeeRecords(feeData);
    } catch (err) {
      setError(err.message || "Unable to load fee records");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    return feeRecords.filter((record) => {
      if (selectedFilter === "all") return true;
      return record.status?.toLowerCase() === selectedFilter;
    });
  }, [feeRecords, selectedFilter]);

  const totalExpected = feeRecords.reduce((sum, record) => sum + Number(record.totalFee || 0), 0);
  const totalCollected = feeRecords.reduce((sum, record) => sum + Number(record.paid || 0), 0);
  const totalOutstanding = feeRecords.reduce((sum, record) => sum + Number(record.balance || 0), 0);
  const pendingCount = feeRecords.filter(
    (record) => record.status === "Pending" || record.status === "Partial",
  ).length;
  const collectionRate = totalExpected
    ? Math.round((totalCollected / totalExpected) * 100)
    : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Partial":
        return "bg-yellow-100 text-yellow-700";
      case "Pending":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  async function handleRecordPayment() {
    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.createFeeRecord({
        studentId: Number(selectedStudentId),
        totalFee: Number(totalFee),
        paid: Number(paid || 0),
        paymentMethod,
        receiptNumber,
        lastPayment: lastPayment || null,
      });
      setFeeRecords([result, ...feeRecords]);
      setSelectedStudentId("");
      setTotalFee("");
      setPaid("");
      setPaymentMethod("");
      setReceiptNumber("");
      setLastPayment("");
      setIsPaymentDialogOpen(false);
    } catch (err) {
      setError(err.message || "Unable to save payment");
    } finally {
      setLoading(false);
    }
  }

  function sendReminders() {
    setRemindersSent(true);
    setTimeout(() => setRemindersSent(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalExpected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {isParent ? "For this student" : "Across saved records"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{collectionRate}% collection rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KES {totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current unpaid balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Records</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {isParent ? "Unsettled payment entries" : "Students with balance"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{isParent ? "Student Fee Record" : "Fee Records"}</CardTitle>
              <CardDescription>
                {isParent
                  ? "View the fee status and payment history for your child"
                  : "Track and manage student fee payments"}
              </CardDescription>
            </div>
            {!isParent ? (
              <div className="flex gap-2">
                <Button
                  onClick={sendReminders}
                  variant="outline"
                  disabled={remindersSent}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {remindersSent ? "Reminders Sent!" : "Send SMS Reminders"}
                </Button>
                <Dialog
                  open={isPaymentDialogOpen}
                  onOpenChange={setIsPaymentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Fee Payment</DialogTitle>
                      <DialogDescription>Enter payment details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {error ? (
                        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                          {error}
                        </div>
                      ) : null}
                      <div className="space-y-2">
                        <Label>Student</Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={String(student.id)}>
                                {student.roll ? `${student.roll} · ` : ""}
                                {student.firstName} {student.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Total Fee (KES)</Label>
                          <Input
                            type="number"
                            value={totalFee}
                            onChange={(event) => setTotalFee(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount Paid (KES)</Label>
                          <Input
                            type="number"
                            value={paid}
                            onChange={(event) => setPaid(event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Receipt Number</Label>
                        <Input
                          value={receiptNumber}
                          onChange={(event) => setReceiptNumber(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Date</Label>
                        <Input
                          type="date"
                          value={lastPayment}
                          onChange={(event) => setLastPayment(event.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleRecordPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Payment"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mb-4">
            <Label>Filter by Status</Label>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {!isParent ? <TableHead>Roll</TableHead> : null}
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isParent ? 7 : 8}
                      className="p-6 text-center text-sm text-muted-foreground"
                    >
                      Loading fee records...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length ? (
                  filteredRecords.map((record) => {
                    const student = record.student || {};
                    return (
                      <TableRow key={record.id}>
                        {!isParent ? (
                          <TableCell className="font-medium">{student.roll || "-"}</TableCell>
                        ) : null}
                        <TableCell>
                          {`${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                            "Unknown"}
                        </TableCell>
                        <TableCell>{student.studentClass || "N/A"}</TableCell>
                        <TableCell>KES {Number(record.totalFee).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">
                          KES {Number(record.paid).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600">
                          KES {Number(record.balance).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {record.lastPayment
                            ? new Date(record.lastPayment).toLocaleDateString()
                            : "No payment yet"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isParent ? 7 : 8}
                      className="p-6 text-center text-sm text-muted-foreground"
                    >
                      No fee records available.
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
