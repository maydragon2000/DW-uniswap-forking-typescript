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

export default function ClaimRewardModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)

  async function onClaimReward() {
    if (stakingContract && stakingInfo?.stakedAmount && account) {
      setAttempting(true)
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.CLAIM,
            recipient: account,
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
    error = "Connect Wallet"
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? "Enter an amount"
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <ThemedText.MediumHeader>
              Claim
            </ThemedText.MediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {stakingInfo?.earnedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body fontWeight={600} fontSize={36}>
                {stakingInfo?.earnedAmount?.toSignificant(6)}
              </ThemedText.Body>
              <ThemedText.Body>
                Unclaimed UNI
              </ThemedText.Body>
            </AutoColumn>
          )}
          <ThemedText.SubHeader style={{ textAlign: 'center' }}>
            When you claim without withdrawing your liquidity remains in the mining pool.
          </ThemedText.SubHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onClaimReward}>
            {error ?? Claim}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.Body fontSize={20}>
              Claiming {stakingInfo?.earnedAmount?.toSignificant(6)} UNI
            </ThemedText.Body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.LargeHeader>
              Transaction Submitted
            </ThemedText.LargeHeader>
            <ThemedText.Body fontSize={20}>
              Claimed UNI!
            </ThemedText.Body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
