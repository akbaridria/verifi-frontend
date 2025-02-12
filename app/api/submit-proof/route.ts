import { NextResponse } from "next/server";
import { zkVerifySession, Library, CurveType } from "zkverifyjs";
import vk from "@/circuit/artifacts/verification_key.json";
import { Groth16Proof, PublicSignals } from "snarkjs";

const ZKV_RPC_URL = process.env.ZKV_RPC_URL!;
const ZKV_SEED_PHRASE = process.env.ZKV_SEED_PHRASE!;

export async function POST(request: Request) {
  console.log("🚀 Starting proof submission process...");
  try {
    const input: { proof: Groth16Proof; publicSignals: PublicSignals } = await request.json();
    console.log("📥 Received input:", {
      proof: "... proof data ...",
      publicSignalsLength: input.publicSignals?.length || 0,
    });

    if (!input) {
      console.error("❌ Missing input parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log("🔗 Connecting to zkVerify network...");
    console.log("RPC URL:", ZKV_RPC_URL);
    const session = await zkVerifySession
      .start()
      .Custom(ZKV_RPC_URL)
      .withAccount(ZKV_SEED_PHRASE);
    console.log("✅ Connected to zkVerify network");

    console.log("🔍 Starting proof verification...");
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
    console.log("✅ Proof verification executed");

    events.on("error", (error) => {
      console.error("🚨 Transaction error:", error);
    });

    let attestationId, leafDigest;
    try {
      ({ attestationId, leafDigest } = await transactionResult);
      console.log("📝 Attestation details:");
      console.log(`  - attestationId: ${attestationId}`);
      console.log(`  - leafDigest: ${leafDigest}`);
    } catch (error) {
      console.error("❌ Transaction result error:", error);
      throw error;
    }

    let merkleProof, numberOfLeaves, leafIndex;
    try {
      console.log("🌳 Generating Merkle proof...");
      if (attestationId && leafDigest) {
        const proofDetails = await session.poe(attestationId, leafDigest);
        ({
          proof: merkleProof,
          numberOfLeaves,
          leafIndex,
        } = await proofDetails);
        console.log("📊 Merkle proof details:");
        console.log(`  - merkleProof length: ${merkleProof?.length || 0}`);
        console.log(`  - numberOfLeaves: ${numberOfLeaves}`);
        console.log(`  - leafIndex: ${leafIndex}`);
      } else {
        throw new Error("Attestation ID and leaf digest are required");
      }
    } catch (error) {
      console.error("❌ Merkle proof generation error:", error);
      throw error;
    }

    console.log("✨ Successfully completed proof submission process");
    return NextResponse.json({
      success: true,
      attestationId,
      merkleProof,
      numberOfLeaves,
      leafIndex,
    });
  } catch (error) {
    console.error("❌ Fatal error in proof submission:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
