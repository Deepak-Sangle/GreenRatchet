// Human-readable labels for enum values
// These are kept separate from generated schemas to allow customization

import {
  CloudProvider,
  KPIStatus,
  LoanCurrency,
  LoanStatus,
  LoanType,
  ObservationPeriod,
  UserRole,
} from "@/app/generated/prisma/enums";

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  FIXED_RATE: "Fixed Rate",
  FLOATING_RATE: "Floating Rate",
  AMORTIZED: "Amortized",
  ANNUITY: "Annuity",
  BALLOON: "Balloon",
  CREDIT_LINE: "Credit Line",
  REVOLVING_CREDIT_LINE: "Revolving Credit Line",
  CREDIT_CARD: "Credit Card",
};

export const CURRENCY_LABELS: Record<LoanCurrency, string> = {
  USD: "USD - US Dollar",
  EUR: "EUR - Euro",
  GBP: "GBP - British Pound",
  JPY: "JPY - Japanese Yen",
  AUD: "AUD - Australian Dollar",
  CAD: "CAD - Canadian Dollar",
  CHF: "CHF - Swiss Franc",
};

export const OBSERVATION_PERIOD_LABELS: Record<ObservationPeriod, string> = {
  ANNUAL: "Annual",
  QUARTERLY: "Quarterly",
  MONTHLY: "Monthly",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export const KPI_STATUS_LABELS: Record<KPIStatus, string> = {
  PROPOSED: "Proposed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export const CLOUD_PROVIDER_LABELS: Record<CloudProvider, string> = {
  AWS: "Amazon Web Services",
  GCP: "Google Cloud Platform",
  AZURE: "Microsoft Azure",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  BORROWER: "Borrower",
  LENDER: "Lender",
};
