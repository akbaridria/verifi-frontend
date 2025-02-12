export interface IProof {
  address: string;
  face_embeddings: number[];
  expected_hash: string;
  secretSalt: string;
  secretValue: string;
}

export interface IProofResponse {
    attestationId?: number;
    merkleProof?: string[];
    numberOfLeaves?: number;
    leafIndex?: number;
}

export interface ResponseSubmitProof extends IProofResponse {
    success: boolean;
    error?: string;
}