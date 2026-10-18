export interface ReportSummary {
  fromDate: string;
  toDate: string;
  totals: {
    newPatients: number;
    appointments: number;
    invoices: number;
    invoicedAmount: number;
    collectedAmount: number;
    invoicePayments: number;
    outstandingAmount: number;
    labOrders: number;
    dispensed: number;
  };
  appointmentsByStatus: { status: string; count: number }[];
  labOrdersByStatus: { status: string; count: number }[];
  pharmacyByStatus: { status: string; count: number }[];
  inventoryByType: { status: string; count: number; quantity: number }[];
  daily: { date: string; revenue: number; appointments: number }[];
}
