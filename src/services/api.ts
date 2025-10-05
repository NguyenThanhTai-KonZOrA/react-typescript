import {
  ApprovedImportResponse,
  GenerateCrpReportRequest,
  ImportDetailsResponse,
  ImportSummaryResponse,
  LoginRequest,
  LoginResponse,
  PaymentTeamRepresentativesRequest,
  PaymentTeamRepresentativesResponse,
  SettlementStatementRequest,
  SettlementStatementResponse,
  TeamRepresentativesRequest,
  TeamRepresentativesResponse,
  UnPaidTeamRepresentativesRequest,
  UnPaidTeamRepresentativesResponse
} from "../types";

const API_BASE = (window as any)._env_?.API_BASE;

// Sử dụng API_BASE như bình thường
console.log("API_BASE:", API_BASE);

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

export async function getTeamRepresentatives(settlementStatementRequest: TeamRepresentativesRequest): Promise<TeamRepresentativesResponse[]> {
  return requestJson<TeamRepresentativesResponse[]>(`${API_BASE}/api/SettlementStatement/list-teamRepresentatives`, {
    method: "POST",
    body: JSON.stringify(settlementStatementRequest),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function paymentTeamRepresentatives(settlementStatementRequest: PaymentTeamRepresentativesRequest): Promise<PaymentTeamRepresentativesResponse> {
  return requestJson<PaymentTeamRepresentativesResponse>(`${API_BASE}/api/SettlementStatement/payment`, {
    method: "POST",
    body: JSON.stringify(settlementStatementRequest),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function unPaidTeamRepresentatives(settlementStatementRequest: UnPaidTeamRepresentativesRequest): Promise<UnPaidTeamRepresentativesResponse> {
  return requestJson<UnPaidTeamRepresentativesResponse>(`${API_BASE}/api/SettlementStatement/unpaid`, {
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

  if (contentType.toLowerCase().startsWith("application/json")) {
    const envelope = (await res.json()) as ApiEnvelope<unknown>;
    if (!envelope.success) {
      throw new Error(getErrorMessage(envelope.data, `HTTP ${envelope.status}`));
    }
    throw new Error("Unexpected JSON response when downloading file.");
  }

  const blob = await res.blob();

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

export async function downloadCrpReport(request: GenerateCrpReportRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/api/ImportExcel/crp-settlement`, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.toLowerCase().startsWith("application/json")) {
    const envelope = (await res.json()) as ApiEnvelope<unknown>;
    if (!envelope.success) {
      throw new Error(getErrorMessage(envelope.data, `HTTP ${envelope.status}`));
    }
    throw new Error("Unexpected JSON response when downloading file.");
  }

  const blob = await res.blob();

  const cd = res.headers.get("content-disposition") || "";
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd);
  const serverFileName = match ? decodeURIComponent(match[1].replace(/"/g, "")) : `CRP_Settlement_${request.TeamRepresentativeId}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = serverFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}