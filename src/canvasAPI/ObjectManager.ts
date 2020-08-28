import { autorun } from "mobx";
import CanvasAPI from "./CanvasAPI";
import { AddObjectToCanvasCommand } from "../command/addObject";
import { RemoveObjectFromCanvasCommand } from "../command/removeObject";
import imageStore from "../stores/imageStore";
import appStore, { ModeName } from "../stores/appStore";
import store from "../stores/objectManagerStore";

export interface IObjectManager {
  registerObject: (objName: ModeName) => void;
  selectObject: (obj: fabric.Object) => void;
  deselectObject: () => void;
  lockObjects: (exceptions?: string[]) => void;
  unlockObjects: (exceptions?: string[]) => void;
}

export default class ObjectManager implements IObjectManager {
  private readonly canvas: fabric.Canvas;
  private readonly selectableObjects: Set<ModeName> = new Set();
  private readonly listeners: any;

  constructor(private readonly canvasAPI: CanvasAPI) {
    this.canvas = canvasAPI.canvas;
    this.listeners = {
      onKeyDown: this.onKeyDown.bind(this),
      onMouseDown: this.onMouseDown.bind(this),
      onAdded: this.onAdded.bind(this),
      onDelete: this.onDelete.bind(this),
    };
    this.addEventListeners();
  }

  registerObject(objName: ModeName): void {
    if (objName) {
      this.selectableObjects.add(objName);
    }
  }

  selectObject(obj: fabric.Object): void {
    if (obj) {
      store.selectObject(obj);
      document.addEventListener("keydown", this.listeners.onKeyDown);
    }
  }

  deselectObject(): void {
    store.selectObject(null);
    document.removeEventListener("keydown", this.listeners.onKeyDown);
  }

  lockObjects(exceptions: string[] = []): void {
    this.canvas.forEachObject(obj => {
      if (!exceptions.includes(String(obj.name))) {
        obj.set({
          evented: false,
        });
      }
    });
  }

  unlockObjects(exceptions: string[] = []): void {
    this.canvas.forEachObject(obj => {
      if (!exceptions.includes(String(obj.name))) {
        obj.set({
          evented: true,
        });
      }
    });
  }

  private addEventListeners(): void {
    this.canvas.on("mouse:down", this.listeners.onMouseDown);
    this.canvas.on("object:added", this.listeners.onAdded);
    this.canvas.on("object:removed", this.listeners.onDelete);
  }

  private onMouseDown(event: fabric.IEvent): void {
    const {target} = event;
    const name = target?.name as ModeName;
    if (!name || !this.selectableObjects.has(name)) {
      if (store.selectedObject) {
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
    if (!this.selectableObjects.has(this.canvasAPI.mode) || !target) {
      return;
    }
    if (!appStore.isHistoryCommandExecuted) {
      this.customizeControls(target);
      this.saveAddCommandInHistory(target);
      store.notifyAddingObject(target);
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
    this.canvasAPI.history.push(
      new AddObjectToCanvasCommand(
        target,
        (object: fabric.Object) => this.canvas.add(object),
        (object: fabric.Object) => this.canvas.remove(object),
      ),
    );
  }

  private onDelete(): void {
    if (!appStore.isHistoryCommandExecuted) {
      store.notifyDeletingObject();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.keyCode === 46) {
      this.deleteSelectedObject();
    }
  }

  private deleteSelectedObject(): boolean {
    if (store.selectedObject) {
      this.saveRemoveCommandInHistory();
      this.canvas.remove(store.selectedObject);
      this.canvas.renderAll();
      this.deselectObject();
      return true;
    }
    return false;
  }

  private saveRemoveCommandInHistory(): void {
    if (!store.selectedObject) {
      return;
    }
    this.canvasAPI.history.push(
      new RemoveObjectFromCanvasCommand(
        store.selectedObject,
        (object: fabric.Object) => this.canvas.add(object),
        (object: fabric.Object) => this.canvas.remove(object),
      ),
    );
  }

  private removeObjects(): void {
    this.canvas.forEachObject(obj => {
      if (obj.name !== this.canvasAPI.image.IMAGE_OBJ_NAME) {
        this.canvas.remove(obj);
      }
    });
  }

  private clearCanvas = autorun(() => {
    let {clearCanvas} = imageStore;
    if (clearCanvas) {
      this.removeObjects();
      clearCanvas = false;
    }
  });


  private reactToObjectDeletion = autorun(() => {
    let {deleteObjectStatus} = store;

    if (deleteObjectStatus === "notify") {
      store.setObjectDeletionStatus("pending");
      if (this.deleteSelectedObject()) {
        store.setObjectDeletionStatus("success");
      } else {
        store.setObjectDeletionStatus("failed");
      }
    }
  });
}