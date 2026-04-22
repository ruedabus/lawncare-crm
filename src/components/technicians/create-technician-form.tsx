"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FormErrors = {
  name: string;
  email: string;
  phone: string;
};

const COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#dc2626",
  "#0891b2",
];

export function CreateTechnicianForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    phone: "",
  });

  const emailIsValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const phoneIsValid = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  function validateForm(values: {
    name: string;
    email: string;
    phone: string;
  }): FormErrors {
    const nextErrors: FormErrors = {
      name: "",
      email: "",
      phone: "",
    };

    if (!values.name.trim()) {
      nextErrors.name = "Technician name is required.";
    }

    if (values.email.trim() && !emailIsValid(values.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (values.phone.trim() && !phoneIsValid(values.phone)) {
      nextErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    return nextErrors;
  }

  const isFormValid = useMemo(() => {
    const nextErrors = validateForm({ name, email, phone });
    return !nextErrors.name && !nextErrors.email && !nextErrors.phone;
  }, [name, email, phone]);

  function handleCancel() {
    setName("");
    setEmail("");
    setPhone("");
    setColor("#2563eb");
    setErrors({
      name: "",
      email: "",
      phone: "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validateForm({ name, email, phone });
    setErrors(nextErrors);
    setErrorMessage("");
    setSuccessMessage("");

    if (nextErrors.name || nextErrors.email || nextErrors.phone) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/technicians", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          color,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create technician.");
        return;
      }

      setSuccessMessage("Technician created successfully.");
      handleCancel();
      router.refresh();
    } catch {
      setErrorMessage("Unable to create technician.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Add Technician
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a crew member for scheduling and dispatch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              setErrors((prev) => ({
                ...prev,
                ...validateForm({ name: value, email, phone }),
              }));
            }}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
            }`}
            placeholder="Mike"
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          ) : null}
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
              setErrors((prev) => ({
                ...prev,
                ...validateForm({ name, email: value, phone }),
              }));
            }}
            spellCheck={false}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
            }`}
            placeholder="mike@email.com"
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          ) : null}
        </Field>

        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const value = formatPhone(e.target.value);
              setPhone(value);
              setErrors((prev) => ({
                ...prev,
                ...validateForm({ name, email, phone: value }),
              }));
            }}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.phone
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone ? (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          ) : null}
        </Field>

        <Field label="Color">
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                className={`h-9 w-9 rounded-full ring-2 transition ${
                  color === option ? "ring-slate-900" : "ring-slate-200"
                }`}
                style={{ backgroundColor: option }}
                aria-label={`Select color ${option}`}
              />
            ))}
          </div>
        </Field>

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving || !isFormValid}
            className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Technician"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}