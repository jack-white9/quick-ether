import ethers from "ethers";
import { Whitelist } from "./Whitelist.js";

export class Contract {
  contractAddress: string;
  abi: string[];
  whitelist: any;
  contract: any;
  provider: any;
  account: any;
  signer: any;

  constructor(contractAddress, abi, whitelistAddresses) {
    this.contractAddress = contractAddress;
    this.abi = abi;
    this.whitelist = new Whitelist(whitelistAddresses);
    this.contract = null;
    this.provider = null;
    this.account = null;
    this.signer = null;
  }

  public async connectWallet(): Promise<void> {
    this._getProvider();
    this._validateProvider();
    let accounts = await this.provider.send("eth_accounts", []);
    if (accounts.length === 0) {
      accounts = await this.provider.send("eth_requestAccounts", []);
      return;
    }
    this.account = accounts[0];
    this._getSigner();
    this._setupContract();
    this._validateContract();
  }

  public async getMintState(): Promise<string> {
    this._validateContract();
    const state = await this.contract.saleState();
    return state;
  }

  public async getPublicMaxMintAmount(): Promise<number> {
    this._validateContract();
    const maximumMintAmount = await this.contract.MAX_BATCH_MINT();
    return maximumMintAmount.toNumber();
  }

  public async getPublicPrice(): Promise<string> {
    const price = await this._checkPublicPrice(); // BigNumber object
    return ethers.utils.formatEther(price);
  }

  public async getWhitelistMaxMintAmount(): Promise<number> {
    this._validateContract();
    const maximumMintAmount = await this.contract.WHITELIST_MMA();
    return maximumMintAmount.toNumber();
  }

  public async getWhitelistPrice(): Promise<string> {
    let price = await this._checkWhitelistPrice(); // BigNumber object
    return ethers.utils.formatEther(price);
  }

  public getIsAddressWhitelisted(): boolean {
    if (this.account === null) {
      return false;
    }
    return this.whitelist.isWhitelisted(this.account);
  }

  public async getIsWhitelistClaimed(): Promise<boolean> {
    this._validateContract();
    const claimed = await this.contract.checkWhitelistClaimed();
    return claimed;
  }

  //!! FIXME: "templatePublicMint"
  public async mintPublicSale(amount: number, price: number): Promise<void> {
    this._validateContract();
    const cost = price * amount;
    const bigNumPrice = ethers.utils.parseUnits(cost.toString(), "ether");
    await this.contract.templatePublicMint(amount, {
      value: bigNumPrice,
    });
  }

  //!! FIXME: "templateMintWhitelist"
  public async mintWhitelistSale(amount, price) {
    const proof = this.whitelist.getMerkleProof(this.account);
    const cost = price * amount;
    const bigNumPrice = ethers.utils.parseUnits(cost.toString(), "ether");
    await this.contract.templateMintWhitelist(proof, {
      value: bigNumPrice,
    });
  }

  public async getRemainingSupplyCount(): Promise<number> {
    this._validateContract();
    const total = await this.contract.getTotal();
    const remaining = await this.contract.totalSupply(); // what data type is this returning as?
    return total.toNumber() - remaining.toNumber(); // are these .toNumber() necessary?
  }

  public async getTotalSupplyCount(): Promise<number> {
    this._validateContract();
    const total = await this.contract.MAX_SUPPLY();
    return total;
  }

  private _setupContract(): void {
    this._getSigner();
    console.log(`Setting up contract, signer is ${this.signer}`);
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.abi,
      this.signer
    );
  }

  private async _getProvider(): Promise<void> {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(`Provider: ${this.provider}`);
  }

  private _getSigner(): any {
    this.signer = this.provider.getSigner();
    console.log(`Signer: ${this.signer}`);
  }

  private async _checkPublicPrice(): Promise<number> {
    this._validateContract();
    const price = await this.contract.SALE_PRICE();
    return price; //!! Warning: returns bigNumber
  }

  private async _checkWhitelistPrice(): Promise<number> {
    this._validateContract();
    const price = await this.contract.WHITELIST_PRICE();
    return price;
  }

  private _validateProvider(): void {
    if (this.provider === null) {
      console.error("The provider cannot by null when calling this function");
    }
  }

  private _validateContract(): void {
    if (this.contract === null) {
      console.error("The contract cannot by null when calling this function");
    }
  }

  private _validateAccount(): void {
    if (this.account === null) {
      console.error("The account cannot by null when calling this function");
    }
  }
}
