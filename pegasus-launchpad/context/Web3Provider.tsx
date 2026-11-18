'use client'

import React, { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork } from '@reown/appkit/networks'

const queryClient = new QueryClient()
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ''

const metadata = {
  name: 'Pegasus Launchpad',
  description: 'Decentralized Token Launchpad',
  url: 'https://pegasus-launchpad.com',
  icons: ['https://githubusercontent.com']
}

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, sepolia]

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}