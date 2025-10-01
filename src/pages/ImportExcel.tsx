import React, { useEffect, useMemo, useState } from "react";
import { approveBatch, downloadAnnotated, getBatchDetails, uploadExcel } from "../services/api";
import { ImportDetailsResponse } from "../types";

export default function ImportExcelPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [details, setDetails] = useState<ImportDetailsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const hasErrors = useMemo(() => (details ? details.invalidRows > 0 : true), [details]);

    // Reset page when details change
    useEffect(() => setPage(1), [details, pageSize]);

    const totalPages = useMemo(() => {
        if (!details) return 1;
        return Math.max(1, Math.ceil(details.rows.length / pageSize));
    }, [details, pageSize]);

    const pageRows = useMemo(() => {
        if (!details) return [];
        const start = (page - 1) * pageSize;
        return details.rows.slice(start, start + pageSize);
    }, [details, page, pageSize]);

    async function onUpload() {
        setError(null);
        setSuccess(null);
        if (!selectedFile) {
            setError("Please select a file (.xlsx).");
            return;
        }
        setLoading(true);
        try {
            const summary = await uploadExcel(selectedFile);
            const full = await getBatchDetails(summary.batchId);
            setDetails(full);
            setSuccess("Upload successfully.");
        } catch (e: any) {
            setError(e.message || "Upload failed.");
        } finally {
            setLoading(false);
        }
    }

    async function onApprove() {
        if (!details) return;
        setError(null);
        setSuccess(null);
        setApproving(true);
        try {
            const res = await approveBatch(details.batchId);
            setSuccess(`Approved. Settlements: ${res.settlementsInserted}`);
            const refreshed = await getBatchDetails(details.batchId);
            setDetails(refreshed);
        } catch (e: any) {
            setError(e.message || "Approve failed.");
        } finally {
            setApproving(false);
        }
    }

    async function onDownload() {
        setError(null);
        setSuccess(null);
        try {
            if (!details) throw new Error("No batch.");
            await downloadAnnotated(details.batchId);
        } catch (e: any) {
            setError(e.message || "Download failed.");
        }
    }

    async function onDownloadTemplate() {

    }

    return (
        <div className="container py-4">
            <h3 className="mb-3">Excel Import</h3>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-2 align-items-center">
                        <div className="col-sm-12 col-md-6">
                            <input
                                className="form-control"
                                type="file"
                                accept=".xlsx"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-primary" onClick={onUpload} disabled={loading || !selectedFile}>
                                {loading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-success"
                                onClick={onApprove}
                                disabled={!details || hasErrors || approving}
                                title={hasErrors ? "Resolve errors before approving" : ""}
                            >
                                {approving ? "Approving..." : "Approve"}
                            </button>
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-secondary" onClick={onDownload} disabled={!details}>
                                Download annotated
                            </button>
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-warning" onClick={onDownloadTemplate} disabled={!details}>
                                Download template
                            </button>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
                    {success && <div className="alert alert-success mt-3 mb-0">{success}</div>}
                </div>
            </div>

            {details && (
                <div className="card">
                    <div className="card-header">
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                            <span className="fw-semibold">{details.fileName}</span>
                            <span className="badge bg-info text-dark">Status: {details.status}</span>
                            <span className="badge bg-secondary">Total: {details.totalRows}</span>
                            <span className="badge bg-success">Valid: {details.validRows}</span>
                            <span className="badge bg-danger">Invalid: {details.invalidRows}</span>
                            <div className="ms-auto d-flex align-items-center gap-2">
                                <label className="form-label m-0">Page size</label>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: 90 }}
                                    value={pageSize}
                                    onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                                >
                                    {[10, 20, 50, 100].map((sz) => (
                                        <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-sm table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ whiteSpace: "nowrap" }}>#</th>
                                        {details.headers.map((h) => (
                                            <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                        <th style={{ whiteSpace: "nowrap" }}>Errors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((r) => {
                                        const rowHasError = !r.isValid && r.errors?.length > 0;
                                        return (
                                            <tr key={r.rowNumber} className={rowHasError ? "table-warning" : ""}>
                                                <td>{r.rowNumber}</td>
                                                {details.headers.map((h) => (
                                                    <td key={h}>{r.data?.[h] ?? ""}</td>
                                                ))}
                                                <td>
                                                    {rowHasError ? (
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {r.errors.map((e, idx) => (
                                                                <span key={idx} className="badge text-bg-warning text-dark">
                                                                    {e.column}: {e.message}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-success">OK</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center p-3">
                            <div>
                                Page {page} / {totalPages}
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page === 1}>
                                    « First
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                    ‹ Prev
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                    Next ›
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                                    Last »
                                </button>
                            </div>
                        </div>

                        {hasErrors && (
                            <div className="alert alert-warning m-3">
                                There are invalid rows. Approve is disabled until all rows are valid.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}