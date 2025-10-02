export type Filter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

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

export type LoginResponse ={
  userName: string;
  token: string;
}

export type LoginRequest ={
  userName: string;
  password: string;
}