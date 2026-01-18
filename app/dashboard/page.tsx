"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Clock, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { createClient } from "../../utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "../components/ui/card";

type Payout = {
  name: string;
  roll_no: string;
  paid_at: string;
};

export default function DashboardPage() {
  const [rollNo, setRollNo] = useState("");
  const [debugMsg, setDebugMsg] = useState("");
  const [recentPayouts, setRecentPayouts] = useState<Payout[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userRole, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (userRole?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    const fetchRecentPayouts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("recipients")
          .select("name, roll_no, paid_at")
          .eq("updated_by", user.id)
          .eq("status", "paid")
          .order("paid_at", { ascending: false })
          .limit(10);

        if (error) {
          setDebugMsg("Error fetching recent payouts.");
        } else {
          setRecentPayouts(data);
        }
      }
    };

    fetchUserRole();
    fetchRecentPayouts();
  }, [supabase]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rollNo.trim()) return;

    try {
      const cleanId = rollNo.toUpperCase().replace(/\s/g, "");
      setDebugMsg(`Searching for: ${cleanId}`);
      router.push(`/verify?id=${encodeURIComponent(cleanId)}`);
    } catch (err) {
      if (err instanceof Error) {
        setDebugMsg(`Error: ${err.message}`);
      } else {
        setDebugMsg("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Payout Portal
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Verify beneficiary payouts
            </p>
          </div>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </header>

        <main className="space-y-12">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Input
              id="search"
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Enter Roll No (e.g. MYS/35/53)"
              className="h-16 w-full rounded-lg bg-white pr-14 text-lg shadow-sm"
              required
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 h-12 w-12 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </Button>
          </form>
          {debugMsg && (
            <p className="mt-4 text-center text-sm text-red-500">{debugMsg}</p>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Your Recent Payouts
            </h2>
            {recentPayouts.length > 0 ? (
              <div className="space-y-3">
                {recentPayouts.map((payout) => (
                  <Card key={payout.roll_no}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-bold">{payout.name}</p>
                        <p className="text-sm text-slate-500">
                          {payout.roll_no}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(payout.paid_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500">
                No recent payouts today.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
