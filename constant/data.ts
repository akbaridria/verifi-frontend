/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppKitNetwork } from "@reown/appkit/networks";
import { eduTestnet } from "@/lib/edu-testnet";
import { arbitrumSepolia } from "@reown/appkit/networks";

export const LIST_NETWORKS: {
  zkVerifyAddress: string;
  logo: string;
  supported: boolean;
  caipNetworkId: string;
  chain: any;
  verifiAddress: string;
  appkitnetwork: AppKitNetwork;
}[] = [
  {
    zkVerifyAddress: "0x209f82A06172a8d96CF2c95aD8c42316E80695c1",
    logo: "https://ethereum.org/images/favicon.png",
    supported: false,
    caipNetworkId: "eip155:11155111",
    chain: "",
    verifiAddress: "",
    appkitnetwork: {
      caipNetworkId: "eip155:11155111",
      id: "0xaa36a7",
      chainNamespace: "eip155",
      name: "Sepolia (Ethereum testnet)",
      nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "SEP",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://ethereum-sepolia-rpc.publicnode.com"],
          webSocket: undefined,
        },
      },
    },
  },
  {
    zkVerifyAddress: "0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5",
    logo: "https://apechain.com/favicon.ico",
    supported: false,
    caipNetworkId: "eip155:33111",
    chain: "",
    verifiAddress: "",
    appkitnetwork: {
      caipNetworkId: "eip155:33111",
      id: "0x8157",
      chainNamespace: "eip155",
      name: "Curtis (ApeChain testnet)",
      nativeCurrency: {
        name: "APE",
        symbol: "APE",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://rpc.curtis.apechain.com"],
          webSocket: undefined,
        },
      },
    },
  },
  {
    zkVerifyAddress: "0x6A51D573Bf6fcFdb5D4E394645647304bb9FAb5B",
    logo: "https://eon.horizen.io/global/favicon.svg",
    supported: false,
    caipNetworkId: "eip155:1663",
    chain: "",
    verifiAddress: "",
    appkitnetwork: {
      caipNetworkId: "eip155:1663",
      id: "0x67f",
      chainNamespace: "eip155",
      name: "Gobi (EON testnet)",
      nativeCurrency: {
        name: "tZEN",
        symbol: "tZEN",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://gobi-rpc.horizenlabs.io/ethv1"],
          webSocket: undefined,
        },
      },
    },
  },
  {
    zkVerifyAddress: "0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5",
    logo: "https://arbitrum.io/favicon.ico",
    supported: true,
    caipNetworkId: "eip155:421614",
    chain: arbitrumSepolia,
    verifiAddress: "0x932cb1765157970250f924f9dC0113B847342f4A",
    appkitnetwork: {
      caipNetworkId: "eip155:421614",
      id: "0x66eee",
      chainNamespace: "eip155",
      name: "Arbitrum (Sepolia testnet)",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://arbitrum-sepolia-rpc.publicnode.com"],
          webSocket: undefined,
        },
      },
    },
  },
  {
    zkVerifyAddress: "0x147AD899D1773f5De5e064C33088b58c7acb7acf",
    logo: "https://educhain.xyz/favicon.ico",
    supported: true,
    caipNetworkId: "eip155:656476",
    chain: eduTestnet,
    verifiAddress: "0x464b6a935f2363779fFADEf46f0263E53ae67D20",
    appkitnetwork: {
      caipNetworkId: "eip155:656476",
      id: "0xa045c",
      chainNamespace: "eip155",
      name: "EDU Chain testnet",
      nativeCurrency: {
        name: "EDU",
        symbol: "EDU",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://open-campus-codex-sepolia.drpc.org"],
          webSocket: undefined,
        },
      },
    },
  },
];

