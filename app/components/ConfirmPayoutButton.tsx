"use client";

import { Button } from "./ui/button";

export function ConfirmPayoutButton({
  recipient,
  action,
}: {
  recipient: any;
  action: (roll_no: string) => Promise<void>;
}) {
  const handleConfirm = () => {
    if (
      window.confirm(`Are you sure you want to pay ${recipient.name}?`)
    ) {
      action(recipient.roll_no);
    }
  };

  return (
    <Button
      onClick={handleConfirm}
      className="h-16 w-full bg-slate-900 text-lg font-bold text-white hover:bg-slate-800"
    >
      CONFIRM PAYOUT
    </Button>
  );
}
