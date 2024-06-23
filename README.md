# Local-first realtime collaborative rich-text editor

## Overview

A realtime collaborative rich-text editor using Conflict-free Replicated Data Types (CRDTs) and Google's WebRTC framework. With this editor, several users can edit documents together in realtime with automatic conflict-merge and user-intent preservation. The implementation of the CRDT is using a variant of the RGA (Replicated Growable Arrays) protocol. The RGA protocol is implemented as Timestamped Insertion List (TI List) and guarantees "Eventual Consistency".

For more details about the implementation, see the [documentation](./docs/README.md)

## Key features

- Real-time collaborative editing
- [Local-first](https://martin.kleppmann.com/papers/local-first.pdf) software implementation
- Automatic merge conflict resolution using [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type).
- User-intent preservation, drawing inspiration from [Peritext](https://www.inkandswitch.com/peritext/static/cscw-publication.pdf)
- Peer to peer architecture

## License

Usage is provided under the [MIT License](https://opensource.org/license/mit). See LICENSE for the full details.
