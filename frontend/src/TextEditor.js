import { useCallback, useEffect, useState } from "react";
import { localSave, updateSelection } from "./utils";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export const TextEditor = () => {
  const [quill, setQuill] = useState();

  useEffect(() => {
    if (quill == null) return;
    const handler = (eventName, ...args) => {
      if (eventName === "text-change") {
        localSave(args[0].ops);
      }
    };
    quill.on("editor-change", handler);

    return () => quill.off("editor-change", handler);
  }, [quill]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    setQuill(
      new Quill(editor, {
        theme: "snow",
      })
    );
  }, []);

  return <div className='container' ref={wrapperRef}></div>;
};
