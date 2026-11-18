'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccountEffect } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { LAUNCHPAD_CONTRACT_ADDRESS, LAUNCHPAD_ABI } from '../config/contract'

function Home() {
  const { isConnected, address } = useAccount()
  const [amount, setAmount] = useState('')

  // Disconnect listener side-effect tracking
  useAccountEffect({
    onDisconnect() {
      setAmount('')
    },
  })

  // 1. Live Contract Reads
  const { data: rawTotalRaised } = useReadContract({
    address: LAUNCHPAD_CONTRACT_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'totalRaised',
  })

  const { data: rawHardCap } = useReadContract({
    address: LAUNCHPAD_CONTRACT_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'hardCap',
  })

  const { data: claimableBalance } = useReadContract({
    address: LAUNCHPAD_CONTRACT_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'claimableTokens',
    args: [address ? address : '0x0000000000000000000000000000000000000000'],
  })

  // Data processing conversion pipelines
  const totalRaised = rawTotalRaised ? parseFloat(formatEther(rawTotalRaised)) : 0
  const hardCap = rawHardCap ? parseFloat(formatEther(rawHardCap)) : 100 
  const progressPercentage = hardCap > 0 ? (totalRaised / hardCap) * 100 : 0

  // 2. Contract Write Action Instances
  const { writeContract: invest, data: investTxHash, error: investError, isPending: isInvestPending } = useWriteContract()
  const { isLoading: isInvestConfirming, isSuccess: isInvestSuccess } = useWaitForTransactionReceipt({ hash: investTxHash })

  const { writeContract: claim, data: claimTxHash, error: claimError, isPending: isClaimPending } = useWriteContract()
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash })

  const handlePurchase = () => {
    if (!amount || isNaN(Number(amount))) return
    invest({
      address: LAUNCHPAD_CONTRACT_ADDRESS,
      abi: LAUNCHPAD_ABI,
      functionName: 'invest',
      value: parseEther(amount),
    })
  }

  const handleClaim = () => {
    claim({
      address: LAUNCHPAD_CONTRACT_ADDRESS,
      abi: LAUNCHPAD_ABI,
      functionName: 'claim',
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          🚀 PEGASUS LAUNCHPAD
        </div>
        <div>
          <appkit-button balance="show" />
        </div>
      </nav>

      {/* DASHBOARD LAYOUT GRID */}
      <main className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* POOL OVERVIEW */}
        <section className="md:col-span-2 space-y-6">
          <div className="p-8 bg-gray-900/50 border border-gray-900 rounded-2xl backdrop-blur-sm">
            <span className="px-3 py-1 text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
              Live Presale Pool
            </span>
            <h1 className="text-3xl font-extrabold mt-3 mb-2">Pegasus Token (PGS)</h1>
            <p className="text-gray-400 text-sm mb-6">
              Pegasus is a next-generation decentralized launchpad ecosystem built for hyper-scalable token listings. Join the public distribution pool below.
            </p>

            {/* PROGRESS REGISTRATION BAR */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Raised: <strong>{totalRaised} ETH</strong></span>
                <span>Target: {hardCap} ETH</span>
              </div>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-right text-xs text-purple-400 font-medium">
                {progressPercentage.toFixed(1)}% Completed
              </div>
            </div>
          </div>

          {/* PARAMETERS TABS */}
          <div className="p-8 bg-gray-900/50 border border-gray-900 rounded-2xl grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Swap Rate</p>
              <p className="font-semibold text-gray-200">1 ETH = 10,000 PGS</p>
            </div>
            <div>
              <p className="text-gray-500">Access Type</p>
              <p className="font-semibold text-gray-200">Public Tier</p>
            </div>
            <div>
              <p className="text-gray-500">Minimum Contribution</p>
              <p className="font-semibold text-gray-200">0.05 ETH</p>
            </div>
            <div>
              <p className="text-gray-500">Maximum Contribution</p>
              <p className="font-semibold text-gray-200">2.00 ETH</p>
            </div>
          </div>
        </section>

        {/* CONTRIBUTION AND CLAIM ACTION SIDEBAR */}
        <section className="space-y-6">
          {/* PARTICIPATE MODAL */}
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border border-purple-900/30 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">💳 Participate</h2>

            {!isConnected ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-4">Connect your wallet to purchase tokens.</p>
                <div className="flex justify-center"><appkit-button size="md" /></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Amount to Invest (ETH)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.1" 
                      className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isInvestPending || isInvestConfirming}
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-gray-500 font-bold">ETH</span>
                  </div>
                </div>

                <button 
                  onClick={handlePurchase}
                  disabled={isInvestPending || isInvestConfirming || !amount}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all rounded-xl font-bold disabled:opacity-50"
                >
                  {isInvestPending ? 'Check Wallet...' : isInvestConfirming ? 'Processing Tx...' : 'Purchase Tokens'}
                </button>

                {isInvestSuccess && <p className="text-green-400 text-xs text-center mt-2">🎉 Purchase Confirmed!</p>}
                {investError && <p className="text-red-400 text-xs text-center mt-2 break-words">Error: {investError.message.split('\n')[0]}</p>}
              </div>
            )}
          </div>

          {/* ALLOCATION CLAIM PORTAL */}
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border border-emerald-900/30 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🎁 Allocation Portal</h2>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm">Your Claimable Tokens:</span>
              <span className="text-lg font-mono text-emerald-400 font-bold">
                {claimableBalance ? formatEther(claimableBalance) : '0.0'} PGS
              </span>
            </div>

            <button
              onClick={handleClaim}
              disabled={isClaimPending || isClaimConfirming || !claimableBalance || Number(claimableBalance) === 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all rounded-xl font-bold disabled:opacity-50"
            >
              {isClaimPending ? 'Checking Wallet...' : isClaimConfirming ? 'Claiming Tx...' : 'Claim Tokens'}
            </button>

            {isClaimSuccess && <p className="text-green-400 text-xs text-center mt-2">🎉 Claiming Confirmed!</p>}
            {claimError && <p className="text-red-400 text-xs text-center mt-2 break-words">Error: {claimError.message.split('\n')[0]}</p>}
          </div>
        </section>

      </main>
    </div>
  )
}

// Bypasses SSR during 'npm run build' so Next.js doesn't crash on custom browser web components
export default dynamic(() => Promise.resolve(Home), { ssr: false })