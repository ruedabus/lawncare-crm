"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateCustomerForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const emailIsValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const phoneIsValid = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length < 4) return digits;
    if (digits.length < 7) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validateForm = (
    values: {
      name: string;
      email: string;
      phone: string;
    },
    options?: {
      requireName?: boolean;
    }
  ) => {
    const requireName = options?.requireName ?? true;

    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    if (requireName && !values.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (values.email.trim() && !emailIsValid(values.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (values.phone.trim() && !phoneIsValid(values.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    return newErrors;
  };

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    emailIsValid(email) &&
    phoneIsValid(phone);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validateForm({ name, email, phone });
    setErrors(newErrors);
    setErrorMessage("");
    setSuccessMessage("");

    if (newErrors.name || newErrors.email || newErrors.phone) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Something went wrong.");
        setSaving(false);
        return;
      }

      setSuccessMessage("Customer created successfully.");
      setErrors({
        name: "",
        email: "",
        phone: "",
      });
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      router.refresh();
    } catch {
      setErrorMessage("Unable to save customer.");
    } finally {
      setSaving(false);
    }
  }
  
  function handleCancel() {
  setName("");
  setEmail("");
  setPhone("");
  setAddress("");
  setErrors({
    name: "",
    email: "",
    phone: "",
  });
  setErrorMessage("");
  setSuccessMessage("");
}

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Add Customer</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a new customer record for billing and scheduling.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              setErrors((prev) => ({
                ...prev,
                ...validateForm(
                  { name: value, email, phone },
                  { requireName: true }
                ),
              }));
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
            }`}
            placeholder="John Doe"
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
                ...validateForm(
                  { name, email: value, phone },
                  { requireName: false }
                ),
              }));
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
            }`}
            placeholder="john@email.com"
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
                ...validateForm(
                  { name, email, phone: value },
                  { requireName: false }
                ),
              }));
              setErrorMessage("");
              setSuccessMessage("");
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

        <Field label="Address">
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="123 Main St"
          />
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

        <div className="flex items-center gap-3">
  <button
    type="submit"
    disabled={saving || !isFormValid}
    className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
  >
    {saving ? "Saving..." : "Save Customer"}
  </button>

  <button
    type="button"
    onClick={handleCancel}
    className="inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
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