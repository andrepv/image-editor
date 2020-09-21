import rootStore from "../stores/rootStore";

export function preventScaleReset (
  target: Object,
  methodName: string,
  descriptor: PropertyDescriptor,
): void {
  let method = descriptor.value;
  descriptor.value = async function(...args: any) {
    let returnValue: any;
    if (rootStore.UIStore.isToolbarOpen) {
      returnValue = await method.apply(this, args);
      rootStore.canvasStore.setScale(1);
    } else {
      rootStore.canvasStore.setScale(1);
      returnValue = await method.apply(this, args);
      rootStore.canvasStore.resetToBaseScale();
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
    rootStore.canvasStore.history.disableRecording();
    let returnValue = await method.apply(this, args);
    rootStore.canvasStore.history.enableRecording();
    return returnValue;
  };
};