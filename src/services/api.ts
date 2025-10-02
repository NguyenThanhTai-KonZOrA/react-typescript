import {
  ApprovedImportResponse,
  ImportDetailsResponse,
  ImportSummaryResponse,
  LoginRequest,
  LoginResponse,
  SettlementStatementRequest,
  SettlementStatementResponse
} from "../types";

const API_BASE = "https://localhost:7044";

type ApiEnvelope<T> = {
  status: number;
  data: T;
  success: boolean;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string") return data || fallback;
  try {
    return JSON.stringify(data) || fallback;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  // Luôn đọc JSON (kể cả khi res.ok = false) vì middleware luôn trả JSON wrapper
  const envelope = (await res.json()) as ApiEnvelope<T>;
  if (!envelope.success) {
    throw new Error(getErrorMessage(envelope.data, `HTTP ${envelope.status}`));
  }
  return envelope.data;
}

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginResponse>(`${API_BASE}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(loginRequest),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function uploadExcel(file: File): Promise<ImportSummaryResponse> {
  const form = new FormData();
  form.append("file", file);
  return requestJson<ImportSummaryResponse>(`${API_BASE}/api/ImportExcel/upload`, {
    method: "POST",
    body: form,
  });
}

export async function getBatchDetails(batchId: string): Promise<ImportDetailsResponse> {
  return requestJson<ImportDetailsResponse>(`${API_BASE}/api/ImportExcel/${batchId}/details`);
}

export async function settlementStatementSearch(settlementStatementRequest: SettlementStatementRequest): Promise<SettlementStatementResponse[]> {
  return requestJson<SettlementStatementResponse[]>(`${API_BASE}/api/SettlementStatement/settlement-statement-search`, {
    method: "POST",
    body: JSON.stringify(settlementStatementRequest),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function approveBatch(batchId: string): Promise<ApprovedImportResponse> {
  return requestJson<ApprovedImportResponse>(`${API_BASE}/api/ImportExcel/approve/${batchId}`, {
    method: "POST",
  });
}

export async function downloadAnnotated(batchId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/ImportExcel/${batchId}/annotated`);
  const contentType = res.headers.get("content-type") ?? "";

  // Nếu middleware trả JSON (lỗi), unwrap và ném lỗi
  if (contentType.toLowerCase().startsWith("application/json")) {
    const envelope = (await res.json()) as ApiEnvelope<unknown>;
    if (!envelope.success) {
      throw new Error(getErrorMessage(envelope.data, `HTTP ${envelope.status}`));
    }
    // Trường hợp hiếm: server trả JSON thành công cho endpoint download (không mong đợi)
    throw new Error("Unexpected JSON response when downloading file.");
  }

  // Bình thường: nhận file .xlsx
  const blob = await res.blob();

  // Lấy filename từ header nếu có
  const cd = res.headers.get("content-disposition") || "";
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd);
  const serverFileName = match ? decodeURIComponent(match[1].replace(/"/g, "")) : "annotated.xlsx";

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = serverFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}