import { useState } from "react";
import { ShieldCheck, UserCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const demoAccounts = [
  { role: "Admin", username: "admin", password: "admin123" },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.login({ username, password });
      onLogin(result.user);
    } catch (err) {
      setError(err.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure school access portal
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            One login system for admin, teachers, and parents.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-200">
            Administrators manage the whole school, teachers update class and student
            performance, and parents only see their child&apos;s fees and academic results.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">Admin</p>
              <p className="mt-2 text-sm text-slate-200">
                Manage students, teachers, fees, attendance, approvals, and dashboards.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">Teacher</p>
              <p className="mt-2 text-sm text-slate-200">
                Enter student results, edit class performance, and submit records to admin.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">Parent</p>
              <p className="mt-2 text-sm text-slate-200">
                View only fee status and approved student performance records.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Use your assigned username and password to open the correct portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(event) => setUsername(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Default admin account</p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {demoAccounts.map((account) => (
                  <p key={account.username}>
                    {account.role}: <span className="font-mono">{account.username}</span> /{" "}
                    <span className="font-mono">{account.password}</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Parent accounts are created during student registration. Teacher accounts are
                created by the admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
