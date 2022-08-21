import { Divider, DialogTitle, Dialog, DialogProps } from '@mui/material';

export interface IDialogContainer {
  onClose: Exclude<DialogProps['onClose'], undefined>;
  title: string;
  innerComponent: React.ReactNode;
  open: boolean;
};

export const DialogContainer = function ({ onClose, title, open, innerComponent: inner_component, ...other }: IDialogContainer & Omit<DialogProps, 'onClose' | 'open'>) {
  return (
    <Dialog {...other} open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <Divider />
      {inner_component}
    </Dialog>
  );
}