import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

export class Whitelist {
  constructor(whitelistAddresses) {
    this.whitelistAddresses = whitelistAddresses;
    const leafNodes = this.whitelistAddresses.map((addr) => keccak256(addr));
    this.merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  }

  getMerkleProof(address) {
    const proof = this.merkleTree.getHexProof(keccak256(address));
    console.log(`Proof: ${proof}`);
    return proof;
  }

  isWhitelisted(address) {
    const lower = this.whitelistAddresses.map((addr) => addr.toLowerCase());
    return lower.includes(address.toLowerCase());
  }

  getRoot() {
    return this.merkleTree.getRoot().toString("hex");
  }
}
