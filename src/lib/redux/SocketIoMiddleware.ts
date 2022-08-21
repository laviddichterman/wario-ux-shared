import { FulfillmentConfig, ICatalog, IWSettings } from '@wcp/wcpshared';
import { Middleware } from 'redux'
import { io, Socket } from "socket.io-client";
import { SocketIoActions } from './SocketIoSlice';

export const SocketIoMiddleware = <RootStateType>(hostAPI: string, namespace: string) => {
  const CurrySocketIoMiddleware: Middleware<{}, RootStateType> = store => {
    let socket: Socket;

    return next => action => {
      if (SocketIoActions.startConnection.match(action)) {
        socket = io(`${hostAPI}/${namespace}`, {
          autoConnect: true, secure: true,
          transports: ["websocket", "polling"],
          withCredentials: true
        });
        socket.on('connect', () => {
          store.dispatch(SocketIoActions.setConnected());
          socket.on('disconnect', () => {
            store.dispatch(SocketIoActions.setFailed());
          });
        });
        socket.on("WCP_FULFILLMENTS", (data: Record<string, FulfillmentConfig>) => {
          store.dispatch(SocketIoActions.receiveFulfillments(data));
        });
        socket.on("WCP_SERVER_TIME", (data: { time: string; tz: string; }) => {
          store.dispatch(SocketIoActions.receiveServerTime(data));
        });
        socket.on("WCP_SETTINGS", (data: IWSettings) => {
          store.dispatch(SocketIoActions.receiveSettings(data));
        });
        socket.on("WCP_CATALOG", (data: ICatalog) => {
          store.dispatch(SocketIoActions.receiveCatalog(data));
        });
      }
      next(action);
    }
  }
  return CurrySocketIoMiddleware;
}