import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { buildPoseidon, Poseidon } from "circomlibjs";

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
  faceEmbeddings: Float32Array[],
  evmAccount: string
) {
  const poseidon = await buildPoseidon();
  const cleanFaceEmbeddings = faceEmbeddings.map(
    (embedding) => Math.abs(Number(embedding)) * 1_000_000
  );

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
    face_embeddings: faceEmbeddings,
    expected_hash: expectedHash,
    secretSalt: secretSalt.toString(),
    secretValue: secretValue.toString(),
  };

  return input;
}
