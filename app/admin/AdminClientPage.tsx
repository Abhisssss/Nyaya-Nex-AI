"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { createClient } from "../../utils/supabase/client";

export default function AdminClientPage({
  payouts,
  totalCount,
  currentPage,
  currentStatus,
}: {
  payouts: any[];
  totalCount: number;
  currentPage: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleTabChange = (status: "paid" | "unpaid") => {
    router.push(`/admin?status=${status}&page=1`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin?${params.toString()}`);
  };

  const handleDownload = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_payout_report")
      .select("roll_no, name, address, status, paid_at, agent_email")
      .eq("status", currentStatus);

    if (data) {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `payout_report_${currentStatus}_${new Date().toISOString()}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={handleDownload} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Downloading..." : `Download ${currentStatus} CSV`}
        </Button>
      </header>

      <div className="mb-4 flex gap-2">
        <Button
          variant={currentStatus === "paid" ? "default" : "outline"}
          onClick={() => handleTabChange("paid")}
        >
          Paid
        </Button>
        <Button
          variant={currentStatus === "unpaid" ? "default" : "outline"}
          onClick={() => handleTabChange("unpaid")}
        >
          Unpaid
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left">
              <thead>
                <tr>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Agent Email</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.roll_no} className="border-b">
                    <td className="p-4">{payout.roll_no}</td>
                    <td className="p-4">{payout.name}</td>
                    <td className="p-4">{payout.status}</td>
                    <td className="p-4">{payout.agent_email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
