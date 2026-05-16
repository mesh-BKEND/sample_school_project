import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Bell, Send, CheckCircle, MessageSquare, Plus, Calendar } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { format } from 'date-fns';

const mockAnnouncements = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting',
    message: 'Parent-Teacher meeting scheduled for May 15, 2026 at 10:00 AM. All parents are requested to attend.',
    date: '2026-05-05',
    recipients: 'All Parents',
    status: 'Sent',
    smsSent: 500,
  },
  {
    id: 2,
    title: 'Term Exam Schedule',
    message: 'End of term exams will begin on May 20, 2026. Please ensure students are prepared.',
    date: '2026-05-03',
    recipients: 'Class 4-6 Parents',
    status: 'Sent',
    smsSent: 250,
  },
  {
    id: 3,
    title: 'School Reopening',
    message: 'School will reopen for Term 3 on June 5, 2026. Students should report by 8:00 AM.',
    date: '2026-05-01',
    recipients: 'All Parents',
    status: 'Sent',
    smsSent: 500,
  },
  {
    id: 4,
    title: 'Sports Day Event',
    message: 'Annual sports day will be held on May 25, 2026. All students must participate.',
    date: '2026-04-28',
    recipients: 'All Parents',
    status: 'Sent',
    smsSent: 500,
  },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    recipients: 'all',
  });
  const [sendViaChannels, setSendViaChannels] = useState({
    sms: true,
    ussd: false,
    app: false,
  });

  const handleCreateAnnouncement = () => {
    const announcement = {
      id: announcements.length + 1,
      ...newAnnouncement,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Sent',
      smsSent: newAnnouncement.recipients === 'all' ? 500 : 150,
    };
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: '', message: '', recipients: 'all' });
    setIsCreateDialogOpen(false);
  };

  const totalMessagesSent = announcements.reduce((sum, ann) => sum + ann.smsSent, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessagesSent}</div>
            <p className="text-xs text-muted-foreground">Total messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">480</div>
            <p className="text-xs text-muted-foreground">96% engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Responses today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>School Announcements</CardTitle>
              <CardDescription>Send important messages to parents and community</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>
                    Send important information to parents via SMS/USSD
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Announcement Title</Label>
                    <Input
                      placeholder="Enter announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Enter your message here..."
                      className="min-h-32"
                      value={newAnnouncement.message}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Keep message clear and concise for SMS delivery. Character count: {newAnnouncement.message.length}/160
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select
                      value={newAnnouncement.recipients}
                      onValueChange={(value) =>
                        setNewAnnouncement({ ...newAnnouncement, recipients: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parents</SelectItem>
                        <SelectItem value="class1">Class 1 Parents</SelectItem>
                        <SelectItem value="class2">Class 2 Parents</SelectItem>
                        <SelectItem value="class3">Class 3 Parents</SelectItem>
                        <SelectItem value="class4">Class 4 Parents</SelectItem>
                        <SelectItem value="class5">Class 5 Parents</SelectItem>
                        <SelectItem value="class6">Class 6 Parents</SelectItem>
                        <SelectItem value="teachers">Teachers</SelectItem>
                        <SelectItem value="community">Community Leaders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Send Via</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms"
                          checked={sendViaChannels.sms}
                          onCheckedChange={(checked) =>
                            setSendViaChannels({ ...sendViaChannels, sms: checked })
                          }
                        />
                        <label htmlFor="sms" className="text-sm cursor-pointer">
                          SMS (Recommended for rural areas)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ussd"
                          checked={sendViaChannels.ussd}
                          onCheckedChange={(checked) =>
                            setSendViaChannels({ ...sendViaChannels, ussd: checked })
                          }
                        />
                        <label htmlFor="ussd" className="text-sm cursor-pointer">
                          USSD Notification
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="app"
                          checked={sendViaChannels.app}
                          onCheckedChange={(checked) =>
                            setSendViaChannels({ ...sendViaChannels, app: checked })
                          }
                        />
                        <label htmlFor="app" className="text-sm cursor-pointer">
                          Mobile App Push Notification
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateAnnouncement}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {announcement.message}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {announcement.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(announcement.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      {announcement.recipients}
                    </div>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      {announcement.smsSent} SMS sent
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Channels</CardTitle>
          <CardDescription>Multiple ways to reach parents in rural areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-medium">SMS Alerts</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Direct SMS messages sent to registered parent phone numbers. Works on all phones.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-medium">USSD Access</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Parents can dial a USSD code to check announcements, grades, and fee balances.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-medium">Mobile App</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Push notifications for parents who have smartphones with the school app installed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
