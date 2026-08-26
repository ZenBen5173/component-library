"use client";

/**
 * @name OTP Input
 * @description Six-digit code entry — digits animate in as you type, paste fills every box, backspace walks back.
 * @tags otp, input, auth, verification, form, app
 * @height 460
 * @deps motion
 * @note Try pasting a 6-digit code rather than typing it — that's the case hand-rolled OTP inputs usually get wrong.
 * @source src/components/smoothui/animated-o-t-p-input/index.tsx
 */
import { useState } from "react";
import { AnimatedOTPInput } from "@/components/smoothui/animated-o-t-p-input";

export default function OtpInputDemo() {
  const [done, setDone] = useState<string | null>(null);

  return (
    <div className="grid min-h-[460px] place-items-center bg-background p-10">
      <div className="text-center">
        <p className="text-sm font-medium">Check your email</p>
        <p className="mx-auto mt-1.5 mb-8 max-w-xs text-xs leading-relaxed text-muted-foreground">
          We sent a six-digit code to ada@acme.com.
        </p>

        <AnimatedOTPInput maxLength={6} onComplete={setDone} />

        <p className="mt-6 min-h-[18px] text-xs text-emerald-500">
          {done ? `Verified — ${done}` : ""}
        </p>
      </div>
    </div>
  );
}
