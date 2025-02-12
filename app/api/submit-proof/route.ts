import { NextResponse } from "next/server";
import { zkVerifySession, Library, CurveType } from "zkverifyjs";
import vk from "@/circuit/artifacts/verification_key.json";
import { Groth16Proof, PublicSignals } from "snarkjs";

const ZKV_RPC_URL = process.env.ZKV_RPC_URL!;
const ZKV_SEED_PHRASE = process.env.ZKV_SEED_PHRASE!;

export async function POST(request: Request) {
  try {
    const input: { proof: Groth16Proof; publicSignals: PublicSignals } =
      await request.json();

    if (!input) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Start zkVerify session
    const session = await zkVerifySession
      .start()
      .Custom(ZKV_RPC_URL)
      .withAccount(ZKV_SEED_PHRASE);

    // Verify proof
    const { events, transactionResult } = await session
      .verify()
      .groth16(Library.snarkjs, CurveType.bn128)
      .waitForPublishedAttestation()
      .execute({
        proofData: {
          vk,
          proof: input.proof,
          publicSignals: input.publicSignals,
        },
      });
    events.on("error", (error) => {
      console.error("An error occurred during the transaction:", error);
    });

    let attestationId, leafDigest;
    try {
      ({ attestationId, leafDigest } = await transactionResult);
      console.log(`Attestation published on zkVerify`);
      console.log(`\tattestationId: ${attestationId}`);
      console.log(`\tleafDigest: ${leafDigest}`);
    } catch (error) {
      console.error("Transaction failed:", error);
    }

    let merkleProof, numberOfLeaves, leafIndex;
    try {
      if (attestationId && leafDigest) {
        const proofDetails = await session.poe(attestationId, leafDigest);
        ({
          proof: merkleProof,
          numberOfLeaves,
          leafIndex,
        } = await proofDetails);
        console.log(`Merkle proof details`);
        console.log(`\tmerkleProof: ${merkleProof}`);
        console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
        console.log(`\tleafIndex: ${leafIndex}`);
      } else throw new Error("Attestation ID and leaf digest are required");
    } catch (error) {
      console.error("RPC failed:", error);
    }

    return NextResponse.json({
      success: true,
      attestationId,
      merkleProof,
      numberOfLeaves,
      leafIndex,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
