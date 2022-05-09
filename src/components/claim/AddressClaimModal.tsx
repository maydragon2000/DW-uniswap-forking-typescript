// @ts-nocheck
import { isAddress } from '@ethersproject/address'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import Circle from '../../assets/images/blue-loader.svg'
import tokenLogo from '../../assets/images/token-logo.png'
import useENS from '../../hooks/useENS'
import { useClaimCallback, useUserHasAvailableClaim, useUserUnclaimedAmount } from '../../state/claim/hooks'
import { useIsTransactionPending } from '../../state/transactions/hooks'
import { CloseIcon, CustomLightSpinner, ExternalLink, ThemedText, UniTokenAnimated } from '../../theme'
import { shortenAddress } from '../../utils'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import AddressInputPanel from '../AddressInputPanel'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Confetti from '../Confetti'
import { Break, CardSection, DataCard } from '../earn/styled'
import { CardBGImage, CardBGImageSmaller, CardNoise } from '../earn/styled'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
`

const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  position: relative;
  background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'};
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

export default function AddressClaimModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const { chainId } = useActiveWeb3React()

  // state for smart contract input
  const [typed, setTyped] = useState('')
  function handleRecipientType(val: string) {
    setTyped(val)
  }

  // monitor for third party recipient of claim
  const { address: parsedAddress } = useENS(typed)

  // used for UI loading states
  const [attempting, setAttempting] = useState<boolean>(false)

  // monitor the status of the claim from contracts and txns
  const { claimCallback } = useClaimCallback(parsedAddress)
  const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(parsedAddress)

  // check if the user has something available
  const hasAvailableClaim = useUserHasAvailableClaim(parsedAddress)

  const [hash, setHash] = useState<string | undefined>()

  // monitor the status of the claim from contracts and txns
  const claimPending = useIsTransactionPending(hash ?? '')
  const claimConfirmed = hash && !claimPending

  // use the hash to monitor this txn

  function onClaim() {
    setAttempting(true)
    claimCallback()
      .then((hash) => {
        setHash(hash)
      })
      // reset modal and log error
      .catch((error) => {
        setAttempting(false)
        console.log(error)
      })
  }

  function wrappedOnDismiss() {
    setAttempting(false)
    setHash(undefined)
    setTyped('')
    onDismiss()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      <Confetti start={Boolean(isOpen && claimConfirmed && attempting)} />
      {!attempting && (
        <ContentWrapper gap="lg">
          <ModalUpper>
            <CardBGImage />
            <CardNoise />
            <CardSection gap="md">
              <RowBetween>
                <ThemedText.White fontWeight={500}>
                  Claim UNI Token
                </ThemedText.White>
                <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="white" />
              </RowBetween>
              <ThemedText.White fontWeight={700} fontSize={36}>
                {unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} UNI
              </ThemedText.White>
            </CardSection>
            <Break />
          </ModalUpper>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0' }} justify="center">
            <ThemedText.SubHeader fontWeight={500}>
              
                Enter an address to trigger a UNI claim. If the address has any claimable UNI it will be sent to them on
                submission.
              
            </ThemedText.SubHeader>
            <AddressInputPanel value={typed} onChange={handleRecipientType} />
            {parsedAddress && !hasAvailableClaim && (
              <ThemedText.Error error={true}>
                Address has no available claim
              </ThemedText.Error>
            )}
            <ButtonPrimary
              disabled={!isAddress(parsedAddress ?? '') || !hasAvailableClaim}
              padding="16px 16px"
              width="100%"
              $borderRadius="12px"
              mt="1rem"
              onClick={onClaim}
            >
              Claim UNI
            </ButtonPrimary>
          </AutoColumn>
        </ContentWrapper>
      )}
      {(attempting || claimConfirmed) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <CardNoise />
          <CardBGImageSmaller desaturate />
          <RowBetween>
            <div />
            <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="black" />
          </RowBetween>
          <ConfirmedIcon>
            {!claimConfirmed ? (
              <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            ) : (
              <UniTokenAnimated width="72px" src={tokenLogo} alt="UNI logo" />
            )}
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <ThemedText.LargeHeader fontWeight={600} color="black">
                {claimConfirmed ? Claimed : Claiming}
              </ThemedText.LargeHeader>
              {!claimConfirmed && (
                <Text fontSize={36} color={'#ff007a'} fontWeight={800}>
                  {unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} UNI
                </Text>
              )}
              {parsedAddress && (
                <ThemedText.LargeHeader fontWeight={600} color="black">
                  for {shortenAddress(parsedAddress)}
                </ThemedText.LargeHeader>
              )}
            </AutoColumn>
            {claimConfirmed && (
              <>
                <ThemedText.SubHeader fontWeight={500} color="black">
                  <span role="img" aria-label="party-hat">
                    🎉{' '}
                  </span>
                  Welcome to team Unicorn :) 
                  <span role="img" aria-label="party-hat">
                    🎉
                  </span>
                </ThemedText.SubHeader>
              </>
            )}
            {attempting && !hash && (
              <ThemedText.SubHeader color="black">
                Confirm this transaction in your wallet
              </ThemedText.SubHeader>
            )}
            {attempting && hash && !claimConfirmed && chainId && hash && (
              <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)} style={{ zIndex: 99 }}>
                View transaction on Explorer
              </ExternalLink>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  )
}
