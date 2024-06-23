import { TiList } from "../src/crdt/tilist.js";

describe("Create operation", () => {
  test("creating a new head", () => {
    const tiList = new TiList();
    expect(tiList.read()).toEqual("");
  });
});

describe("Insert operations", () => {
  test("inserting an element at head", () => {
    const tiList = new TiList();
    tiList.insert(0, "c");
    expect(tiList.read()).toEqual("c");
  });

  test("inserting an element after head", () => {
    const tiList = new TiList();
    tiList.insert(0, "a");
    tiList.insert(1, "c");
    expect(tiList.read()).toEqual("ac");
  });

  test("inserting multiple elements after head", () => {
    const tiList = new TiList();
    tiList.insert(0, "w");
    tiList.insert(1, "q");
    tiList.insert(1, "b");
    expect(tiList.read()).toEqual("wbq");
  });
});

describe("Delete operations", () => {
  test("delete element at head", () => {
    const tiList = new TiList();
    tiList.insert(0, "q");
    tiList.insert(1, "b");
    tiList.delete(0);
    expect(tiList.read()).toEqual("b");
  });

  test("delete element after head", () => {
    const tiList = new TiList();
    tiList.insert(0, "w");
    tiList.insert(1, "q");
    tiList.insert(2, "b");
    tiList.delete(1);
    expect(tiList.read()).toEqual("wb");
  });
});

describe("Mixed operations", () => {
  test("add one element after one deletion", () => {
    const tiList = new TiList();
    tiList.insert(0, "q");
    tiList.insert(1, "b");
    tiList.delete(1);
    tiList.insert(1, "c");
    expect(tiList.read()).toEqual("qc");
  });

  test("add multiple elements after deletion", () => {
    const tiList = new TiList();
    tiList.insert(0, "q");
    tiList.insert(1, "b");
    tiList.insert(2, "c");
    tiList.delete(2);
    tiList.insert(2, "d");
    tiList.insert(3, "e");
    tiList.insert(4, "f");
    expect(tiList.read()).toEqual("qbdef");
  });

  test("add multiple elements after multiple deletions", () => {
    const tiList = new TiList();
    tiList.insert(0, "q"); // q
    tiList.insert(1, "b"); // qb
    tiList.insert(2, "c"); // qbc
    tiList.delete(2);      // qb
    tiList.insert(2, "d"); // qbd
    tiList.insert(3, "e"); // qbde
    tiList.delete(2);      // qbe
    tiList.delete(2);      // qb
    tiList.insert(2, "f"); // qbf
    tiList.insert(3, "g"); // qbfg
    tiList.insert(0, "h"); // hqbfg
    expect(tiList.read()).toEqual("hqbfg");
  });
});
