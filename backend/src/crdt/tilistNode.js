// TiListNode represents a node in the TiList
class TiListNode {
  constructor(value, id) {
    this.id = id;
    this.next = null;
    // this.prev = null;
    this.value = value;
    this.isTombstone = false;
    // this.children = [];
  }
  toString() {
    return `[${this.id},${this.next},${this.value},${this.isTombstone}]`;
  }
}

module.exports = { TiListNode };
