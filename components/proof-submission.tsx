import { Button } from "./ui/button";
import { useWriteContract, useWatchContractEvent } from "wagmi";
import { useFormScan } from "./form-scan";
import { LIST_NETWORKS } from "@/constant/data";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useMemo, useState } from "react";
import { abiVeriFiContract } from "@/lib/utils";

enum SubmissionStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  FAILED = "failed",
}

const ProofSubmissions = () => {
  const { submittedProof, setOpen } = useFormScan();
  const { address: evmAccount } = useAppKitAccount();
  const { caipNetworkId } = useAppKitNetwork();
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);

  const verifiContractAddress = useMemo(() => {
    return LIST_NETWORKS.find(
      (network) => network.caipNetworkId === caipNetworkId
    )?.verifiAddress;
  }, [caipNetworkId]);

  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async () => {
    if (submittedProof) {
      setStatus(SubmissionStatus.LOADING);
      const { attestationId, merkleProof, numberOfLeaves, leafIndex } =
        submittedProof;

      try {
        if (!attestationId || !numberOfLeaves || !leafIndex || !merkleProof) {
          throw new Error("Missing required proof values");
        }
        const formattedMerkleProof = merkleProof.map(
          (proof) => proof as `0x${string}`
        );
        const hash = await writeContractAsync({
          address: verifiContractAddress as `0x${string}`,
          abi: abiVeriFiContract,
          functionName: "proveYouAreHuman",
          args: [
            BigInt(attestationId),
            formattedMerkleProof,
            BigInt(numberOfLeaves),
            BigInt(leafIndex),
          ],
        });
        setStatus(SubmissionStatus.SUCCESS);
        console.log(`Tx sent to EVM, tx-hash ${hash}`);
      } catch (error) {
        console.error("Transaction failed:", error);
        setStatus(SubmissionStatus.FAILED);
      }
    }
  };

  useWatchContractEvent({
    address: verifiContractAddress as `0x${string}`,
    abi: abiVeriFiContract,
    eventName: "SuccessfulProofSubmission",
    args: {
      from: evmAccount as `0x${string}`,
    },
    onLogs: (logs) => {
      console.log("Proof submission successful", logs);
      setStatus(SubmissionStatus.SUCCESS);
    },
  });

  const getMessage = () => {
    switch (status) {
      case SubmissionStatus.SUCCESS:
        return "🎉 Congratulations! You have been successfully verified as a human on VeriFi.";
      case SubmissionStatus.FAILED:
        return "❌ Verification failed. Please try again or contact support if the issue persists.";
      default:
        return "Your proof has been successfully verified on the zkVerify network. Please submit the proof below to complete the verification process on VeriFi.";
    }
  };

  return (
    <div className="space-y-4 p-4 flex items-center justify-center flex-col">
      <div className="w-24 aspect-square rounded-full bg-muted flex items-center justify-center">
        {status === SubmissionStatus.SUCCESS && (
          <div className="text-5xl">🎉</div>
        )}
        {status === SubmissionStatus.FAILED && (
          <div className="text-5xl">❌</div>
        )}
        {(status === SubmissionStatus.IDLE ||
          status === SubmissionStatus.LOADING) && (
          <div className="text-5xl animate-pulse">⏳</div>
        )}
      </div>
      <div className="text-center">{getMessage()}</div>
      {status === SubmissionStatus.SUCCESS ||
      status === SubmissionStatus.FAILED ? (
        <Button className="w-full" onClick={() => setOpen(false)}>
          Close
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={status === SubmissionStatus.LOADING}
        >
          {status === SubmissionStatus.LOADING ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  );
};

export default ProofSubmissions;
