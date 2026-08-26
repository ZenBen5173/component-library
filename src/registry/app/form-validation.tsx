"use client";

/**
 * @name Form Validation
 * @description Real form wiring — schema validation, per-field errors, and a submit button that shows pending state.
 * @tags form, validation, zod, react-hook-form, app
 * @height 780
 * @deps react-hook-form, zod, @hookform/resolvers
 * @note The one piece of App UI that's logic rather than looks. Form Controls has the inputs; this has the schema, errors and submit lifecycle around them.
 * @source src/components/ui/form.tsx
 */
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "At least 2 characters.").max(32, "Keep it under 32."),
  slug: z
    .string()
    .min(3, "At least 3 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only."),
  email: z.string().email("That doesn't look like an email."),
  region: z.string().min(1, "Pick a region."),
  notes: z.string().max(140, "140 characters max.").optional(),
});

export default function FormValidationDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", email: "", region: "", notes: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setSubmitted(values.slug);
  }

  const pending = form.formState.isSubmitting;

  return (
    <div className="min-h-[780px] bg-background p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto grid max-w-md gap-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme dashboard" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="acme-dashboard" {...field} />
                </FormControl>
                <FormDescription>
                  Used in the URL. Try typing spaces or capitals.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing email</FormLabel>
                <FormControl>
                  <Input placeholder="you@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="iad">us-east — Washington</SelectItem>
                    <SelectItem value="sfo">us-west — San Francisco</SelectItem>
                    <SelectItem value="fra">eu-central — Frankfurt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending && <Spinner className="size-4" />}
              {pending ? "Creating…" : "Create project"}
            </Button>
            {submitted && (
              <span className="text-xs text-emerald-500">
                Created {submitted}
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
