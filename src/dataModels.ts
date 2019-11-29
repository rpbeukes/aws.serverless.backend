export type ID = string;

export interface Identifiable {
  id: ID;
}

export interface Item extends Identifiable {
  name: string;
  description: string;
  category: string;
  count?: number;
  consumable?: true;
}

export interface Loan extends Identifiable {
  user: string;
  selections: Selection[];
  collectionDate: string;
  returnDate: string;
  reason: string;
  status: LoanStatus;
  events: LoanEvent[];
}

export type SelectionItem = Exclude<Item, 'count' | 'consumable'>;

export interface Selection {
  item: SelectionItem;
  count: number;
}

export type LoanStatus =
  | 'submitted'
  | 'approved'
  | 'collected'
  | 'returned'
  | 'cancelled';

export interface LoanEvent {
  user: string;
  eventDate: string;
  status: LoanStatus | 'comment';
  comment?: string;
}

export type PatchLoanModel = Pick<LoanEvent, 'status' | 'comment'>;
export type PostLoanModel = Pick<Loan, 'selections' | 'collectionDate' | 'returnDate' | 'reason'>;