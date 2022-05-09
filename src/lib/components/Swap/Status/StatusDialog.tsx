import ErrorDialog, { StatusHeader } from 'lib/components/Error/ErrorDialog'
import EtherscanLink from 'lib/components/EtherscanLink'
import Rule from 'lib/components/Rule'
import SwapSummary from 'lib/components/Swap/Summary'
import useInterval from 'lib/hooks/useInterval'
import { CheckCircle, Clock, Spinner } from 'lib/icons'
import { SwapTransactionInfo, Transaction, TransactionType, WrapTransactionInfo } from 'lib/state/transactions'
import styled, { ThemedText } from 'lib/theme'
import ms from 'ms.macro'
import { useCallback, useMemo, useState } from 'react'
import { ExplorerDataType } from 'utils/getExplorerLink'

import ActionButton from '../../ActionButton'
import Column from '../../Column'
import Row from '../../Row'

const errorMessage = (
  <>
    Try increasing your slippage tolerance.
    <br />
    NOTE: Fee on transfer and rebase tokens are incompatible with Uniswap V3.
  </>
)

const TransactionRow = styled(Row)`
  flex-direction: row-reverse;
`

type PendingTransaction = Transaction<SwapTransactionInfo | WrapTransactionInfo>

function ElapsedTime({ tx }: { tx: PendingTransaction }) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useInterval(() => setElapsedMs(Date.now() - tx.addedTime), tx.receipt ? null : ms`1s`)

  const toElapsedTime = useCallback((ms: number) => {
    let sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)
    sec = sec % 60
    if (min) {
      return (
        <>
          {min}m {sec}s
        </>
      )
    } else {
      return <>{sec}s</>
    }
  }, [])
  return (
    <Row gap={0.5}>
      <Clock />
      <ThemedText.Body2>{toElapsedTime(elapsedMs)}</ThemedText.Body2>
    </Row>
  )
}

interface TransactionStatusProps {
  tx: PendingTransaction
  onClose: () => void
}

function TransactionStatus({ tx, onClose }: TransactionStatusProps) {
  const Icon = useMemo(() => {
    return tx.receipt?.status ? CheckCircle : Spinner
  }, [tx.receipt?.status])
  const heading = useMemo(() => {
    if (tx.info.type === TransactionType.SWAP) {
      return tx.receipt?.status ? "Swap confirmed" : "Swap pending"
    } else if (tx.info.type === TransactionType.WRAP) {
      if (tx.info.unwrapped) {
        return tx.receipt?.status ? "Unwrap confirmed" : "Unwrap pending"
      }
      return tx.receipt?.status ? "Wrap confirmed" : "Wrap pending"
    }
    return tx.receipt?.status ? "Transaction confirmed" : "Transaction pending"
  }, [tx.info, tx.receipt?.status])

  return (
    <Column flex padded gap={0.75} align="stretch" style={{ height: '100%' }}>
      <StatusHeader icon={Icon} iconColor={tx.receipt?.status ? 'success' : undefined}>
        <ThemedText.Subhead1>{heading}</ThemedText.Subhead1>
        {tx.info.type === TransactionType.SWAP ? (
          <SwapSummary input={tx.info.inputCurrencyAmount} output={tx.info.outputCurrencyAmount} />
        ) : null}
      </StatusHeader>
      <Rule />
      <TransactionRow flex>
        <ThemedText.ButtonSmall>
          <EtherscanLink type={ExplorerDataType.TRANSACTION} data={tx.info.response.hash}>
            View on Etherscan
          </EtherscanLink>
        </ThemedText.ButtonSmall>
        <ElapsedTime tx={tx} />
      </TransactionRow>
      <ActionButton onClick={onClose}>
        Close
      </ActionButton>
    </Column>
  )
}

export default function TransactionStatusDialog({ tx, onClose }: TransactionStatusProps) {
  return tx.receipt?.status === 0 ? (
    <ErrorDialog
      header={errorMessage}
      error={new Error('TODO(zzmp)')}
      action={<>Dismiss</>}
      onClick={onClose}
    />
  ) : (
    <TransactionStatus tx={tx} onClose={onClose} />
  )
}
