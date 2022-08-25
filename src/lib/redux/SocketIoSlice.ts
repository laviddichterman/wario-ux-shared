import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { parseISO } from 'date-fns';
import type { FulfillmentConfig, ICatalog, ICategory, IMenu, IOption, IOptionType, IProduct, IProductInstance, IProductInstanceFunction, IWSettings, OrderInstanceFunction } from "@wcp/wcpshared";

export const TIMING_POLLING_INTERVAL = 30000;

export interface CurrentTimes {
  loadTime: number;
  currentLocalTime: number;
}

export const OrderInstanceFunctionsAdapter = createEntityAdapter<OrderInstanceFunction>({ selectId: entry => entry.id });
export const ProductInstanceFunctionsAdapter = createEntityAdapter<IProductInstanceFunction>({ selectId: entry => entry.id });
export const IProductsAdapter = createEntityAdapter<IProduct>({ selectId: entry => entry.id });
export const IProductInstancesAdapter = createEntityAdapter<IProductInstance>({ selectId: entry => entry.id });
export const IOptionTypesAdapter = createEntityAdapter<IOptionType>({ selectId: entry => entry.id });
export const IOptionsAdapter = createEntityAdapter<IOption>({ selectId: entry => entry.id });
export const ICategoriesAdapter = createEntityAdapter<ICategory>({ selectId: entry => entry.id });
export const { selectAll: getCategories, selectById: getCategoryById, selectIds: getCategoryIds } =
  ICategoriesAdapter.getSelectors();

export interface SocketIoState {
  pageLoadTime: number;
  pageLoadTimeLocal: number;
  roughTicksSinceLoad: number;
  currentTime: number;
  currentLocalTime: number;
  serverTime: { time: string, tz: string } | null; // ISO formatted string

  menu: IMenu | null;
  catalog: ICatalog | null;
  modifiers: EntityState<IOptionType>;
  modifierOptions: EntityState<IOption>;
  products: EntityState<IProduct>;
  productInstances: EntityState<IProductInstance>;
  categories: EntityState<ICategory>;
  productInstanceFunctions: EntityState<IProductInstanceFunction>;
  orderInstanceFunctions: EntityState<OrderInstanceFunction>;
  fulfillments: Record<string, FulfillmentConfig> | null;
  settings: IWSettings | null;
  status: 'NONE' | 'START' | 'CONNECTED' | 'FAILED';
}


const initialState: SocketIoState = {
  pageLoadTime: 0,
  pageLoadTimeLocal: 0,
  roughTicksSinceLoad: 0,
  currentTime: 0,
  currentLocalTime: 0,

  serverTime: null,
  catalog: null,
  fulfillments: null,
  modifiers: IOptionTypesAdapter.getInitialState(),
  modifierOptions: IOptionsAdapter.getInitialState(),
  products: IProductsAdapter.getInitialState(),
  productInstances: IProductInstancesAdapter.getInitialState(),
  categories: ICategoriesAdapter.getInitialState(),
  productInstanceFunctions: ProductInstanceFunctionsAdapter.getInitialState(),
  orderInstanceFunctions: OrderInstanceFunctionsAdapter.getInitialState(),
  settings: null,
  menu: null,
  status: "NONE"
}

const SocketIoSlice = createSlice({
  name: 'ws',
  initialState,
  reducers: {
    startConnection(state) {
      state.status = 'START';
    },
    setFailed(state) {
      state.status = 'FAILED';
    },
    setConnected(state) {
      state.status = 'CONNECTED';
    },
    receiveServerTime(state, action: PayloadAction<{ time: string, tz: string }>) {
      if (state.serverTime === null) {
        state.serverTime = action.payload;
        const pageLoadTime = parseISO(action.payload.time).valueOf();
        state.pageLoadTime = pageLoadTime;
        state.currentTime = pageLoadTime;
        const pageLoadTimeLocal = Date.now();
        state.pageLoadTimeLocal = pageLoadTimeLocal;
        state.currentLocalTime = pageLoadTimeLocal;
      }

    },
    receiveCatalog(state, action: PayloadAction<ICatalog>) {
      state.catalog = action.payload;
      IOptionTypesAdapter.setAll(state.modifiers, Object.values(action.payload.modifiers).map(x => x.modifierType));
      IOptionsAdapter.setAll(state.modifierOptions, Object.values(action.payload.options));
      IProductsAdapter.setAll(state.products, Object.values(action.payload.products).map(x => x.product));
      IProductInstancesAdapter.setAll(state.productInstances, Object.values(action.payload.productInstances));
      ICategoriesAdapter.setAll(state.categories, Object.values(action.payload.categories).map(x => x.category));
      ProductInstanceFunctionsAdapter.setAll(state.productInstanceFunctions, Object.values(action.payload.productInstanceFunctions));
      OrderInstanceFunctionsAdapter.setAll(state.orderInstanceFunctions, Object.values(action.payload.orderInstanceFunctions));
    },
    receiveFulfillments(state, action: PayloadAction<Record<string, FulfillmentConfig>>) {
      state.fulfillments = action.payload;
    },
    receiveSettings(state, action: PayloadAction<IWSettings>) {
      state.settings = action.payload;
    },
    // invoked by middleware
    setCurrentTime(state, action: PayloadAction<number>) {
      const currentLocalTime = action.payload;
      const ticks = Math.max(state.roughTicksSinceLoad + TIMING_POLLING_INTERVAL, currentLocalTime - state.pageLoadTimeLocal);
      state.currentLocalTime = Math.max(currentLocalTime, state.pageLoadTimeLocal + ticks);
      state.currentTime = parseISO(state.serverTime!.time).valueOf() + ticks;
      state.roughTicksSinceLoad = ticks;
    },
    setMenu(state, action: PayloadAction<IMenu>) {
      state.menu = action.payload;
    }
  }
});

export const { selectAll: getProductInstanceFunctions, selectById: getProductInstanceFunctionById } =
  ProductInstanceFunctionsAdapter.getSelectors();
export const SocketIoActions = SocketIoSlice.actions;
export const SocketIoReducer = SocketIoSlice.reducer;
export const IsSocketDataLoaded = (s: SocketIoState) => s.serverTime !== null && s.fulfillments !== null && s.catalog !== null && s.settings !== null;
