# Local-first realtime collaborative rich-text editor

![text editor demo](https://raw.githubusercontent.com/priyangshupal/documentation-images/main/collaborative-text-editor/collaborative-text-editor-demo.gif)

A realtime collaborative rich-text editor using Conflict-free Replicated Data Types (CRDTs) and Google's WebRTC framework. With this editor, several users can edit documents together in realtime with automatic conflict-merge and user-intent preservation. The implementation of the CRDT is using a variant of the RGA (Replicated Growable Arrays) protocol. The RGA protocol is implemented as Timestamped Insertion List (TI List) and guarantees "Eventual Consistency".

For more details about the CRDT implementation, see the [documentation](./docs/README.md)

## Key features

- Real-time collaborative editing.
- [Local-first](https://martin.kleppmann.com/papers/local-first.pdf) software implementation.
- Automatic merge conflict resolution using [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type).
- User-intent preservation, drawing inspiration from [Peritext](https://www.inkandswitch.com/peritext/static/cscw-publication.pdf).
- Peer to peer architecture using WebRTC.

## Architecture

![architecture diagram](https://raw.githubusercontent.com/priyangshupal/documentation-images/main/collaborative-text-editor/architecture.svg)

## Getting started

### Prerequisites

It is recommended to have `node` and `npm` installed. This project was built using node version `20.11.1` and npm version `10.5.1`.

### Installing dependencies

Install the backend and frontend dependencies by running `npm install` inside the `backend` and `frontend` folders respectively.

### Running test cases

Run the following command to check the code against all the available test cases

```
npm run --prefix backend test
```

## Usage

The project can be run in three steps by running the below commands in the root directory:

- Run the backend file store server. This server interacts with the local store/filesystem for storing the CRDT. It also supports retrieval from the store.

```
npm run --prefix backend fileserver
```

- In a separate terminal, run the signaling server for WebRTC

```
npm run --prefix backend sigserver
```

- In a separate terminal, start the frontend app

```
npm run --prefix frontend start
```

Now, open two browser tabs to the address [localhost:3000](http://localhost:3000/). These editors are now connected via a peer-to-peer network through WebRTC and can exchange local editor operations using WebRTC's data channel.

## License

Usage is provided under the [MIT License](https://opensource.org/license/mit). See [LICENSE](./LICENSE) for the full details.
