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
  let dataChannel = useRef();
  const rtcPeerConnection = useRef(new RTCPeerConnection(STUN_SERVERS));

  useEffect(() => {
    socket.on("user-connected", (userId) => {
      dataChannel.current =
        rtcPeerConnection.current.createDataChannel(DATA_CHANNEL);
      dataChannel.current.addEventListener("message", (e) => {
        console.log("received message through data channel:", e.data);
        localSave({ operationsList: JSON.parse(e.data), replicaId: replicaId });
      });
      rtcPeerConnection.current.createOffer().then((sdp) => {
        rtcPeerConnection.current.setLocalDescription(sdp);
        console.log("sending offer");
        socket.emit("offer", sdp);
      });
    });
    return () => socket.off("user-connected");
  }, []);

  useEffect(() => {
    rtcPeerConnection.current.addEventListener("datachannel", (event) => {
      console.log("received data channel");
      dataChannel.current = event.channel;
      dataChannel.current.addEventListener("message", (e) => {
        console.log("received message through data channel:", e.data);
        localSave({ operationsList: JSON.parse(e.data), replicaId: replicaId });
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
    const handler = (eventName, ...args) => {
      if (eventName === "text-change") {
        // on any text change in the editor, save that change locally
        // and then send it to the other collaborator
        localSave({
          operationsList: args[0].ops,
          replicaId: replicaId,
        });
        console.log(
          "sending data through data channel:",
          JSON.stringify(args[0].ops)
        );
        // sending to the collaborator (other peer)
        if (dataChannel.current != null)
          dataChannel.current.send(JSON.stringify(args[0].ops));
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
