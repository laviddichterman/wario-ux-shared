import React, { useMemo } from 'react';
import { Table, TableBody, TableContainer, TableRow, TableCell, Paper } from '@mui/material';

import { ComputeServiceTimeDisplayString, CustomerInfoDto, FulfillmentConfig, FulfillmentDto, WDateUtils } from '@wcp/wcpshared';
import { format } from 'date-fns';

export interface ServiceInfoTableComponentProps {
  customerInfo: CustomerInfoDto;
  fulfillmentConfig: Pick<FulfillmentConfig, "minDuration" | 'displayName'>;
  fulfillment: Omit<FulfillmentDto, 'status'>;
  specialInstructions: string;
}

export default function ServiceInfoTableComponent(props: ServiceInfoTableComponentProps) {
  const { fulfillment, customerInfo, specialInstructions, fulfillmentConfig } = props;
  const serviceDateTime = useMemo(() => WDateUtils.ComputeServiceDateTime(fulfillment), [fulfillment]);
  return (
    <TableContainer component={Paper} sx={{ pb: 3 }} >
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>{customerInfo.givenName} {customerInfo.familyName}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mobile Number</TableCell>
            <TableCell>{customerInfo.mobileNum}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>E-Mail</TableCell>
            <TableCell>{customerInfo.email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell>{fulfillmentConfig.displayName} on {format(serviceDateTime, WDateUtils.ServiceDateDisplayFormat)} at {ComputeServiceTimeDisplayString(fulfillmentConfig.minDuration, fulfillment.selectedTime)}</TableCell>
          </TableRow>
          {fulfillment.dineInInfo &&
            <TableRow>
              <TableCell>Party Size</TableCell>
              <TableCell>{fulfillment.dineInInfo.partySize}</TableCell>
            </TableRow>
          }
          {fulfillment.deliveryInfo &&
            <TableRow>
              <TableCell>Delivery Address</TableCell>
              <TableCell>{fulfillment.deliveryInfo.address}{fulfillment.deliveryInfo.address2 && ` ${fulfillment.deliveryInfo.address2}`}{`, ${fulfillment.deliveryInfo.zipcode}`}</TableCell>
            </TableRow>
          }
          {specialInstructions &&
            <TableRow>
              <TableCell>Special Instructions</TableCell>
              <TableCell>{specialInstructions}</TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}