// @ts-nocheck
import { TransactionResponse } from '@ethersproject/providers'
import StakingRewardsJson from '@uniswap/liquidity-staker/build/StakingRewards.json'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ReactNode, useState } from 'react'
import styled from 'styled-components/macro'

import { useContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { TransactionType } from '../../state/transactions/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, ThemedText } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

const { abi: STAKING_REWARDS_ABI } = StakingRewardsJson

function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean) {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)

  async function onWithdraw() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract
        .exit({ gasLimit: 300000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.WITHDRAW_LIQUIDITY_STAKING,
            token0Address: stakingInfo.tokens[0].address,
            token1Address: stakingInfo.tokens[1].address,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: ReactNode | undefined
  if (!account) {
    error = "Connect a wallet"
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? "Enter an amount"
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <ThemedText.MediumHeader>
              Withdraw
            </ThemedText.MediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {stakingInfo?.stakedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakingInfo.stakedAmount} />}
              </ThemedText.Body>
              <ThemedText.Body>
                Deposited liquidity:
              </ThemedText.Body>
            </AutoColumn>
          )}
          {stakingInfo?.earnedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakingInfo?.earnedAmount} />}
              </ThemedText.Body>
              <ThemedText.Body>
                Unclaimed UNI
              </ThemedText.Body>
            </AutoColumn>
          )}
          <ThemedText.SubHeader style={{ textAlign: 'center' }}>
            When you withdraw, your UNI is claimed and your liquidity is removed from the mining pool.
          </ThemedText.SubHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onWithdraw}>
            {error ?? Withdraw & Claim}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.Body fontSize={20}>
              Withdrawing {stakingInfo?.stakedAmount?.toSignificant(4)} UNI-V2
            </ThemedText.Body>
            <ThemedText.Body fontSize={20}>
              Claiming {stakingInfo?.earnedAmount?.toSignificant(4)} UNI
            </ThemedText.Body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.LargeHeader>
              Transaction Submitted
            </ThemedText.LargeHeader>
            <ThemedText.Body fontSize={20}>
              Withdrew UNI-V2!
            </ThemedText.Body>
            <ThemedText.Body fontSize={20}>
              Claimed UNI!
            </ThemedText.Body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
