# block.chat
Ethereum backed messaging protocol with encryption and blockchain timestamping built-in.

As a fun little side-project and also as a way to document in a series of blog posts the state of the art in developing Dapps I'm going to be building BlockChat, a telegram-like messaging app using Public Key cryptography using the Eth blockchain as its backend.

The idea is for the protocol to be content agnostic (payloads will look like "pt: Hi" (for plaintext) or "ipfs:..." or even "https:..."), this way the content of the message can be very big without having to spend tons of gas in storage.

It is meant to be kind of a transport protocol for messages, also having encryption and timestamping built in.
