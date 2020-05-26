import React, { useRef, ChangeEvent } from "react";

import { ReactComponent as Upload } from "../assets/upload.svg";
import Tooltip from "./Tooltip";
import useStore from "../helpers/useStore";

const UploadButton = () => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { canvasStore } = useStore();

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      canvasStore.setImageUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const clickHandler = () => {
    if (inputFileRef && inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  return (
    <>
      <Tooltip content="Upload an image" placement="bottom">
        <Upload onClick={clickHandler}/>
      </Tooltip>
      <input
        ref={inputFileRef}
        type="file"
        className="header__upload-image-input"
        onChange={uploadImage}
        accept="image/jpeg"
      />
    </>
  );
};

export default UploadButton;