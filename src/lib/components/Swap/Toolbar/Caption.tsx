import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import Column from 'lib/components/Column'
import Rule from 'lib/components/Rule'
import Tooltip from 'lib/components/Tooltip'
import { loadingCss } from 'lib/css/loading'
import { PriceImpact } from 'lib/hooks/useUSDCPriceImpact'
import { AlertTriangle, Icon, Info, InlineSpinner } from 'lib/icons'
import styled, { ThemedText } from 'lib/theme'
import { ReactNode, useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'

import Price from '../Price'
import RoutingDiagram from '../RoutingDiagram'

const Loading = styled.span`
  color: ${({ theme }) => theme.secondary};
  ${loadingCss};
`

interface CaptionProps {
  icon?: Icon
  caption: ReactNode
}

function Caption({ icon: Icon = AlertTriangle, caption }: CaptionProps) {
  return (
    <>
      <Icon color="secondary" />
      {caption}
    </>
  )
}

export function ConnectWallet() {
  return <Caption caption={"Connect wallet to swap"} />
}

export function UnsupportedNetwork() {
  return <Caption caption={"Unsupported network - switch to another to trade"} />
}

export function InsufficientBalance({ currency }: { currency: Currency }) {
  return <Caption caption={"Insufficient {currency?.symbol} balance"} />
}

export function InsufficientLiquidity() {
  return <Caption caption={"Insufficient liquidity in the pool for your trade"} />
}

export function Error() {
  return <Caption caption={"Error fetching trade"} />
}

export function Empty() {
  return <Caption icon={Info} caption={"Enter an amount"} />
}

export function LoadingTrade() {
  return (
    <Caption
      icon={InlineSpinner}
      caption={
        <Loading>
          Fetching best price…
        </Loading>
      }
    />
  )
}

export function WrapCurrency({ inputCurrency, outputCurrency }: { inputCurrency: Currency; outputCurrency: Currency }) {
  const Text = useCallback(
    () => (
      <>
        Convert {inputCurrency.symbol} to {outputCurrency.symbol} with no slippage
        </>
    ),
    [inputCurrency.symbol, outputCurrency.symbol]
  )

  return <Caption icon={Info} caption={<Text />} />
}

export function Trade({
  trade,
  outputUSDC,
  impact,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
}) {
  return (
    <>
      <Tooltip placement="bottom" icon={impact?.warning ? AlertTriangle : Info}>
        <Column gap={0.75}>
          {impact?.warning && (
            <>
              <ThemedText.Caption>
                The output amount is estimated at {impact.toString()} less than the input amount due to high price
                impact
              </ThemedText.Caption>
              <Rule />
            </>
          )}
          <RoutingDiagram trade={trade} />
        </Column>
      </Tooltip>
      <Price trade={trade} outputUSDC={outputUSDC} />
    </>
  )
}
