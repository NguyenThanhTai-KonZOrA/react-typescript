export type Filter = 'all' | 'active' | 'completed';

export type CellErrorDto = { column: string; message: string };

export type ImportSummaryResponse = {
  batchId: string;
  fileName: string;
  uploadedAt: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  sampleErrors: { rowNumber: number; errors: CellErrorDto[] }[];
};

export type RowDetailsDto = {
  rowNumber: number;
  isValid: boolean;
  data: Record<string, string>;
  errors: CellErrorDto[];
};

export type ImportDetailsResponse = {
  batchId: string;
  fileName: string;
  uploadedAt: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  headers: string[];
  rows: RowDetailsDto[];
};

export type ApprovedImportResponse = {
  representatives: number;
  members: number;
  links: number;
  settlementsInserted: number;
};

export type LoginResponse = {
  userName: string;
  token: string;
}

export type LoginRequest = {
  userName: string;
  password: string;
}

export type SettlementStatementRequest = {
  TeamRepresentativeName: string;
  TeamRepresentativeId: string;
  ProgramName: string;
  StartDate: string;
  EndDate: string;
}

export type SettlementStatementResponse = {
  memberId: string;
  memberName: string;
  joinedDate: string;
  lastGamingDate: string;
  eligible: boolean;
  casinoWinLoss: number;
}

export type TeamRepresentativesRequest = {
  TeamRepresentativeName: string;
  TeamRepresentativeId: string;
  ProgramName: string;
  Month: string;
}

export type TeamRepresentativesResponse = {
  segment: string;
  teamRepresentativeName: string;
  teamRepresentativeId: string;
  settlementDoc: string;
  programName: string;
  month: string;
  casinoWinLoss: number;
  awardTotal: number;
  status: string;
  isPayment: boolean;
}

export type PaymentTeamRepresentativesRequest = {
  TeamRepresentativeName: string;
  TeamRepresentativeId: string;
  Month: string;
}

export type PaymentTeamRepresentativesResponse = {
  isPayment: boolean;
}

export type GenerateCrpReportRequest = {
  TeamRepresentativeId: string;
  Month: string;
}