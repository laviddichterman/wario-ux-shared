import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { FulfillmentConfig, ICatalog, ICategory, IOption, IOptionType, IProduct, IProductInstance, IProductInstanceFunction, IWSettings, OrderInstanceFunction } from "@wcp/wcpshared";

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
  serverTime: { time: string, tz: string } | null; // ISO formatted string
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
      state.serverTime = action.payload;
    },
    receiveCatalog(state, action: PayloadAction<ICatalog>) {
      state.catalog = action.payload;
      IOptionTypesAdapter.setAll(state.modifiers, Object.values(action.payload.modifiers).map(x => x.modifier_type));
      IOptionsAdapter.setAll(state.modifierOptions, ([] as IOption[]).concat(...Object.values(action.payload.modifiers).map(x => x.options)));
      IProductsAdapter.setAll(state.products, Object.values(action.payload.products).map(x => x.product));
      IProductInstancesAdapter.setAll(state.productInstances, ([] as IProductInstance[]).concat(...Object.values(action.payload.products).map(x => x.instances)));
      ICategoriesAdapter.setAll(state.categories, Object.values(action.payload.categories).map(x => x.category));
      ProductInstanceFunctionsAdapter.setAll(state.productInstanceFunctions, action.payload.product_instance_functions);
    },
    receiveFulfillments(state, action: PayloadAction<Record<string, FulfillmentConfig>>) {
      state.fulfillments = action.payload;
    },
    receiveSettings(state, action: PayloadAction<IWSettings>) {
      state.settings = action.payload;
    }
  }
});


export const SocketIoActions = SocketIoSlice.actions;

export const IsSocketDataLoaded = (s: SocketIoState) => s.serverTime !== null && s.fulfillments !== null && s.catalog !== null && s.settings !== null;

export default SocketIoSlice.reducer;
