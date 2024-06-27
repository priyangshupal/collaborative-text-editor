import { useCallback, useEffect, useRef, useState } from "react";
import { localSave } from "./utils";
import { v4 as uuidv4 } from "uuid";
import {
  DATA_CHANNEL,
  SIGNALING_SERVER_ADDRESS,
  STUN_SERVERS,
} from "./constants";
import Quill from "quill";
import io from "socket.io-client";
import "quill/dist/quill.snow.css";

const socket = io(SIGNALING_SERVER_ADDRESS);
const replicaId = uuidv4();

export const TextEditor = () => {
  const [quill, setQuill] = useState();
  const [localContent, setLocalContent] = useState();
  let dataChannel = useRef();
  const rtcPeerConnection = useRef(new RTCPeerConnection(STUN_SERVERS));

  useEffect(() => {
    if (quill == null) return;
    console.log("syncing local data:", localContent);
    quill.setContents(localContent);
  }, [localContent]);

  // useEffect(() => {
  //   socket.on("user-connected", (userId) => {
  //     dataChannel.current =
  //       rtcPeerConnection.current.createDataChannel(DATA_CHANNEL);
  //     dataChannel.current.addEventListener("message", async (e) => {
  //       console.log("received message through data channel:", e.data);
  //       const localData = await localSave({
  //         operationsList: JSON.parse(e.data),
  //         replicaId: replicaId,
  //       });
  //       if (localData) {
  //         setLocalContent(localData["curContent"]);
  //       }
  //     });
  //     rtcPeerConnection.current.createOffer().then((sdp) => {
  //       rtcPeerConnection.current.setLocalDescription(sdp);
  //       console.log("sending offer");
  //       socket.emit("offer", sdp);
  //     });
  //   });
  //   return () => socket.off("user-connected");
  // }, []);

  useEffect(() => {
    rtcPeerConnection.current.addEventListener("datachannel", (event) => {
      console.log("received data channel");
      dataChannel.current = event.channel;
      dataChannel.current.addEventListener("message", async (e) => {
        console.log("received message through data channel:", e.data);
        const localData = await localSave({
          operationsList: JSON.parse(e.data),
          replicaId: replicaId,
        });
        if (localData) {
          setLocalContent(localData["curContent"]);
        }
      });
    });
    return () => {
      rtcPeerConnection.current.removeEventListener("datachannel");
      dataChannel.current.removeEventListener("message");
    };
  }, []);

  useEffect(() => {
    socket.on("offer", (offerSDP) => {
      console.log("received offer");
      rtcPeerConnection.current
        .setRemoteDescription(new RTCSessionDescription(offerSDP))
        .then(() => {
          rtcPeerConnection.current.createAnswer().then((sdp) => {
            rtcPeerConnection.current.setLocalDescription(sdp);
            console.log("sending answer");
            socket.emit("answer", sdp);
          });
        });
    });
    return () => socket.off("offer");
  }, []);

  useEffect(() => {
    socket.on("answer", (answerSDP) => {
      console.log("received answer");
      rtcPeerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answerSDP)
      );
    });
    return () => socket.off("answer");
  }, []);

  useEffect(() => {
    socket.on("icecandidate", (icecandidate) => {
      rtcPeerConnection.current.addIceCandidate(
        new RTCIceCandidate(icecandidate)
      );
    });
    return () => socket.off("icecandidate");
  }, []);

  useEffect(() => {
    rtcPeerConnection.current.addEventListener("icecandidate", (e) => {
      if (e.candidate) socket.emit("icecandidate", e.candidate);
    });
    return () => rtcPeerConnection.current.removeEventListener("icecandidate");
  }, []);

  useEffect(() => {
    if (quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source == "user") {
        // on any text change in the editor, save that change locally
        // and then send it to the other collaborator
        console.log("user triggered this change", JSON.stringify(delta.ops));
        localSave({
          operationsList: delta.ops,
          replicaId: replicaId,
        });
        // sending to the collaborator (other peer)
        if (dataChannel.current != null) {
          console.log(
            "sending data through data channel:",
            JSON.stringify(delta.ops)
          );
          dataChannel.current.send(JSON.stringify(delta.ops));
        }
      }
    };
    quill.on("text-change", handler);

    return () => quill.off("text-change", handler);
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
