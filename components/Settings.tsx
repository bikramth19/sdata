"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Info, LockKeyhole, Save, Settings2, ShieldCheck } from "lucide-react";
import { PageHead, api, post, ErrorMessage } from "@/components/ui";

const registrationSeparators = ["/", "-", "_"] as const;
type Settings = {
  institutionName: string;
  registrationPrefix: string;
  registrationSeparator: (typeof registrationSeparators)[number];
  registrationDigits: number;
  registrationIncludeYear: boolean;
  nextRegistrationNumber: number;
  publicRegistrationOpen: boolean;
};
type SettingsTab = "general" | "registration" | "password";

const tabs = [
  { id: "general", label: "General settings", icon: Settings2 },
  { id: "registration", label: "Registration number", icon: Hash },
  { id: "password", label: "Change password", icon: LockKeyhole },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passBusy, setPassBusy] = useState(false);
  const [passMessage, setPassMessage] = useState("");

  useEffect(() => {
    api<{ user: { permissions: string[] } }>("/api/auth/me")
      .then(result => {
        const canManageSettings = result.user.permissions.includes("settings.manage");
        setAllowed(canManageSettings);
        if (canManageSettings) {
          api<{ settings: Settings }>("/api/settings")
            .then(result => setSettings(result.settings))
            .catch(error => setError(error.message));
        }
      })
      .catch(() => {});
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(current => current ? { ...current, [key]: value } : current);
    setMessage("");
  }

  function updateSeparator(value: string) {
    if (value === "/" || value === "-" || value === "_") {
      update("registrationSeparator", value);
    }
  }

  function formatted() {
    if (!settings) return "";
    return [
      settings.registrationPrefix || "MON",
      ...(settings.registrationIncludeYear ? [new Date().getFullYear()] : []),
      String(settings.nextRegistrationNumber).padStart(settings.registrationDigits, "0"),
    ].join(settings.registrationSeparator || "-");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await post<{ settings: Settings }>("/api/settings", settings, "PATCH");
      setSettings(result.settings);
      setMessage("Settings saved. Changes apply to future registrations.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save settings");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPassMessage("");
    if (password.newPassword !== password.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    setPassBusy(true);
    try {
      const result = await post<{ message: string }>("/api/auth/change-password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassMessage(result.message);
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to change password");
    } finally {
      setPassBusy(false);
    }
  }

  function handleTabKey(event: React.KeyboardEvent<HTMLButtonElement>) {
    const current = tabs.findIndex(tab => tab.id === activeTab);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (current + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;

    event.preventDefault();
    const tab = tabs[next];
    setActiveTab(tab.id);
    document.getElementById(`settings-tab-${tab.id}`)?.focus();
  }

  return (
    <>
      <PageHead
        eyebrow="PREFERENCES & SECURITY"
        title="Settings"
        description="Manage institution preferences, global registration IDs and account security."
      />
      {allowed && (
        <>
          <div className="settings-tabs" role="tablist" aria-label="Settings sections">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`settings-tab-${id}`}
                type="button"
                role="tab"
                tabIndex={activeTab === id ? 0 : -1}
                aria-selected={activeTab === id}
                aria-controls={`settings-panel-${id}`}
                className={`settings-tab${activeTab === id ? " active" : ""}`}
                onKeyDown={handleTabKey}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === "general" && (
            <form onSubmit={save} role="tabpanel" id="settings-panel-general" aria-labelledby="settings-tab-general">
              <section className="panel settings-panel">
                <div className="settings-header">
                  <span className="settings-icon"><Settings2 size={21} /></span>
                  <div><h2>General settings</h2><p>Institution-wide enrollment preferences</p></div>
                </div>
                <div className="settings-fields">
                  <label className="field">
                    Institution name
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      value={settings?.institutionName || ""}
                      disabled={!settings}
                      onChange={event => update("institutionName", event.target.value)}
                    />
                  </label>
                  <label className="switch-row">
                    <span><strong>Public student registration</strong><small>Allow students to submit the registration form without logging in</small></span>
                    <input
                      type="checkbox"
                      checked={settings?.publicRegistrationOpen || false}
                      disabled={!settings}
                      onChange={event => update("publicRegistrationOpen", event.target.checked)}
                    />
                  </label>
                </div>
              </section>
              <div className="setting-save-row">
                <button type="submit" className="button primary" disabled={busy || !settings}>
                  <Save size={16} />{busy ? "Saving..." : "Save settings"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "registration" && (
            <form onSubmit={save} role="tabpanel" id="settings-panel-registration" aria-labelledby="settings-tab-registration">
              <section className="panel settings-panel">
                <div className="settings-header">
                  <span className="settings-icon"><Hash size={21} /></span>
                  <div><h2>Global registration number</h2><p>Configure automatic student ID generation across the application</p></div>
                </div>
                <div className="registration-preview">
                  <div>
                    <small>NEXT REGISTRATION NUMBER PREVIEW</small>
                    <strong>{formatted()}</strong>
                    <span>Existing student IDs will never change.</span>
                  </div>
                  <span className="preview-chip">AUTO-GENERATED</span>
                </div>
                <div className="settings-number-grid">
                  <label className="field">
                    ID prefix
                    <input
                      required
                      pattern="(?:[a-zA-Z0-9]|-){2,12}"
                      value={settings?.registrationPrefix || ""}
                      disabled={!settings}
                      onChange={event => update("registrationPrefix", event.target.value.toUpperCase())}
                    />
                    <small>Letters, numbers and hyphens. Example: MON</small>
                  </label>
                  <label className="field">
                    Separator
                    <select
                      value={settings?.registrationSeparator || "-"}
                      disabled={!settings}
                      onChange={event => updateSeparator(event.target.value)}
                    >
                      {registrationSeparators.map(separator => (
                        <option key={separator} value={separator}>
                          {separator === "/" ? "Slash (/)" : separator === "_" ? "Underscore (_)" : "Hyphen (-)"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Number padding
                    <select
                      value={settings?.registrationDigits || 5}
                      disabled={!settings}
                      onChange={event => update("registrationDigits", Number(event.target.value))}
                    >
                      {[3, 4, 5, 6, 7, 8, 9, 10].map(digits => <option key={digits} value={digits}>{digits} digits</option>)}
                    </select>
                  </label>
                  <label className="field">
                    Next sequence number
                    <input
                      required
                      type="number"
                      min={1}
                      max={999999999}
                      value={settings?.nextRegistrationNumber ?? 1}
                      disabled={!settings}
                      onChange={event => update("nextRegistrationNumber", Number(event.target.value))}
                    />
                    <small>Use with care: an existing number must not be reused.</small>
                  </label>
                  <label className="switch-row compact">
                    <span>
                      <strong>Include current year</strong>
                      <small>e.g. MON{settings?.registrationSeparator || "-"}{new Date().getFullYear()}{settings?.registrationSeparator || "-"}00001</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings?.registrationIncludeYear || false}
                      disabled={!settings}
                      onChange={event => update("registrationIncludeYear", event.target.checked)}
                    />
                  </label>
                </div>
                <div className="info-box">
                  <Info size={16} /> Sequence values increment atomically for every successful registration. Changing the prefix, separator, year format or sequence only affects future students.
                </div>
              </section>
              <div className="setting-save-row">
                <button type="submit" className="button primary" disabled={busy || !settings}>
                  <Save size={16} />{busy ? "Saving..." : "Save settings"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <section className="panel settings-panel" role="tabpanel" id="settings-panel-password" aria-labelledby="settings-tab-password">
              <div className="settings-header">
                <span className="settings-icon"><LockKeyhole size={21} /></span>
                <div><h2>Change password</h2><p>Update your own account password securely</p></div>
              </div>
              <form className="password-settings" onSubmit={changePassword}>
                <label className="field">
                  Current password
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password.currentPassword}
                    onChange={event => setPassword({ ...password, currentPassword: event.target.value })}
                    placeholder="Enter current password"
                  />
                </label>
                <label className="field">
                  New password
                  <input
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    value={password.newPassword}
                    onChange={event => setPassword({ ...password, newPassword: event.target.value })}
                    placeholder="At least 12 characters"
                  />
                </label>
                <label className="field">
                  Confirm new password
                  <input
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    value={password.confirmPassword}
                    onChange={event => setPassword({ ...password, confirmPassword: event.target.value })}
                    placeholder="Repeat new password"
                  />
                </label>
                <button type="submit" className="button secondary" disabled={passBusy}>
                  <ShieldCheck size={16} />{passBusy ? "Changing..." : "Update password"}
                </button>
              </form>
            </section>
          )}
        </>
      )}
      {message && <p className="success-message">{message}</p>}
      {passMessage && <p className="success-message">{passMessage}</p>}
      <ErrorMessage message={error} />
    </>
  );
}
