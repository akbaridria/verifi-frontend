/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { LIST_NETWORKS } from "@/constant/data";
import { useFormScan } from "./form-scan";
import { cn } from "@/lib/utils";
import {
  useAppKit,
  useAppKitNetwork,
  useAppKitAccount,
} from "@reown/appkit/react";
import { useMemo } from "react";

const NetworkCard = ({
  network,
  isConnected,
  isSelected,
  onSelect,
}: {
  network: (typeof LIST_NETWORKS)[0];
  isConnected: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const animations = {
    hover: network.supported ? { scale: 1.05 } : {},
    tap: network.supported ? { scale: 0.95 } : {},
  };

  const cardClasses = cn(
    "flex items-center gap-2 p-2 border-2 transition-all text-sm rounded-md",
    {
      "border-gray-300 text-muted-foreground bg-gray-100 cursor-not-allowed":
        !network.supported || !isConnected,
      "border-secondary hover:border-primary hover:bg-muted cursor-pointer":
        network.supported && isConnected,
      "!border-primary": isSelected && isConnected,
    }
  );

  return (
    <motion.div
      key={network.appkitnetwork.id}
      whileHover={animations.hover}
      whileTap={animations.tap}
      className={cardClasses}
      onClick={onSelect}
    >
      <img
        src={network.logo}
        className="aspect-square w-6"
        alt={network.appkitnetwork.name}
      />
      <div>{network.appkitnetwork.name}</div>
    </motion.div>
  );
};

const SelectNetwork = () => {
  const { setSelectedStepIndex } = useFormScan();
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const { caipNetworkId, switchNetwork } = useAppKitNetwork();

  const isValid = useMemo(
    () => ["eip155:656476", "eip155:421614"].includes(caipNetworkId ?? ""),
    [caipNetworkId]
  );

  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="grid grid-cols-2 gap-4">
        {LIST_NETWORKS.map((network) => (
          <NetworkCard
            key={network.appkitnetwork.id}
            network={network}
            isConnected={isConnected}
            isSelected={caipNetworkId === network.caipNetworkId}
            onSelect={() => network.supported && switchNetwork(network.chain)}
          />
        ))}
      </div>

      {isConnected ? (
        <Button
          className="w-full"
          onClick={() => setSelectedStepIndex(1)}
          disabled={!isValid}
        >
          Next
        </Button>
      ) : (
        <Button className="w-full" onClick={() => open()}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default SelectNetwork;
