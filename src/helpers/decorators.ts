import imageStore from "../stores/imageStore";
import appStore from "../stores/appStore";
import { history } from "../command/commandHistory";

export function preventScaleReset (
  target: Object,
  methodName: string,
  descriptor: PropertyDescriptor,
): void {
  let method = descriptor.value;
  descriptor.value = async function(...args: any) {
    let returnValue: any;
    if (appStore.isToolbarOpen) {
      returnValue = await method.apply(this, args);
      imageStore.setScale(1);
    } else {
      imageStore.setScale(1);
      returnValue = await method.apply(this, args);
      imageStore.resetToBaseScale();
    }
    return returnValue;
  };
};

export function disableHistoryRecording (
  target: Object,
  methodName: string,
  descriptor: PropertyDescriptor,
): void {
  let method = descriptor.value;
  descriptor.value = async function(...args: any) {
    history.disableRecording();
    let returnValue = await method.apply(this, args);
    history.enableRecording();
    return returnValue;
  };
};