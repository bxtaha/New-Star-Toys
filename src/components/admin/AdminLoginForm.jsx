"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminLoginForm = () => {
  const router = useRouter();
  const isProduction = process.env.NODE_ENV === "production";
  const [email, setEmail] = useState("dev@taha.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      toast.success("Welcome back");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
      <div className="relative hidden overflow-hidden bg-primary lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(240,192,64,0.18),_transparent_35%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div>
            <span className="inline-flex rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/80">
              Admin Portal
            </span>
            <h1 className="mt-8 max-w-xl text-5xl font-heading font-bold leading-tight">
              Manage products, blogs, and admins from one modern workspace.
            </h1>
            <p className="mt-6 max-w-lg text-base text-white/80">
              This dashboard is connected to MongoDB and powers your public collection, product, and blog pages.
            </p>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-3xl font-heading font-bold text-foreground">Admin Login</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="dev@taha.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="password"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
