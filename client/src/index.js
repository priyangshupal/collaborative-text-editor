// const tilist = require("./crdt/tilist").TiList;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];
const rangeElement = document.getElementById("range");
const quill = new Quill("#editor", {
  theme: "snow",
  modules: { toolbar: false },
});
quill.on("editor-change", (eventName, ...args) => {
  if (eventName === "text-change") {
    console.log("text-change", args[0], args[1]);
  } else if (eventName === "selection-change") {
    console.log("selection-change", args[0]);
    const range =
      args[0].index + (args[0].length > 0 && `-${args[0].length - 1}`);
    rangeElement.innerText = range;
  }
});

// const { v4: uuidv4 } = require("uuid");
// const TiListNode = require("./tilistNode").TiListNode;

// TiListNode represents a node in the TiList
class TiListNode {
  constructor(value, id) {
    this.id = id;
    this.next = null;
    this.prev = null;
    this.value = value;
    this.isTombstone = false;
    this.children = [];
  }
}

class TiList {
  head = null; // starting point of the document
  replicaId = "123"; //uuidv4();

  /**
   * Inserts a TiListNode in the TiList, this function will be called by the frontend editor
   * @param {number} index index where the new character needs to be inserted
   * @param {char} character the new character to be inserted
   */
  async insert(index, character) {
    console.log(`inserting '${character}' at position ${index}`);
    if (this.head == null) {
      this.head = new TiListNode(character, this.#generateOperationId());
      console.log(`successfully inserted '${character}' in position ${index}`);
      return;
    }
    const nodeBeforeInsertionPoint = this.#findNode(index - 1);

    // the node was found, now insert the node in the list
    const insertedNodeId = this.#insertNodeIntoList(
      nodeBeforeInsertionPoint,
      this.#generateOperationId(),
      character
    );
    console.log(`successfully inserted '${character}' in position ${index}`);
  }

  /**
   * Adds a tombstone node in the TiList.
   * This function will be called by the editor when a character
   * is deleted from text
   * @param {number} index position of the deleted character
   */
  async delete(index) {
    const nodeToDelete = this.#findNode(index);
    // mark the node as tombstone to mark it deleted
    nodeToDelete.isTombstone = true;
  }

  /**
   * Reads the TiList (skipping the tombstones) and
   * returns the sequence.
   */
  read() {
    let node = this.head;
    let result = "";
    while (node) {
      if (node.isTombstone) {
        node = node.next;
        continue;
      }
      result += node.value;
      node = node.next;
    }
    return result;
  }

  /**
   * Finds the node corresponding to a character position in the editor
   * @param {number} index position of the character in editor
   * @returns {TiListNode} node corresponding to the provided character position
   */
  #findNode(index) {
    if (index < 0) return null;
    let node = this.head;
    for (let i = 0; i < index && node != null; i++) {
      // skip tombstone since they don't contribute in
      // the character index calculation
      if (node.isTombstone) continue;
      node = node.next;
    }
    return node;
  }

  /**
   * Inserts a character node in TiList
   * @param {TiListNode} nodeBeforeInsertionPoint
   * @param {string} opId id of the newly created node
   * @param {char} character character to insert
   * @returns
   */
  #insertNodeIntoList(nodeBeforeInsertionPoint, opId, character) {
    const tiListNode = new TiListNode(character, opId);

    if (nodeBeforeInsertionPoint == null) {
      // no previuos node found => new node needs to be inserted at head
      console.log(`inserting '${character}' into head position`);
      tiListNode.next = this.head;
      this.head = tiListNode;
    } else {
      tiListNode.prev = nodeBeforeInsertionPoint;
      tiListNode.next = nodeBeforeInsertionPoint.next;
      nodeBeforeInsertionPoint.next = tiListNode;
    }
    return tiListNode.id;
  }

  #generateOperationId() {
    return Date.now() + "@" + this.replicaId;
  }
}

// module.exports = { TiList };
