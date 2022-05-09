import { Fraction, TradeType } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

import { nativeOnChain } from '../../constants/tokens'
import { useCurrency, useToken } from '../../hooks/Tokens'
import useENSName from '../../hooks/useENSName'
import { VoteOption } from '../../state/governance/types'
import {
  AddLiquidityV2PoolTransactionInfo,
  AddLiquidityV3PoolTransactionInfo,
  ApproveTransactionInfo,
  ClaimTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV3PoolTransactionInfo,
  DelegateTransactionInfo,
  DepositLiquidityStakingTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  MigrateV2LiquidityToV3TransactionInfo,
  RemoveLiquidityV3TransactionInfo,
  SubmitProposalTransactionInfo,
  TransactionInfo,
  TransactionType,
  VoteTransactionInfo,
  WithdrawLiquidityStakingTransactionInfo,
  WrapTransactionInfo,
} from '../../state/transactions/actions'

function formatAmount(amountRaw: string, decimals: number, sigFigs: number): string {
  return new Fraction(amountRaw, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))).toSignificant(sigFigs)
}

function FormattedCurrencyAmount({
  rawAmount,
  symbol,
  decimals,
  sigFigs,
}: {
  rawAmount: string
  symbol: string
  decimals: number
  sigFigs: number
}) {
  return (
    <>
      {formatAmount(rawAmount, decimals, sigFigs)} {symbol}
    </>
  )
}

function FormattedCurrencyAmountManaged({
  rawAmount,
  currencyId,
  sigFigs = 6,
}: {
  rawAmount: string
  currencyId: string
  sigFigs: number
}) {
  const currency = useCurrency(currencyId)
  return currency ? (
    <FormattedCurrencyAmount
      rawAmount={rawAmount}
      decimals={currency.decimals}
      sigFigs={sigFigs}
      symbol={currency.symbol ?? '???'}
    />
  ) : null
}

function ClaimSummary({ info: { recipient, uniAmountRaw } }: { info: ClaimTransactionInfo }) {
  const { ENSName } = useENSName()
  return typeof uniAmountRaw === 'string' ? (
    <>
      Claim <FormattedCurrencyAmount rawAmount={uniAmountRaw} symbol={'UNI'} decimals={18} sigFigs={4} /> for{' '}
      {ENSName ?? recipient}
    </>
  ) : (
    <>
      Claim UNI reward for {ENSName ?? recipient}
    </>
  )
}

function SubmitProposalTransactionSummary(_: { info: SubmitProposalTransactionInfo }) {
  return <>Submit new proposal</>
}

function ApprovalSummary({ info }: { info: ApproveTransactionInfo }) {
  const token = useToken(info.tokenAddress)

  return <>Approve {token?.symbol}</>
}

function VoteSummary({ info }: { info: VoteTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  if (info.reason && info.reason.trim().length > 0) {
    switch (info.decision) {
      case VoteOption.For:
        return <>Vote for proposal {proposalKey}</>
      case VoteOption.Abstain:
        return <>Vote to abstain on proposal {proposalKey}</>
      case VoteOption.Against:
        return <>Vote against proposal {proposalKey}</>
    }
  } else {
    switch (info.decision) {
      case VoteOption.For:
        return (
          <>
            Vote for proposal {proposalKey} with reason &quot;{info.reason}&quot;
          </>
        )
      case VoteOption.Abstain:
        return (
          <>
            Vote to abstain on proposal {proposalKey} with reason &quot;{info.reason}&quot;
          </>
        )
      case VoteOption.Against:
        return (
          <>
            Vote against proposal {proposalKey} with reason &quot;{info.reason}&quot;
          </>
        )
    }
  }
}

function DelegateSummary({ info: { delegatee } }: { info: DelegateTransactionInfo }) {
  const { ENSName } = useENSName(delegatee)
  return <>Delegate voting power to {ENSName ?? delegatee}</>
}

function WrapSummary({ info: { chainId, currencyAmountRaw, unwrapped } }: { info: WrapTransactionInfo }) {
  const native = chainId ? nativeOnChain(chainId) : undefined

  if (unwrapped) {
    return (
      <>
        Unwrap{' '}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.wrapped?.symbol ?? 'WETH'}
          decimals={18}
          sigFigs={6}
        />{' '}
        to {native?.symbol ?? 'ETH'}
      </>
    )
  } else {
    return (
      <>
        Wrap{' '}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.symbol ?? 'ETH'}
          decimals={18}
          sigFigs={6}
        />{' '}
        to {native?.wrapped?.symbol ?? 'WETH'}
      </>
    )
  }
}

function DepositLiquidityStakingSummary(_: { info: DepositLiquidityStakingTransactionInfo }) {
  // not worth rendering the tokens since you can should no longer deposit liquidity in the staking contracts
  // todo: deprecate and delete the code paths that allow this, show user more information
  return <>Deposit liquidity</>
}

function WithdrawLiquidityStakingSummary(_: { info: WithdrawLiquidityStakingTransactionInfo }) {
  return <>Withdraw deposited liquidity</>
}

function MigrateLiquidityToV3Summary({
  info: { baseCurrencyId, quoteCurrencyId },
}: {
  info: MigrateV2LiquidityToV3TransactionInfo
}) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return (
    <>
      Migrate {baseCurrency?.symbol}/{quoteCurrency?.symbol} liquidity to V3
    </>
  )
}

function CreateV3PoolSummary({ info: { quoteCurrencyId, baseCurrencyId } }: { info: CreateV3PoolTransactionInfo }) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return (
    <>
      Create {baseCurrency?.symbol}/{quoteCurrency?.symbol} V3 pool
    </>
  )
}

function CollectFeesSummary({ info: { currencyId0, currencyId1 } }: { info: CollectFeesTransactionInfo }) {
  const currency0 = useCurrency(currencyId0)
  const currency1 = useCurrency(currencyId1)

  return (
    <>
      Collect {currency0?.symbol}/{currency1?.symbol} fees
    </>
  )
}

function RemoveLiquidityV3Summary({
  info: { baseCurrencyId, quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw },
}: {
  info: RemoveLiquidityV3TransactionInfo
}) {
  return (
    <>
      Remove{' '}
      <FormattedCurrencyAmountManaged rawAmount={expectedAmountBaseRaw} currencyId={baseCurrencyId} sigFigs={3} /> and{' '}
      <FormattedCurrencyAmountManaged rawAmount={expectedAmountQuoteRaw} currencyId={quoteCurrencyId} sigFigs={3} />
    </>
  )
}

function AddLiquidityV3PoolSummary({
  info: { createPool, quoteCurrencyId, baseCurrencyId },
}: {
  info: AddLiquidityV3PoolTransactionInfo
}) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return createPool ? (
    <>
      Create pool and add {baseCurrency?.symbol}/{quoteCurrency?.symbol} V3 liquidity
    </>
  ) : (
    <>
      Add {baseCurrency?.symbol}/{quoteCurrency?.symbol} V3 liquidity
    </>
  )
}

function AddLiquidityV2PoolSummary({
  info: { quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw, baseCurrencyId },
}: {
  info: AddLiquidityV2PoolTransactionInfo
}) {
  return (
    <>
      Add <FormattedCurrencyAmountManaged rawAmount={expectedAmountBaseRaw} currencyId={baseCurrencyId} sigFigs={3} />{' '}
      and <FormattedCurrencyAmountManaged rawAmount={expectedAmountQuoteRaw} currencyId={quoteCurrencyId} sigFigs={3} />{' '}
      to Uniswap V2
    </>
  )
}

function SwapSummary({ info }: { info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo }) {
  if (info.tradeType === TradeType.EXACT_INPUT) {
    return (
      <>
        Swap exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.inputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedOutputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </>
    )
  } else {
    return (
      <>
        Swap{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedInputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.outputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </>
    )
  }
}

export function TransactionSummary({ info }: { info: TransactionInfo }) {
  switch (info.type) {
    case TransactionType.ADD_LIQUIDITY_V3_POOL:
      return <AddLiquidityV3PoolSummary info={info} />

    case TransactionType.ADD_LIQUIDITY_V2_POOL:
      return <AddLiquidityV2PoolSummary info={info} />

    case TransactionType.CLAIM:
      return <ClaimSummary info={info} />

    case TransactionType.DEPOSIT_LIQUIDITY_STAKING:
      return <DepositLiquidityStakingSummary info={info} />

    case TransactionType.WITHDRAW_LIQUIDITY_STAKING:
      return <WithdrawLiquidityStakingSummary info={info} />

    case TransactionType.SWAP:
      return <SwapSummary info={info} />

    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} />

    case TransactionType.VOTE:
      return <VoteSummary info={info} />

    case TransactionType.DELEGATE:
      return <DelegateSummary info={info} />

    case TransactionType.WRAP:
      return <WrapSummary info={info} />

    case TransactionType.CREATE_V3_POOL:
      return <CreateV3PoolSummary info={info} />

    case TransactionType.MIGRATE_LIQUIDITY_V3:
      return <MigrateLiquidityToV3Summary info={info} />

    case TransactionType.COLLECT_FEES:
      return <CollectFeesSummary info={info} />

    case TransactionType.REMOVE_LIQUIDITY_V3:
      return <RemoveLiquidityV3Summary info={info} />

    case TransactionType.SUBMIT_PROPOSAL:
      return <SubmitProposalTransactionSummary info={info} />
  }
}
