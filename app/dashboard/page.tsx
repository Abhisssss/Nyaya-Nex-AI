"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const [rollNo, setRollNo] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rollNo.trim()) {
      const encodedRollNo = encodeURIComponent(rollNo.trim());
      router.push(`/verify?id=${encodedRollNo}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Payout Portal
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Verify beneficiary payouts
          </p>
        </header>

        <main>
          <form
            onSubmit={handleSearch}
            className="relative flex items-center"
          >
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
        </main>
      </div>
    </div>
  );
}
