export interface Claim {
  id: string;
  userId: string;
  reason: string;
  amount: number;
  status: string;
  createdAt: string;
}

// In-memory storage
let claims: Claim[] = [
  {
    id: "1711530000001",
    userId: "W001",
    reason: "Heavy Rainfall",
    amount: 350,
    status: "Auto-Generated",
    createdAt: new Date().toISOString(),
  },
  {
    id: "1711530000002",
    userId: "W002",
    reason: "Accident",
    amount: 1500,
    status: "Pending",
    createdAt: new Date().toISOString(),
  }
];

export const getClaims = (): Claim[] => {
  return [...claims];
};

export const addClaim = (claimData: Omit<Claim, "id" | "createdAt" | "status"> & { status?: string }): Claim => {
  const newClaim: Claim = {
    ...claimData,
    id: Date.now().toString(),
    status: claimData.status || "Pending",
    createdAt: new Date().toISOString(),
  };
  claims = [newClaim, ...claims];
  return newClaim;
};
