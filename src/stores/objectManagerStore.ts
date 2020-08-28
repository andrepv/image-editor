import { observable, action } from "mobx";

export type CommandStatus = "notify" | "pending" | "success" | "failed";

type NotificationType = "obj_removed" | "obj_added" | "";
type CanvasObject = fabric.Object | null;
type Notification = {type: NotificationType, data: any};

export class ObjectManagerStore {
  @observable selectedObject: CanvasObject = null;
  @observable deleteObjectStatus: CommandStatus = "success";
  @observable notification: Notification = {type: "", data: null};

  @action selectObject(obj: CanvasObject): void {
    this.selectedObject = obj;
    this.resetNotification();
  }

  @action setObjectDeletionStatus(status: CommandStatus): void {
    this.deleteObjectStatus = status;
  }

  @action notifyDeletingObject(): void {
    this.notification = {type: "obj_removed", data: null};
  }

  @action notifyAddingObject(obj: CanvasObject): void {
    this.notification = {type: "obj_added", data: obj};
  }

  @action resetNotification(): void {
    this.notification = {type: "", data: null};
  }

  deleteSelectedObject(): void {
    this.setObjectDeletionStatus("notify");
  }
}

export default new ObjectManagerStore();