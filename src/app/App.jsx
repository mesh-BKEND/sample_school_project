import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Badge } from "./components/ui/badge";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  DollarSign,
  GraduationCap,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import LoginPage from "./components/LoginPage";

const DashboardOverview = lazy(() => import("./components/DashboardOverview"));
const StudentManagement = lazy(() => import("./components/StudentManagement"));
const AttendanceTracking = lazy(() => import("./components/AttendanceTracking"));
const GradesManagement = lazy(() => import("./components/GradesManagement"));
const FeeManagement = lazy(() => import("./components/FeeManagement"));
const Announcements = lazy(() => import("./components/Announcements"));
const TeacherManagement = lazy(() => import("./components/TeacherManagement"));

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, errorMessage: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="text-lg font-semibold">This section could not load</h2>
          <p className="mt-2 text-sm">{this.state.errorMessage}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function SectionFallback() {
  return (
    <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
      Loading section...
    </div>
  );
}

function getRoleTabs(role) {
  if (role === "parent") {
    return [
      { id: "fees", label: "Fees", icon: DollarSign, component: FeeManagement },
      { id: "grades", label: "Performance", icon: BookOpen, component: GradesManagement },
    ];
  }

  if (role === "teacher") {
    return [
      { id: "grades", label: "Performance", icon: BookOpen, component: GradesManagement },
    ];
  }

  return [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, component: DashboardOverview },
    { id: "students", label: "Students", icon: Users, component: StudentManagement },
    { id: "teachers", label: "Teachers", icon: GraduationCap, component: TeacherManagement },
    { id: "attendance", label: "Attendance", icon: Calendar, component: AttendanceTracking },
    { id: "grades", label: "Performance", icon: BookOpen, component: GradesManagement },
    { id: "fees", label: "Fees", icon: DollarSign, component: FeeManagement },
    { id: "announcements", label: "Announcements", icon: Bell, component: Announcements },
  ];
}

function roleLabel(role) {
  if (role === "parent") return "Parent Portal";
  if (role === "teacher") return "Teacher Portal";
  return "Administrator";
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const tabs = useMemo(() => getRoleTabs(currentUser?.role || "admin"), [currentUser?.role]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const rawUser = window.localStorage.getItem("school-user");
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser));
      } catch {
        window.localStorage.removeItem("school-user");
      }
    }
  }, []);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id || "dashboard");
    }
  }, [tabs, activeTab]);

  function handleLogin(user) {
    setCurrentUser(user);
    window.localStorage.setItem("school-user", JSON.stringify(user));
    setActiveTab(getRoleTabs(user.role)[0].id);
  }

  function handleLogout() {
    setCurrentUser(null);
    window.localStorage.removeItem("school-user");
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveComponent = activeTabConfig.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">St. REUBEN ACADEMY</h1>
              <p className="mt-1 text-blue-100">Rural School Management System</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white text-blue-600">
                <Shield className="mr-2 h-4 w-4" />
                {roleLabel(currentUser.role)}
              </Badge>
              <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
                {currentUser.displayName}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900/25 px-4 py-2 text-sm font-medium transition hover:bg-slate-900/35"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className={`mb-6 grid gap-3 ${tabs.length > 3 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-7" : "grid-cols-1 md:grid-cols-2"}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <SectionErrorBoundary resetKey={`${currentUser.role}-${activeTab}`}>
          <Suspense fallback={<SectionFallback />}>
            <ActiveComponent currentUser={currentUser} />
          </Suspense>
        </SectionErrorBoundary>
      </main>
    </div>
  );
}
