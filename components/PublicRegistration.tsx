"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Layers3,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import {
  StudentForm,
  blankStudent,
  StudentInput,
} from "@/components/StudentForm";
import { api, post } from "@/components/ui";
export default function PublicRegistration() {
  const [settings, setSettings] = useState({
    institutionName: "Monoline",
    publicRegistrationOpen: true,
  });
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    api<typeof settings>("/api/public/settings")
      .then(setSettings)
      .catch(() =>
        setSettings((s) => ({ ...s, publicRegistrationOpen: false })),
      );
  }, []);
  async function register(data: StudentInput) {
    const result = await post<{ registrationNo: string }>(
      "/api/public/registration",
      data,
    );
    setSuccess(result.registrationNo);
  }
  return (
    <div className="public-site">
      <header className="public-topbar">
        <Link href="/" className="site-logo">
          <span className="brand-mark">
            <Layers3 size={18} />
          </span>
          <span>
            Monoline<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="public-links">
          <span className="header-tag">
            <span className="live-dot" /> Student admissions portal
          </span>
          <Link href="/admin/login" className="button primary small">
            Admin <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>
      <main className="public-main">
        {/* <aside className="public-intro">
          <div className="intro-chip">
            <GraduationCap size={16} /> STUDENT ENROLLMENT
          </div>
          <h1>
            Every great journey starts <em>here.</em>
          </h1>
          <p>
            Welcome to {settings.institutionName}. Complete the student
            registration form to begin your journey with us.
          </p>
          <div className="intro-divider" />
          <div className="intro-perk">
            <span>
              <ClipboardList size={20} />
            </span>
            <div>
              <strong>Simple registration</strong>
              <p>A quick, streamlined enrollment process.</p>
            </div>
          </div>
          <div className="intro-perk">
            <span>
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>Secure information</strong>
              <p>Your details are stored in our student database.</p>
            </div>
          </div>
          <div className="intro-foot">
            <span className="intro-line" /> POWERED BY MONOLINE
          </div>
        </aside> */}
        <section className="public-form-container">
          {success ? (
            <div className="success-panel">
              <div className="success-icon">
                <CheckCircle2 size={33} />
              </div>
              <p className="eyebrow">REGISTRATION COMPLETE</p>
              <h2>You're all set!</h2>
              <p>
                Your registration was successfully submitted. Keep this number
                for your records.
              </p>
              <div className="registration-receipt">
                <span>YOUR REGISTRATION ID</span>
                <strong>{success}</strong>
              </div>
              <button
                className="button primary"
                onClick={() => setSuccess(null)}
              >
                Register another student <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="public-form-card">
              <div className="form-card-header">
                <div>
                  <span className="eyebrow">APPLICATION FORM</span>
                  <h2>Student registration</h2>
                </div>
                <span className="form-header-icon">
                  <GraduationCap size={23} />
                </span>
              </div>
              {!settings.publicRegistrationOpen ? (
                <div className="closed-notice">
                  Registration is currently closed. Please contact the
                  administrator.
                </div>
              ) : (
                <StudentForm
                  key="public-form"
                  initial={blankStudent}
                  onSave={register}
                  submitLabel="Complete registration"
                />
              )}
            </div>
          )}
          <p className="public-fineprint">
            Your registration number is generated automatically after
            submission.
          </p>
        </section>
      </main>
    </div>
  );
}
