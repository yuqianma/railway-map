import { createContext, Context, useContext } from "react";
import { createRootStore, Store } from "./store";

export const rootStore = createRootStore();
export const StoreContext = createContext<Store | null>(null) as Context<Store>;

export function useStore() {
  const store = useContext(StoreContext); 
  return store;
}
