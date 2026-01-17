import { createClient } from "../../utils/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { ConfirmPayoutButton } from "../components/ConfirmPayoutButton";
import { revalidatePath } from "next/cache";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const rollNo = searchParams.id
    ? decodeURIComponent(searchParams.id)
    : undefined;

  if (!rollNo) {
    notFound();
  }

  const supabase = createClient();
  const { data: recipient } = await supabase
    .from("recipients")
    .select("*")
    .eq("roll_no", rollNo)
    .single();

  async function confirmPayout(roll_no: string) {
    "use server";
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("recipients")
      .update({ status: "paid", updated_by: user.id })
      .eq("roll_no", roll_no);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/verify?id=${encodeURIComponent(roll_no)}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <span className="hidden sm:inline">Back</span>
        </Link>
        <Badge variant="outline" className="text-lg font-bold">
          {rollNo}
        </Badge>
        <div className="w-16 sm:w-20"></div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        {!recipient ? (
          <NotFoundCard rollNo={rollNo} />
        ) : (
          <div className="mx-auto max-w-lg">
            <IdentityCard recipient={recipient} />
            <ActionSection recipient={recipient} confirmPayout={confirmPayout} />
          </div>
        )}
      </main>
    </div>
  );
}

function IdentityCard({ recipient }: { recipient: any }) {
  return (
    <Card className="mb-8 overflow-hidden rounded-xl shadow-lg">
      <CardHeader className="bg-slate-100 p-6">
        <CardTitle className="text-4xl font-extrabold tracking-tight text-slate-900">{recipient.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-xl text-slate-700">{recipient.address}</p>
      </CardContent>
    </Card>
  );
}

function ActionSection({
  recipient,
  confirmPayout,
}: {
  recipient: any;
  confirmPayout: (roll_no: string) => Promise<void>;
}) {
  if (recipient.status === "paid") {
    return <PaidCard paidAt={recipient.paid_at} />;
  }

  return (
    <div className="space-y-6">
      <Alert className="rounded-xl border-blue-200 bg-blue-50 p-6">
        <AlertTriangle className="h-6 w-6 text-blue-500" />
        <AlertTitle className="text-lg font-bold text-blue-900">
          Verify Beneficiary Identity
        </AlertTitle>
        <AlertDescription className="mt-2 text-base text-blue-800">
          Please double-check the recipient&apos;s details before confirming the payout.
        </AlertDescription>
      </Alert>
      <ConfirmPayoutButton recipient={recipient} action={confirmPayout} />
    </div>
  );
}

function PaidCard({ paidAt }: { paidAt: string }) {
  return (
    <Card className="overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
        <CheckCircle className="mb-6 h-20 w-20 animate-pulse" />
        <h2 className="text-3xl font-bold">Payment Confirmed</h2>
        <p className="mt-2 text-lg opacity-90">
          Paid on: {new Date(paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <Link href="/dashboard" className="mt-8 w-full">
          <Button
            variant="outline"
            className="h-16 w-full rounded-full border-2 border-white bg-transparent text-lg font-semibold text-white transition-all hover:bg-white/20"
          >
            Find Next Person
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function NotFoundCard({ rollNo }: { rollNo: string }) {
  return (
    <Card className="mx-auto max-w-lg overflow-hidden rounded-xl border-red-200 bg-red-50 text-center shadow-lg">
      <CardContent className="p-8 sm:p-12">
        <XCircle className="mx-auto h-20 w-20 text-red-400" />
        <h2 className="mt-6 text-3xl font-extrabold text-red-800">
          Not Found
        </h2>
        <p className="mt-2 text-lg text-red-700">
          The beneficiary with Roll No <strong className="font-bold">{rollNo}</strong> could not be found.
        </p>
        <p className="mt-1 text-sm text-red-600">Please double-check the number and try again.</p>
        <Link href="/dashboard" className="mt-8 block">
          <Button className="h-16 w-full max-w-xs rounded-full bg-red-600 text-lg font-semibold text-white hover:bg-red-700">
            Search Again
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
