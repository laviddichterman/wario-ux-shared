import { Typography, Table, TableBody, TableContainer, TableRow, TableHead, TableCell, Paper } from '@mui/material';
import { ProductDisplay } from './WProductComponent';
import { CoreCartEntry, CreditPayment, ICatalogSelectors, IMoney, MoneyToDisplayString, WProduct } from '@wcp/wcpshared';
import { fPercent } from '../common/numbers';
import { ProductPrice, ProductTitle } from '../styled/styled';

export interface WCheckoutCartComponentProps {
  selectedService: string;
  catalogSelectors: ICatalogSelectors;
  cart: [string, CoreCartEntry<WProduct>[]][];
  taxRate: number;
  tipValue: IMoney;
  taxValue: IMoney;
  discountCreditsApplied: { amount: IMoney; code: string; }[];
  giftCreditsApplied: { amount: IMoney; code: string; }[];
  balanceAfterCredits?: IMoney;
  payments: CreditPayment[];
}

export function WCheckoutCartComponent(props: WCheckoutCartComponentProps) {
  return (<>
    <Typography variant="h4" sx={{ p: 2, textTransform: 'uppercase', fontFamily: 'Source Sans Pro', }}>Order summary</Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell colSpan={3}>Quantity x Price</TableCell>
            <TableCell>Subtotal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.cart.map((x, i) => x[1].map((cartEntry) => (
            <TableRow key={`${cartEntry.categoryId}${cartEntry.product.p.PRODUCT_CLASS.baseProductId}${i}`}>
              <TableCell>
                <ProductDisplay catalogSelectors={props.catalogSelectors} productMetadata={cartEntry.product.m} description displayContext="order" />
              </TableCell>
              <TableCell><ProductPrice>{cartEntry.quantity}</ProductPrice></TableCell>
              <TableCell><ProductPrice>×</ProductPrice></TableCell>
              <TableCell align="right"><ProductPrice>{MoneyToDisplayString(cartEntry.product.m.price, false)}</ProductPrice></TableCell>
              <TableCell align="right"><ProductPrice>{MoneyToDisplayString({ currency: cartEntry.product.m.price.currency, amount: Math.round(cartEntry.product.m.price.amount * cartEntry.quantity) }, false)}</ProductPrice></TableCell>
            </TableRow>
          ))).flat()}
          <TableRow />
          {/* {selectedService === DELIVERY_SERVICE && (
            <TableRow>
              <TableCell colSpan={2} >
                <ProductTitle>Delivery Fee{deliveryFee === 0 && " (waived)"}</ProductTitle>
              </TableCell>
              <TableCell />
              <TableCell colSpan={2} align="right">
                <ProductPrice>
                  {deliveryFee === 0 ?
                    <Typography sx={{ textDecoration: "line-through" }}>{fCurrencyNoUnit(5)}</Typography> :
                    <>{fCurrencyNoUnit(deliveryFee)}</>}
                </ProductPrice>
              </TableCell>
            </TableRow>
          )} */}
          {props.discountCreditsApplied.map(credit =>
            <TableRow key={credit.code}>
              <TableCell colSpan={3} >
                <ProductTitle>Discount Code Applied <Typography sx={{ textTransform: "none" }}>({credit.code})</Typography></ProductTitle>
              </TableCell>
              <TableCell colSpan={2} align="right"><ProductPrice>-{MoneyToDisplayString(credit.amount, false)}</ProductPrice></TableCell>
            </TableRow>)}
          {props.taxValue.amount > 0 &&
            <TableRow>
              <TableCell colSpan={3} >
                <ProductTitle>Sales Tax ({fPercent(props.taxRate)})</ProductTitle>
              </TableCell>
              <TableCell colSpan={2} align="right"><ProductPrice>{MoneyToDisplayString(props.taxValue, false)}</ProductPrice></TableCell>
            </TableRow>}
          {props.tipValue.amount > 0 &&
            <TableRow>
              <TableCell colSpan={3} >
                <ProductTitle>Gratuity*</ProductTitle>
                <div>Gratuity is distributed in its entirety to non-owner staff working on the day of your order.</div>
              </TableCell>
              <TableCell colSpan={2} align="right"><ProductPrice>{MoneyToDisplayString(props.tipValue, false)}</ProductPrice></TableCell>
            </TableRow>}
          {props.giftCreditsApplied.map(credit =>
            <TableRow key={credit.code}>
              <TableCell colSpan={3} >
                <ProductTitle>Digital Gift Applied <Typography sx={{ textTransform: "none" }}>({credit.code})</Typography></ProductTitle>
              </TableCell>
              <TableCell colSpan={2} align="right">
                <ProductPrice >-{MoneyToDisplayString(credit.amount, false)}</ProductPrice>
              </TableCell>
            </TableRow>)}
          {props.balanceAfterCredits && <TableRow>
            <TableCell colSpan={3} >
              <ProductTitle>Total</ProductTitle>
            </TableCell>
            <TableCell colSpan={2} align="right"><ProductPrice>{MoneyToDisplayString(props.balanceAfterCredits, false)}</ProductPrice></TableCell>
          </TableRow>}
          {props.payments.map(payment =>
            <TableRow key={payment.payment.processorId}>
              <TableCell colSpan={3} >
                <ProductTitle>Payment received {payment.payment.last4 ? ` from card ending in: ${payment.payment.last4}` : " from credit card."}</ProductTitle>
              </TableCell>
              <TableCell colSpan={2} align="right">
                <ProductPrice >-{MoneyToDisplayString(payment.amount, false)}</ProductPrice>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
  </>
  )
}