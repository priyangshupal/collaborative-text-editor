import { TiListNode } from "../crdt/tilistNode.js";
import { TiList } from "../crdt/tilist.js";
import fs from "fs";
import readline from "readline";
import { getStorePath } from "./getStorePath.js";

/**
 * This function deserializes the serialized TiList
 * @param {string} serializedList the string to be deserialized into TiList
 */
export const deserializeTiList = (file, replicaId, setTiListHead) => {
  const makeNode = (line) => {
    if (line == "") {
      return null;
    }
    let [id, value, isTombstone, attributes] = line.split(",");
    isTombstone = isTombstone === "true"; // convert string to boolean
    return new TiListNode(id, value, null, isTombstone, JSON.parse(attributes));
  };

  // check if file exists, if it doesn't return empty TiList
  if (!fs.existsSync(getStorePath(replicaId))) {
    console.log(
      `file for the specified replicaId (${replicaId}) doesn't exist, creating file...`
    );
    setTiListHead(new TiList(null, replicaId));
    return;
  }

  let tiListHead = null,
    tiListCur = null;
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
  });

  rl.on("line", (line) => {
    if (tiListHead == null) {
      tiListCur = tiListHead = makeNode(line);
    } else {
      tiListCur.next = makeNode(line);
      tiListCur = tiListCur.next;
    }
  });

  rl.on("close", () => {
    console.log("finished deserializing file");
    setTiListHead(new TiList(tiListHead, replicaId));
  });
};
