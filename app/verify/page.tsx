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
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
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
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-sm">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <Badge variant="outline" className="text-base font-semibold">
          {rollNo}
        </Badge>
        <div className="w-8"></div>
      </header>

      <main className="p-4 sm:p-6">
        {!recipient ? (
          <NotFoundCard />
        ) : (
          <div className="mx-auto max-w-md">
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
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{recipient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-slate-600">{recipient.address}</p>
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
    <div className="space-y-4">
      <Alert className="bg-blue-50">
        <AlertTriangle className="h-5 w-5 text-blue-600" />
        <AlertTitle className="font-semibold text-blue-800">
          Verify Identity
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Please confirm the beneficiary&apos;s identity before proceeding.
        </AlertDescription>
      </Alert>
      <ConfirmPayoutButton recipient={recipient} action={confirmPayout} />
    </div>
  );
}

function PaidCard({ paidAt }: { paidAt: string }) {
  return (
    <Card className="bg-emerald-500 text-white shadow-xl">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="mb-4 h-16 w-16" />
        <h2 className="text-2xl font-bold">Payment Confirmed</h2>
        <p className="mt-1 text-lg">
          Paid on: {new Date(paidAt).toLocaleDateString()}
        </p>
        <Link href="/dashboard" className="mt-6 w-full">
          <Button
            variant="outline"
            className="h-14 w-full border-white text-base text-white hover:bg-white/10"
          >
            Find Next Person
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function NotFoundCard() {
  return (
    <Card className="border-red-500 bg-red-50 text-center shadow-lg">
      <CardContent className="p-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-red-800">
          Beneficiary Not Found
        </h2>
        <p className="mt-2 text-red-700">
          The Roll No could not be found. Please check and try again.
        </p>
        <Link href="/dashboard" className="mt-6 block">
          <Button className="h-14 w-full max-w-xs bg-red-600 text-base text-white hover:bg-red-700">
            Try Again
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
