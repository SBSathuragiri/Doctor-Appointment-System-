
import { useEffect, useState } from "react";
import { getCommissionSettings, updateCommissionSettings, type CommissionSettings, } from "../../services/adminService";
import "./AdminSettings.css";

const AdminSettings = () => {
    const [mode, setMode] = useState<"fixed" | "percentage">("fixed");
    const [value, setValue] = useState("0");
    const [doctorFee, setDoctorFee] = useState("500");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                setError("");

                const settings: CommissionSettings = await getCommissionSettings();

                setMode(settings.mode);
                setValue(String(settings.value));
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load commission settings"
                );
            } finally {
                setLoading(false);
            }
        };

        void loadSettings();
    }, []);

    const commissionValue = Number(value);
    const doctorFeeValue = Number(doctorFee);

    const validCommission =
        value.trim() !== "" &&
        Number.isFinite(commissionValue) &&
        commissionValue >= 0 &&
        (mode !== "percentage" || commissionValue <= 100);

    const validDoctorFee =
        doctorFee.trim() !== "" &&
        Number.isFinite(doctorFeeValue) &&
        doctorFeeValue >= 0;

    const commissionAmount = validCommission
        ? mode === "fixed"
            ? commissionValue
            : (doctorFeeValue * commissionValue) / 100
        : 0;

    const totalFee = doctorFeeValue + commissionAmount;

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validCommission) {
            setError(
                mode === "percentage"
                    ? "Enter a commission percentage between 0 and 100."
                    : "Enter a valid commission amount of 0 or more."
            );
            return;
        }

        try {
            setSaving(true);

            const settings: CommissionSettings = {
                mode,
                value: commissionValue,
            };

            const saved = await updateCommissionSettings(settings);

            setMode(saved.mode);
            setValue(String(saved.value));
            setSuccess("Commission settings saved successfully.");

            setMode("fixed")
            setValue("0")
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save commission settings"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-settings">Loading settings...</div>;
    }

    return (
        <div className="admin-settings">
            <div className="admin-settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>Configure consultation commission for future bookings.</p>
                </div>
            </div>

            {error && (
                <div className="settings-message settings-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div
                    className="settings-message settings-success"
                    role="status"
                >
                    {success}
                </div>
            )}

            <div className="settings-grid">
                <section className="settings-card">
                    <h2>Commission Configuration</h2>
                    <p className="settings-description">
                        Choose how the platform commission is calculated.
                    </p>

                    <form onSubmit={handleSave}>
                        <div className="settings-field">
                            <label htmlFor="commission-mode">
                                Commission type
                            </label>
                            <select
                                id="commission-mode"
                                value={mode}
                                onChange={(event) => {
                                    setMode(
                                        event.target.value as
                                        | "fixed"
                                        | "percentage"
                                    );
                                    setSuccess("");
                                    setError("");
                                }}
                            >
                                <option value="fixed">
                                    Fixed amount (₹)
                                </option>
                                <option value="percentage">
                                    Percentage (%)
                                </option>
                            </select>
                        </div>

                        <div className="settings-field">
                            <label htmlFor="commission-value">
                                {mode === "fixed"
                                    ? "Commission amount (₹)"
                                    : "Commission percentage (%)"}
                            </label>
                            <input
                                id="commission-value"
                                type="number"
                                min="0"
                                max={mode === "percentage" ? "100" : undefined}
                                step="0.01"
                                value={value}
                                onChange={(event) => {
                                    setValue(event.target.value);
                                    setSuccess("");
                                    setError("");
                                }}
                                required
                            />
                            {mode === "percentage" && (
                                <small>Enter a value from 0 to 100.</small>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="settings-save-button"
                            disabled={saving || !validCommission}
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </section>

                <section className="settings-card">
                    <h2>Fee Preview</h2>
                    <p className="settings-description">
                        Preview how the commission affects a consultation.
                    </p>

                    <div className="settings-field">
                        <label htmlFor="doctor-fee">
                            Doctor consultation fee (₹)
                        </label>
                        <input
                            id="doctor-fee"
                            type="number"
                            min="0"
                            step="0.01"
                            value={doctorFee}
                            onChange={(event) =>
                                setDoctorFee(event.target.value)
                            }
                        />
                    </div>

                    <div className="fee-preview-row">
                        <span>Doctor fee</span>
                        <strong>
                            ₹{validDoctorFee ? doctorFeeValue.toFixed(2) : "—"}
                        </strong>
                    </div>

                    <div className="fee-preview-row">
                        <span>Platform commission</span>
                        <strong>
                            ₹
                            {validDoctorFee && validCommission
                                ? commissionAmount.toFixed(2)
                                : "—"}
                        </strong>
                    </div>

                    <div className="fee-preview-row fee-preview-total">
                        <span>Total patient fee</span>
                        <strong>
                            ₹
                            {validDoctorFee && validCommission
                                ? totalFee.toFixed(2)
                                : "—"}
                        </strong>
                    </div>

                    <p className="settings-note">
                        This is a preview only. Saving settings applies the
                        commission configuration to future bookings; existing
                        booking fees remain unchanged.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AdminSettings;
