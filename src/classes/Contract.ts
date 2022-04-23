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

  //!! FIXME: abstract away templateMintWhitelist and templatePublicMint 
  public async mintToken(mintState: string, amount: number, price: number): Promise<void> {
    this._validateContract();
    const cost = price * amount;
    const bigNumPrice = ethers.utils.parseUnits(cost.toString(), "ether");
    
    if (mintState === 'WHITELIST_SALE') {
      const proof = this.whitelist.getMerkleProof(this.account);
      await this.contract.templateMintWhitelist(proof, {
        value: bigNumPrice,
      });
    } else if (mintState === 'PUBLIC_SALE') {
      await this.contract.templatePublicMint(amount, {
        value: bigNumPrice,
      });    
    }
  }

  public async getMintState(): Promise<string> {
    this._validateContract();
    const state = await this.contract.saleState();
    return state;
  }

  public async getPrice(mintState: string): Promise<string> {
    const price = await this._checkPrice(mintState);
    return ethers.utils.formatEther(price);
  }

  public async getMaxMintAmount(mintState: string): Promise<number> {
    this._validateContract();
    if (mintState === "WHITELIST_SALE") {
      const maximumMintAmount = await this.contract.WHITELIST_MMA();
      return maximumMintAmount.toNumber();
    } else if (mintState === "PUBLIC SALE") {
      const maximumMintAmount = await this.contract.MAX_BATCH_MINT();
      return maximumMintAmount.toNumber();
    }
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

  // ! Caution: returns bigNumber object
  private async _checkPrice(mintState: string): Promise<number> {
    this._validateContract();
    if (mintState === "WHITELIST_SALE") {
      const price = await this.contract.WHITELIST_PRICE();
      return price;
    } else if (mintState === "PUBLIC_SALE") {
      const price = await this.contract.SALE_PRICE();
      return price;
    }
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
