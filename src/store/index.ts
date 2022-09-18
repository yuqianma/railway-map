import { computed } from "mobx";
import {
  prop,
  model,
  Model,
  modelAction,
  registerRootStore,
} from "mobx-keystone";

@model("railwayMap/RootStore")
export class Store extends Model({
  timeRange: prop<number[]>().withSetter(),
}) {
  
}

export function createRootStore(): Store {
	const rootStore = new Store({
		timeRange: [
			+new Date('2022-07-31T05:00:00.000+08:00'),
			+new Date('2022-07-31T23:59:00.000+08:00'),
		],
	});
	registerRootStore(rootStore);
	(window as any).rootStore = rootStore;
	return rootStore;
}
