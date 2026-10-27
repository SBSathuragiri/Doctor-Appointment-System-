
import { useCallback, useEffect, useState } from "react";
import { getAdminPatients, type AdminPatient, } from "../../services/adminService";
import "./AdminPatients.css";

const AdminPatients = () => {
    const [patients, setPatients] = useState<AdminPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const loadPatients = useCallback(async () => {
        setError("");

        try {
            const data = await getAdminPatients();
            setPatients(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load patient accounts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPatients();
    }, [loadPatients]);

    const filteredPatients = patients.filter((patient) => {
        const query = search.trim().toLowerCase();

        return (
            patient.name.toLowerCase().includes(query) ||
            patient.email.toLowerCase().includes(query) ||
            patient.patient_id.includes(query)
        );
    });

    const activeCount = patients.filter((patient) => patient.is_active).length;
    const inactiveCount = patients.length - activeCount;

    return (
        <div className="admin-patients-page">
            <div className="admin-welcome">
                <div>
                    <h1>Patient Management</h1>
                    <p>View and monitor registered patient accounts.</p>
                </div>

                <button
                    type="button"
                    className="admin-patients-refresh"
                    onClick={() => {
                        setLoading(true);
                        void loadPatients();
                    }}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="admin-error" role="alert">
                    {error}
                </div>
            )}

            <section className="admin-patient-stats">
                <article>
                    <span>Total Patients</span>
                    <strong>{loading ? "…" : patients.length}</strong>
                </article>

                <article>
                    <span>Active Accounts</span>
                    <strong>{loading ? "…" : activeCount}</strong>
                </article>

                <article>
                    <span>Inactive Accounts</span>
                    <strong>{loading ? "…" : inactiveCount}</strong>
                </article>
            </section>

            <section className="admin-panel admin-patients-panel">
                <div className="admin-patients-toolbar">
                    <div>
                        <h2>Registered Patients</h2>
                        <p>Search patient accounts by name, email, or ID.</p>
                    </div>

                    <input
                        type="search"
                        aria-label="Search patients"
                        placeholder="Search patients..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="admin-patients-message">Loading patients…</p>
                ) : filteredPatients.length === 0 ? (
                    <p className="admin-patients-message">
                        {patients.length === 0
                            ? "No patient accounts found."
                            : "No patients match your search."}
                    </p>
                ) : (
                    <div className="admin-patients-table-wrapper">
                        <table className="admin-patients-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Email</th>
                                    <th>Registered</th>
                                    <th>Account Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.patient_id}>
                                        <td>
                                            <strong>{patient.name}</strong>
                                            <span>
                                                ID: {patient.patient_id}
                                            </span>
                                        </td>

                                        <td>{patient.email}</td>

                                        <td>
                                            {new Date(
                                                patient.created_at
                                            ).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-patient-status ${patient.is_active
                                                    ? "active"
                                                    : "inactive"
                                                    }`}
                                            >
                                                {patient.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminPatients;
