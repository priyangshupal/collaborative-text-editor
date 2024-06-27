import { TiListNode } from "./tilistNode.js";
import { v4 as uuidv4 } from "uuid";

export class TiList {
  head = null; // starting point of the document
  replicaId = null;

  constructor(head = null, replicaId = uuidv4()) {
    this.head = head;
    this.replicaId = replicaId;
  }

  /**
   * Inserts a TiListNode in the TiList, this function will
   * be called by the frontend editor
   * @param {number} index index where the new character needs to be inserted
   * @param {char} character the new character to be inserted
   */
  insert(index, character, attributes = null) {
    const opnId = this.#generateOperationId();
    // store newline character as \\n so that during
    // serializing, this node's serialization doesn't
    // break into two lines and it is stored as '\n'
    if (character == "\n") character = "\\n";
    console.log(`inserting '${character}' at position ${index}`);
    if (this.head == null) {
      this.head = new TiListNode(opnId, character);
      console.log(`successfully inserted '${character}' in position ${index}`);
      return;
    }

    let nodeBeforeInsertionPoint = this.#findNode(index - 1);
    // move forward until the next node has lower
    // id than the new node
    while (
      nodeBeforeInsertionPoint &&
      nodeBeforeInsertionPoint.next &&
      nodeBeforeInsertionPoint.next.id > opnId
    ) {
      nodeBeforeInsertionPoint = nodeBeforeInsertionPoint.next;
    }

    // the actual `nodeBeforeInsertionPoint` was found,
    // now we can add the new node after this node
    const insertedNodeId = this.#insertNodeIntoList(
      nodeBeforeInsertionPoint,
      this.#generateOperationId(),
      character,
      attributes
    );
    console.log(`successfully inserted '${character}' in position ${index}`);
  }

  /**
   * Adds a tombstone node in the TiList.
   * This function will be called by the editor when a character
   * is deleted from text
   * @param {number} index position of the deleted character
   */
  delete(index) {
    const nodeToDelete = this.#findNode(index);
    // mark the node as tombstone to mark it deleted
    nodeToDelete.isTombstone = true;
    console.log(
      `successfully deleted '${nodeToDelete.value}' from position ${index}`
    );
  }

  /**
   * Reads the TiList (skipping the tombstones) and
   * returns the text sequence.
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
    let i = 0;
    while (i < index && node != null) {
      node = node.next;
      if (node && (node.isTombstone || node.attributes)) continue;
      i++;
    }
    while (node && (node.isTombstone || node.attributes)) {
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
  #insertNodeIntoList(nodeBeforeInsertionPoint, opId, character, attributes) {
    const tiListNode = new TiListNode(opId, character, null, false, attributes);

    if (nodeBeforeInsertionPoint == null) {
      // no previous node found => new node needs to be inserted at head
      console.log(`inserting '${character}' into head position`);
      tiListNode.next = this.head;
      this.head = tiListNode;
    } else {
      // tiListNode.prev = nodeBeforeInsertionPoint;
      tiListNode.next = nodeBeforeInsertionPoint.next;
      nodeBeforeInsertionPoint.next = tiListNode;
    }
    return tiListNode.id;
  }

  /**
   * `getContentsForEditor` converts the `TiList` into a
   * content format supported by the editor. This allows
   * the editor to render the data stored in the CRDT
   */
  getContentsForEditor() {
    let node = this.head,
      content = [],
      tempContent = "",
      activeAttribute = "";
    while (node) {
      if (node.isTombstone) {
        node = node.next;
        continue;
      }
      if (node.attributes) {
        if (activeAttribute != "") {
          let attributes = {};
          attributes[activeAttribute] = true;
          content.push({ insert: tempContent, attributes: attributes });
          activeAttribute = "";
        } else {
          activeAttribute = Object.keys(node.attributes)[0];
          content.push({ insert: tempContent });
        }
        tempContent = "";
      } else {
        // since newline character is stored as \\n, while
        // returning send it back as \n
        tempContent += node.value == "\\n" ? "\n" : node.value;
      }
      node = node.next;
    }
    content.push({ insert: tempContent });
    content.push({ insert: "\n" });
    return content;
  }

  /**
   * `toString` function serializes the data type
   * to store in a file
   */
  toString() {
    let node = this.head;
    let stringifiedList = "";
    while (node) {
      stringifiedList += node.toString() + "\n";
      node = node.next;
    }
    return stringifiedList;
  }

  #generateOperationId() {
    return Date.now() + "@" + this.replicaId;
  }
}
