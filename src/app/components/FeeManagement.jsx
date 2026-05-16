import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DollarSign, Send, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Progress } from './ui/progress';

const mockFeeRecords = [
  {
    id: 1,
    roll: '001',
    name: 'John Kamau',
    class: 'Class 4',
    totalFee: 5000,
    paid: 5000,
    balance: 0,
    status: 'Paid',
    lastPayment: '2026-04-15',
    phone: '+254 712 345 678',
  },
  {
    id: 2,
    roll: '002',
    name: 'Grace Wanjiru',
    class: 'Class 5',
    totalFee: 5500,
    paid: 3000,
    balance: 2500,
    status: 'Partial',
    lastPayment: '2026-03-20',
    phone: '+254 723 456 789',
  },
  {
    id: 3,
    roll: '003',
    name: 'David Ochieng',
    class: 'Class 3',
    totalFee: 4500,
    paid: 0,
    balance: 4500,
    status: 'Pending',
    lastPayment: null,
    phone: '+254 734 567 890',
  },
  {
    id: 4,
    roll: '004',
    name: 'Sarah Achieng',
    class: 'Class 6',
    totalFee: 6000,
    paid: 6000,
    balance: 0,
    status: 'Paid',
    lastPayment: '2026-04-28',
    phone: '+254 745 678 901',
  },
  {
    id: 5,
    roll: '005',
    name: 'Michael Kipchoge',
    class: 'Class 2',
    totalFee: 4000,
    paid: 2000,
    balance: 2000,
    status: 'Partial',
    lastPayment: '2026-03-10',
    phone: '+254 756 789 012',
  },
];

export default function FeeManagement() {
  const [feeRecords, setFeeRecords] = useState(mockFeeRecords);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [remindersSent, setRemindersSent] = useState(false);

  const totalExpected = feeRecords.reduce((sum, record) => sum + record.totalFee, 0);
  const totalCollected = feeRecords.reduce((sum, record) => sum + record.paid, 0);
  const totalOutstanding = feeRecords.reduce((sum, record) => sum + record.balance, 0);
  const collectionRate = Math.round((totalCollected / totalExpected) * 100);

  const filteredRecords = feeRecords.filter(record => {
    if (selectedFilter === 'all') return true;
    return record.status.toLowerCase() === selectedFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'Pending':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const sendReminders = () => {
    setRemindersSent(true);
    setTimeout(() => setRemindersSent(false), 3000);
  };

  const pendingCount = feeRecords.filter(r => r.status === 'Pending' || r.status === 'Partial').length;

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
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{collectionRate}% collection rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KES {totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Yet to collect</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Students with balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Progress</CardTitle>
          <CardDescription>Fee collection status for current term</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Collected: KES {totalCollected.toLocaleString()}</span>
              <span className="font-medium">{collectionRate}%</span>
            </div>
            <Progress value={collectionRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Target: KES {totalExpected.toLocaleString()}</span>
              <span>Remaining: KES {totalOutstanding.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Fee Records</CardTitle>
              <CardDescription>Track and manage student fee payments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={sendReminders}
                variant="outline"
                disabled={remindersSent}
              >
                <Send className="h-4 w-4 mr-2" />
                {remindersSent ? 'Reminders Sent!' : 'Send SMS Reminders'}
              </Button>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Fee Payment</DialogTitle>
                    <DialogDescription>Enter payment details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Student</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeRecords.map(record => (
                            <SelectItem key={record.id} value={record.roll}>
                              {record.roll} - {record.name} (Balance: KES {record.balance})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (KES)</Label>
                      <Input type="number" placeholder="Enter amount" />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select>
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
                      <Input placeholder="Enter receipt number" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Record Payment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {remindersSent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                SMS fee reminders sent to {pendingCount} parents
              </p>
            </div>
          )}

          <div className="mb-4">
            <Label>Filter by Status</Label>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll</TableHead>
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
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.roll}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>KES {record.totalFee.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">KES {record.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">KES {record.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.lastPayment || 'No payment yet'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">SMS Fee Reminder System</h4>
            <p className="text-sm text-muted-foreground">
              Automated SMS reminders are sent to parents with outstanding balances. Parents can also
              check fee status via USSD codes on their basic phones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
