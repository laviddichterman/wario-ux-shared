import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { toDate as toDateBase } from 'date-fns';

type DateBuilderReturnType<T extends string | null | undefined, TDate> = T extends null
  ? null
  : TDate;

export const AdapterCurrentTimeOverrideUtils = (now: Date | number) =>
  class AdapterDateFnsWrapper extends AdapterDateFns {
    public date = <T extends string | null | undefined>(
      value?: T,
    ): DateBuilderReturnType<T, Date> => {
      type R = DateBuilderReturnType<T, Date>;
      if (typeof value === 'undefined') {
        return <R>toDateBase(now);
      }

      if (value === null) {
        return <R>null;
      }

      return <R>new Date(value);
    };

    // date<
    //   TArg extends unknown = undefined,
    //   TRes extends unknown = TArg extends null
    //   ? null
    //   : TArg extends undefined
    //   ? Date
    //   : Date | null
    // >(value?: TArg): TRes {
    //   if (typeof value === "undefined") {
    //     return toDateBase(now) as TRes;
    //   }

    //   if (value === null) {
    //     return null as TRes;
    //   }

    //   return toDateBase(value as string | number | Date) as TRes;
    // }
  };