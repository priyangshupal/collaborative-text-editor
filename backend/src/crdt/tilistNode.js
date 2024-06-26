// TiListNode represents a node in the TiList
export class TiListNode {
  constructor(id, value, next = null, isTombstone = false, attributes = null) {
    this.id = id;
    this.next = next;
    // this.prev = null;
    this.value = value;
    this.isTombstone = isTombstone;
    this.attributes = attributes;
  }
  toString() {
    return `${this.id},${this.value},${this.isTombstone},${JSON.stringify(this.attributes)}`;
  }
}
