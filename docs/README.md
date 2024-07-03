# Documentation

## The RGA Protocol

The used protocol is based on the specification from Attiya et al. [\[1\]](#ref1). The protocol uses replicas. Each replica contains the current state of its user's text editor. Changes from the user will be propagated via the server to all other replicas.

The necessary RGAs listed in [\[1\]](#ref1) are implemented as a _timestamped insertion (TI) list_. A node of the TI list can contains details about the current character and a pointer to the next node in the list. Each node of the TI list contains a unique id. The id is a string concatenation of _(x, '@', rpl<sub>id</sub>)_, where _x_ is a global logical clock and _rpl<sub>id</sub>_ a unique replica-id.

### Operations of the TI List

- **Read:** The list is traversed linearly. All visited elements are assembled into the sequence _s(N)_. Tombstones will be skipped.
- **Insert:** The new element _a_ will be inserted at the position _k_ in _s(N)_. The new node is a tuple _n = (id, value, next, attributes)_, where _id_ is the unique identifier, _value_ is the character stored by the node, _next_ is a pointer to the next node in the TI List, and _attributes_ store if the node marks the start or end of any rich-text formattings.
- **Delete:** The element which needs to be deleted is marked as _tombstone_ an remains in the list.

### The protocol

The protocol is based on specification from [\[1\]](#ref1), but some simplifications have been made. A replica is a state machine which is defined as *(N,A,L)*. *N* is the TI List, *A* the send-buffer and *L* the receive-buffer. The initial state of a replica is *(&empty;,&empty;,&empty;)*. The following state transitions are possible:

* **Insertion/Deletion:** Insertions and deletions of nodes corresponds
to the section [Operations of the Ti List](#operations-of-the-ti-list).
After a insertion or a deletion the node is added to the buffer *A*.
* **Send:** If *A &ne; &empty;* all messages of *A* will be sent to all other replicas.
* **Receive:** If *L &ne; &empty;* and *l &isin; L &and; l.p &isin; N* then *l* will be added to *N*. If the parent-node of *l* is not in *N* then *l* remains in the buffer. Tombstone-nodes are only added to *N*, if they already exist in *N*.

## Implementation of the RGA-Protocol

### Local-first implementation

The software follows a local-first implementation [\[2\]](#ref2), which means that changes in the state will be saved in the local storage first before propagating to the other clients. Every local change from a client will be propagated immediately to the server via `localSave`. For the mapping of the change to the correct client replica the store needs the `replicaId`.

### Propogating changes to other clients

The collaboration happens over a peer-to-peer network. WebRTC is used for establishing the peer-to-peer connection and the data transfer required for replicating the RGAs happens over the `RTCDataChannel` provided by the WebRTC framework. The transferred data consists of the operations performed on the local editor so that it can be replicated on the peers' devices.

### Implementation of the TI List

The TI List manages a linked list for the document. To find a node, a linear search is done by the search-algorithm. TI List's rich text representation and editing capabilites are based on PeriText [\[3\]](#ref3). It uses marker-nodes to mark the start and end of rich-text formattings.

The TI List has a `toString` algorithm implementation. The algorithm traverses the list nodes linearly and each node is serialized and written to the local store. Each node is serialized as _(id, value, isTombstone, attributes)_, where _id_ is the unique identifier, _value_ is the character stored by the node, _isTombstone_ identifies whether the node is a tombstone, and _attributes_ store if the node marks the start or end of any rich-text formattings.

## Using the Quill text editor

[Quill](https://quilljs.com/) is a free, open source WYSIWYG editor with rich-text capabilities. Quill arranges the characters in the text editor as a string. It works consistently and deterministically with JSON as both input and output. It provides listeners to listen for changes made by the user in the editor and APIs to modify the editor content programmatically.

## Future work

Currently, the RGA Protocol is implemented as a TI List which requires the search-algorithm to do a linear search of the list. It can be improved to be implemented as a TI Tree, which can manage a list of all the newline nodes. This will optimize the search-algorithm as then it will only have to go through one line of characters.

In [\[4\]](#ref4) Lv et al. proposed a improvement of the RGA-algorithm. The implemented algorithm we used was character-based. The new algorithm in [\[4\]](#ref4) is string-based. The idea of RGASS (RGA Supporting String) is to divide a into several sub-nodes if an change in the string happens. Because of the string-based approach the tree-search-algorithms have to visit less nodes than they would with the character-based approach. Especially for copy-paste operations with many characters the new approach is faster, because it only has to create one node with the complete string.

## References

<a name="ref1">\[1\]</a> Hagit Attiya et al. „Specification and Complexity of Collaborative Text Editing“. In: _Proceedings of the 2016 ACM Symposium on Principles of Distributed Computing_. PODC ’16. Chicago, Illinois, USA: Association for Computing Machinery, 2016, pages 259–268. [https://doi.org/10.1145/2933057.2933090](https://doi.org/10.1145/2933057.2933090)

<a name="ref2">\[2\]</a>
Kleppmann, M., et al, "Local-first software: you own your data, in spite of the cloud," in Proceedings of the 2019 ACM SIGPLAN International Symposium on New Ideas, New Paradigms, and Reflections on Programming and Software, 2019, pp. 154–178. [https://doi.org/10.1145/3359591.3359737](https://doi.org/10.1145/3359591.3359737)

<a name="ref3">\[3\]</a> Geoffrey Litt, Sarah Lim, Martin Kleppmann, and Peter van Hardenberg. 2022. Peritext: A CRDT for Collaborative Rich Text Editing. Proceedings of the ACM on Human-Computer Interaction (PACMHCI), Volume 6, Issue CSCW2, Article 531, November 2022. [https://doi.org/10.1145/3555644](https://doi.org/10.1145/3555644)

<a name="ref4">\[4\]</a> X. Lv et al. „An efficient collaborative editing algorithm supporting string-based operations“. In: 2016 IEEE 20th International Conference on Computer Supported Cooperative Work in Design (CSCWD). Nanchang, China: IEEE, Mai 2016, pages 45–50. [https://doi.org/10.1109/CSCWD.2016.7565961](https://doi.org/10.1109/CSCWD.2016.7565961)
