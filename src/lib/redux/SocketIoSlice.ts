import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { parseISO } from 'date-fns';
import type { CatalogCategoryEntry, CatalogModifierEntry, CatalogProductEntry, FulfillmentConfig, ICatalog, ICatalogSelectors, IMenu, IOption, IProductInstance, IProductInstanceFunction, IWSettings, OrderInstanceFunction } from "@wcp/wcpshared";

export const TIMING_POLLING_INTERVAL = 30000;

export interface CurrentTimes {
  loadTime: number;
  currentLocalTime: number;
}

export const ProductInstanceFunctionsAdapter = createEntityAdapter<IProductInstanceFunction>();
export const OrderInstanceFunctionsAdapter = createEntityAdapter<OrderInstanceFunction>();
export const IProductEntriesAdapter = createEntityAdapter<CatalogProductEntry, string>({ selectId: entry => entry.product.id });
export const IProductInstancesAdapter = createEntityAdapter<IProductInstance>();
export const ICategoryEntriesAdapter = createEntityAdapter<CatalogCategoryEntry, string>({ selectId: entry => entry.category.id });
export const ModifierTypeEntriesAdapter = createEntityAdapter<CatalogModifierEntry, string>({ selectId: entry => entry.modifierType.id });
export const ModifierOptionsAdapter = createEntityAdapter<IOption>();
export const FulfillmentsAdapter = createEntityAdapter<FulfillmentConfig>();

export const { selectAll: getProductInstanceFunctions, selectById: getProductInstanceFunctionById, selectIds: getProductInstanceFunctionIds } =
  ProductInstanceFunctionsAdapter.getSelectors();
export const { selectAll: getOrderInstanceFunctions, selectById: getOrderInstanceFunctionById, selectIds: getOrderInstanceFunctionIds } =
  OrderInstanceFunctionsAdapter.getSelectors();
export const { selectAll: getProductEntries, selectById: getProductEntryById, selectIds: getProductEntryIds } =
  IProductEntriesAdapter.getSelectors();
export const { selectAll: getProductInstances, selectById: getProductInstanceById, selectIds: getProductInstanceIds } =
  IProductInstancesAdapter.getSelectors();
export const { selectAll: getCategoryEntries, selectById: getCategoryEntryById, selectIds: getCategoryEntryIds } =
  ICategoryEntriesAdapter.getSelectors();
export const { selectAll: getModifierTypeEntries, selectById: getModifierTypeEntryById, selectIds: getModifierTypeEntryIds } =
  ModifierTypeEntriesAdapter.getSelectors();
export const { selectAll: getModifierOptions, selectById: getModifierOptionById, selectIds: getModifierOptionIds } =
  ModifierOptionsAdapter.getSelectors();
export const { selectAll: getFulfillments, selectById: getFulfillmentById, selectIds: getFulfillmentIds } =
  FulfillmentsAdapter.getSelectors();

export interface SocketIoState {
  pageLoadTime: number;
  pageLoadTimeLocal: number;
  roughTicksSinceLoad: number;
  currentTime: number;
  currentLocalTime: number;
  serverTime: { time: string, tz: string } | null; // ISO formatted string

  menu: IMenu | null;
  catalog: ICatalog | null;
  modifierEntries: EntityState<CatalogModifierEntry, string>;
  modifierOptions: EntityState<IOption, string>;
  products: EntityState<CatalogProductEntry, string>;
  productInstances: EntityState<IProductInstance, string>;
  categories: EntityState<CatalogCategoryEntry, string>;
  productInstanceFunctions: EntityState<IProductInstanceFunction, string>;
  orderInstanceFunctions: EntityState<OrderInstanceFunction, string>;
  fulfillments: EntityState<FulfillmentConfig, string>;
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
  fulfillments: FulfillmentsAdapter.getInitialState(),
  modifierEntries: ModifierTypeEntriesAdapter.getInitialState(),
  modifierOptions: ModifierOptionsAdapter.getInitialState(),
  products: IProductEntriesAdapter.getInitialState(),
  productInstances: IProductInstancesAdapter.getInitialState(),
  categories: ICategoryEntriesAdapter.getInitialState(),
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
      ModifierTypeEntriesAdapter.setAll(state.modifierEntries, action.payload.modifiers);
      ModifierOptionsAdapter.setAll(state.modifierOptions, action.payload.options);
      IProductEntriesAdapter.setAll(state.products, action.payload.products);
      IProductInstancesAdapter.setAll(state.productInstances, action.payload.productInstances);
      ICategoryEntriesAdapter.setAll(state.categories, action.payload.categories);
      ProductInstanceFunctionsAdapter.setAll(state.productInstanceFunctions, action.payload.productInstanceFunctions);
      OrderInstanceFunctionsAdapter.setAll(state.orderInstanceFunctions, action.payload.orderInstanceFunctions);
    },
    receiveFulfillments(state, action: PayloadAction<FulfillmentConfig[]>) {
      FulfillmentsAdapter.setAll(state.fulfillments, action.payload);
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

export const CatalogSelectors = (state: SocketIoState): ICatalogSelectors => ({
  categories: () => getCategoryEntryIds(state.categories) as string[],
  category: (id) => getCategoryEntryById(state.categories, id),
  modifierEntries: () => getModifierTypeEntryIds(state.modifierEntries) as string[],
  modifierEntry: (id) => getModifierTypeEntryById(state.modifierEntries, id),
  options: () => getModifierOptionIds(state.modifierOptions) as string[],
  option: (id) => getModifierOptionById(state.modifierOptions, id),
  productEntries: () => getProductEntryIds(state.products) as string[],
  productEntry: (id) => getProductEntryById(state.products, id),
  productInstances: () => getProductInstanceIds(state.productInstances) as string[],
  productInstance: (id) => getProductInstanceById(state.productInstances, id),
  orderInstanceFunctions: () => getOrderInstanceFunctionIds(state.orderInstanceFunctions) as string[],
  orderInstanceFunction: (id) => getOrderInstanceFunctionById(state.orderInstanceFunctions, id),
  productInstanceFunctions: () => getProductInstanceFunctionIds(state.productInstanceFunctions) as string[],
  productInstanceFunction: (id) => getProductInstanceFunctionById(state.productInstanceFunctions, id)
})

export const { receiveCatalog, receiveFulfillments, receiveServerTime, receiveSettings, setConnected, setCurrentTime, setFailed, setMenu, startConnection } = SocketIoSlice.actions;
export const SocketIoReducer = SocketIoSlice.reducer;
export const IsSocketDataLoaded = (s: SocketIoState) => s.serverTime !== null && s.fulfillments !== null && s.catalog !== null && s.settings !== null;
