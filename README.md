# Quick-Ether
A TypeScript wrapper for ethers.js with a focus on deploying simple blockchain interactions as quickly as possible.

<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#setup">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#documentation">Documentation</a></li>
  </ol>
</details>

## Setup

Follow these simple steps to get started with a local project.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/jack-white9/quick-ether.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
4. Import the contract class from `Contract.ts`
   ```js
   import { contract } from 'src/classes/Contract';
   ```
   
## Documentation

- `contract.connectWallet()`

Prompt the user to connect wallet and store their account within `this.account`.

<br />

- `contract.mintToken(mintState: <'WHITELIST_SALE | PUBLIC_SALE>, amount: number, price: number)`

Mint `amount` NFTs for `price*amount` Ethereum.

<br />

- `contract.getMintState()`

Fetch and return the mint state (`NOT_STARTED`, `WHITELIST_SALE`, `PUBLIC_SALE`).

<br />

- `contract.getPrice(mintState: <'WHITELIST_SALE | PUBLIC_SALE>)`

Fetch and return the NFT's price in Ethereum.

<br />

- `contract.getMaxMintAmount(mintState: <'WHITELIST_SALE | PUBLIC_SALE>')`

Fetch and return the maximum number of mints allowed per transaction  (**not wallet**) in the specified sale state.

<br />

- `contract.getIsAddressWhitelisted()`

Fetch and return whether the address is whitelisted (true or false).

<br />

- `contract.getIsWhitelistClaimed()`

Fetch and return whether the address has claimed their whitelist (true or false).

<br />

- `contract.getTotalSupplyCount()`

Fetch and return the total supply of NFTs available for minting.

<br />

- `contract.getRemainingSupplyCount()`

Fetch and return the amount of remaining NFTs yet to be minted.
