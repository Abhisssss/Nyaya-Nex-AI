"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { login } from "../actions/auth";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertTriangle } from "lucide-react";

const initialState = {
  message: "",
};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Nyaya Nexus AI
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Payout Verification Portal
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="agent@nyayanexus.ai"
              required
              className="h-14 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-14 text-base"
            />
          </div>

          {state.message && (
            <Alert variant="destructive" className="bg-red-50 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <SignInButton />
        </form>
      </div>
    </div>
  );
}

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="h-14 w-full bg-slate-900 text-base font-semibold text-white hover:bg-slate-800"
      disabled={pending}
    >
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}