import { Dialog, DialogTitle, Divider, type DialogProps } from '@mui/material';

export interface IDialogContainer {
  onClose: Exclude<DialogProps['onClose'], undefined>;
  title?: React.ReactNode;
  innerComponent: React.ReactNode;
  open: boolean;
};

export const DialogContainer = function ({ onClose, title, open, innerComponent: inner_component, ...other }: IDialogContainer & Omit<DialogProps, 'onClose' | 'open'>) {
  return (
    <Dialog {...other} open={open} onClose={onClose}>
      {title && <><DialogTitle>{title}</DialogTitle>
        <Divider /></>}
      {inner_component}
    </Dialog>
  );
}