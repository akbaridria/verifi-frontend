/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { buildPoseidon, Poseidon } from "circomlibjs";
import { IProof } from "@/types";
import * as snarkjs from "snarkjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

async function hashLargeArrayMatchingCircuit(
  poseidon: Poseidon,
  array: number[]
) {
  if (array.length !== 129) {
    throw new Error("Array must contain exactly 129 elements");
  }

  const intermediateHashes = [];
  for (let i = 0; i < 9; i++) {
    const chunk = [];
    for (let j = 0; j < 16; j++) {
      const idx = i * 16 + j;
      if (idx < array.length) {
        chunk.push(array[idx]);
      } else {
        chunk.push(0);
      }
    }
    intermediateHashes.push(poseidon.F.toString(poseidon(chunk)));
  }

  const finalHash = poseidon.F.toString(poseidon(intermediateHashes));
  return finalHash;
}

export async function generateInputs(
  faceEmbeddings: Float32Array<ArrayBufferLike>,
  evmAccount: string
) {
  const poseidon = await buildPoseidon();
  const cleanFaceEmbeddings = Array.from(faceEmbeddings)
    .slice(0, 128)
    .map((embedding) => Math.floor(Math.abs(Number(embedding)) * 1_000_000));

  // should be fixed only the system know
  // it can be a formula from the face embedding value or pre-defined constant value
  const secretSalt = 1_000_000;

  const expectedHash = await hashLargeArrayMatchingCircuit(poseidon, [
    ...cleanFaceEmbeddings,
    secretSalt,
  ]);

  const secretValue =
    cleanFaceEmbeddings[3] * 2 +
    (cleanFaceEmbeddings[7] - 1000) +
    (cleanFaceEmbeddings[15] + 1000) +
    cleanFaceEmbeddings[31] * 2;

  const input = {
    address: evmAccount,
    face_embeddings: cleanFaceEmbeddings,
    expected_hash: expectedHash,
    secretSalt: secretSalt.toString(),
    secretValue: secretValue.toString(),
  };

  return input;
}

export async function generateProof(input: IProof) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input as any,
    "./circuit/circuit.wasm",
    "./circuit/circuit.zkey"
  );

  console.log("Proof generated!!", publicSignals);

  return {
    proof,
    publicSignals,
  };
}

export const abiVeriFiContract = [
  {
    type: "constructor",
    inputs: [
      { name: "_zkvContract", type: "address", internalType: "address" },
      { name: "_vkHash", type: "bytes32", internalType: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "PROVING_SYSTEM_ID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isVerified",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proveYouAreHuman",
    inputs: [
      { name: "attestationId", type: "uint256", internalType: "uint256" },
      { name: "merklePath", type: "bytes32[]", internalType: "bytes32[]" },
      { name: "leafCount", type: "uint256", internalType: "uint256" },
      { name: "index", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vkHash",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "zkvContract",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SuccessfulProofSubmission",
    inputs: [
      { name: "from", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
] as const;
