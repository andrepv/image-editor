import { observable, action } from "mobx";
import { IRootStore } from "./rootStore";

import { ModeName, CanvasStore } from "./canvasStore";
import { AddObjectToCanvasCommand } from "../command/addObject";
import { RemoveObjectFromCanvasCommand } from "../command/removeObject";

type NotificationType = "obj_removed" | "obj_added" | "";
type CanvasObject = fabric.Object | null;
type Notification = {type: NotificationType, data: any};

export class ObjectManagerStore {
  @observable selectedObject: CanvasObject = null;
  @observable notification: Notification = {type: "", data: null};
  private readonly canvas: CanvasStore;
  private readonly selectableObjects: Set<ModeName> = new Set();
  private readonly listeners: any;

  constructor(private readonly root: IRootStore) {
    this.canvas = root.canvasStore;
    this.listeners = {
      onKeyDown: this.onKeyDown.bind(this),
      onMouseDown: this.onMouseDown.bind(this),
      onAdded: this.onAdded.bind(this),
      onDelete: this.onDelete.bind(this),
    };
    this.addEventListeners();
  }

  deleteSelectedObject(): void {
    if (this.selectedObject) {
      this.saveRemoveCommandInHistory();
      this.canvas.instance.remove(this.selectedObject);
      this.canvas.instance.renderAll();
      this.deselectObject();
    }
  }

  @action private notifyDeletingObject(): void {
    this.notification = {type: "obj_removed", data: null};
  }

  @action private notifyAddingObject(obj: CanvasObject): void {
    this.notification = {type: "obj_added", data: obj};
  }

  registerObject(objName: ModeName): void {
    if (objName) {
      this.selectableObjects.add(objName);
    }
  }

  @action selectObject(obj: fabric.Object): void {
    if (obj) {
      this.selectedObject = obj;
      document.addEventListener("keydown", this.listeners.onKeyDown);
    }
  }

  @action deselectObject(): void {
    this.selectedObject = null;
    document.removeEventListener("keydown", this.listeners.onKeyDown);
  }

  lockObjects(exceptions: string[] = []): void {
    this.canvas.instance.forEachObject(obj => {
      if (!exceptions.includes(String(obj.name))) {
        obj.set({
          evented: false,
        });
      }
    });
  }

  unlockObjects(exceptions: string[] = []): void {
    this.canvas.instance.forEachObject(obj => {
      if (!exceptions.includes(String(obj.name))) {
        obj.set({
          evented: true,
        });
      }
    });
  }

  removeObjects(): void {
    this.canvas.instance.forEachObject(obj => {
      if (obj.name !== this.root.imageStore.OBJ_NAME) {
        this.canvas.instance.remove(obj);
      }
    });
  }

  private addEventListeners(): void {
    this.canvas.instance.on("mouse:down", this.listeners.onMouseDown);
    this.canvas.instance.on("object:added", this.listeners.onAdded);
    this.canvas.instance.on("object:removed", this.listeners.onDelete);
  }

  private onMouseDown(event: fabric.IEvent): void {
    const {target} = event;
    const name = target?.name as ModeName;
    if (!name || !this.selectableObjects.has(name)) {
      if (this.selectedObject) {
        this.deselectObject();
      }
      return;
    }
    if (target) {
      this.selectObject(target);
    }
  }

  private onAdded(event: fabric.IEvent): void {
    const {target} = event;
    if (!this.selectableObjects.has(this.canvas.mode) || !target) {
      return;
    }
    if (!this.root.canvasStore.history.isHistoryCommandExecuted) {
      this.customizeControls(target);
      this.saveAddCommandInHistory(target);
      this.notifyAddingObject(target);
    }
  }

  private customizeControls(obj: fabric.Object): void {
    obj.set({
      cornerStyle: "circle",
      cornerColor: "white",
      borderColor: "white",
      cornerStrokeColor: "white",
      transparentCorners: false,
    });
  }

  private saveAddCommandInHistory(target: fabric.Object): void {
    this.canvas.history.push(
      new AddObjectToCanvasCommand(
        target,
        (object: fabric.Object) => this.canvas.instance.add(object),
        (object: fabric.Object) => this.canvas.instance.remove(object),
      ),
    );
  }

  private onDelete(): void {
    if (!this.root.canvasStore.history.isHistoryCommandExecuted) {
      this.notifyDeletingObject();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.keyCode === 46) {
      this.deleteSelectedObject();
    }
  }

  private saveRemoveCommandInHistory(): void {
    if (!this.selectedObject) {
      return;
    }
    this.canvas.history.push(
      new RemoveObjectFromCanvasCommand(
        this.selectedObject,
        (object: fabric.Object) => this.canvas.instance.add(object),
        (object: fabric.Object) => this.canvas.instance.remove(object),
      ),
    );
  }
}