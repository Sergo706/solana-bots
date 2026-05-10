export interface OrderResponse  {
  transaction: string;       // base64-encoded transaction
  requestId: string;
  outAmount: string;
  router: string;            // "iris" | "jupiterz" | "dflow" | "okx"
  mode: string;              // "ultra" | "manual"
  feeBps: number;
  feeMint: string;
  platformFee: {
    amount: number;
    feeBps: number;
  }
};

export interface ExecuteResponse  {
  status: "Success" | "Failed";
  signature: string;
  code: number;
  inputAmountResult: string;
  outputAmountResult: string;
  error?: string;
};