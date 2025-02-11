import { defineChain } from '@reown/appkit/networks';

// Define the custom network
export const eduTestnet = defineChain({
  id: 656476,
  caipNetworkId: 'eip155:656476',
  chainNamespace: 'eip155',
  name: 'EDU Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    default: {
      http: ["https://open-campus-codex-sepolia.drpc.org"],
      webSocket: undefined,
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet.educhain.xyz' },
  },
  testnet: true
})
