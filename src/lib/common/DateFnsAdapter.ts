import { default as AdapterDateFns } from '@date-io/date-fns';
import { toDate as toDateBase } from 'date-fns';

export const AdapterCurrentTimeOverrideUtils = (now: Date | number) =>
  class AdapterDateFnsWrapper extends AdapterDateFns {
    public date = (value?: any) => {
      if (typeof value === "undefined" || value === null) {
        return toDateBase(now);
      }
      return new Date(value);
    };

  }