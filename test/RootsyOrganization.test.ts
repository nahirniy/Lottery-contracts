import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RootsyOrganization } from "../typechain-types/contracts/RootsyOrganization";
import { ethers } from "hardhat";
import { assert, expect, use } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RootsyPassport } from "../typechain-types";

describe("RootsyOrganization", async () => {
  let passport: RootsyPassport;
  let organization: RootsyOrganization;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  async function deployPassportAndOrganization() {
    const [owner, minter, user1, user2] = await ethers.getSigners();
    const passport = await (await ethers.getContractFactory("RootsyPassport")).deploy(owner.address, minter.address, "Test Passport");
    const organization = await (await ethers.getContractFactory("RootsyOrganization")).deploy(owner.address, minter.address, passport.address, "Test Organization");
    await passport.connect(minter).mintTo(user1.address, []);
    await passport.connect(minter).mintTo(user2.address, []);

    return { passport, organization, owner, minter, user1, user2 };
  }

  beforeEach("Init test environment", async () => {
    const fixture = await loadFixture(deployPassportAndOrganization);
    passport = fixture.passport;
    organization = fixture.organization;
    owner = fixture.owner;
    minter = fixture.minter;
    user1 = fixture.user1;
    user2 = fixture.user2;
  });

  describe("Deployment", function () {
    it("Should be correctly initialized", async function () {
      expect(await organization.hasRole(ethers.constants.HashZero, owner.address)).to.equal(true);
      const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
      expect(await organization.hasRole(minterRole, minter.address)).to.equal(true);
      expect(await organization.name()).to.equal("Test Organization");
    });

    it("Should allows minter to mint a new token", async function () {
      await expect(organization.connect(minter).mintToPassport(1, [])).to.emit(organization, "Transfer").withArgs(ethers.constants.AddressZero, passport.address, 1);

      const tokenId = await organization.ownerToken(1);
      expect(tokenId).to.be.eq(1);
      expect(await organization.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("Should prevents minting to the passport who already has a token", async function () {
      await organization.connect(minter).mintToPassport(1, []);
      await expect(organization.connect(minter).mintToPassport(1, [])).to.be.revertedWith("IncorrectCondition");
    });

    it("Should prevents non-minter from minting tokens", async function () {
      const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
      await expect(organization.connect(user2).mintToPassport(user1.address, [])).to.be.revertedWith(
        "AccessControl: account " + user2.address.toLowerCase() + " is missing role " + minterRole
      );
    });

    it("Should not allow to deploy with wrong passport", async function () {
      const [owner, minter] = await ethers.getSigners();

      await expect((await ethers.getContractFactory("RootsyOrganization")).deploy(owner.address, minter.address, organization.address, "Test Organization"))
          .to.be.revertedWith("InterfaceNotSupported");
    });

    it("Should revokes minter role and prevents token minting", async function () {
      const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
      await organization.revokeRole(minterRole, minter.address);
      await expect(organization.connect(minter).mintToPassport(1, [])).to.be.revertedWith(
        "AccessControl: account " + minter.address.toLowerCase() + " is missing role " + minterRole
      );
    });
  });

  it("Should prevent accept child if it does not have campaign interface", async function () {
    const ERC7401Mock = await (await ethers.getContractFactory("ERC7401Mock")).deploy(owner.address, minter.address, "Test ERC7401");
    await organization.connect(minter).mintToPassport(1, []);
    await ERC7401Mock.connect(minter).mintTo(1, organization.address);

    await expect(organization.connect(minter).acceptChild(1, 0, ERC7401Mock.address, 1)).to.be.revertedWith("Only campaign can be child of organization");
    expect((await organization.childrenOf(1)).length).to.eq(0);
  });

  describe("RootsyErc7401Base", function () {
    it("Should checks if an address is approved or owner", async function () {
      await organization.connect(minter).mintToPassport(1, []);

      expect(await organization.isApprovedOrOwner(user1.address, 1)).to.equal(true);
      expect(await organization.isApprovedOrOwner(user2.address, 1)).to.equal(false);
    });

    it("Should report total supply", async function () {
      await organization.connect(minter).mintToPassport(1, []);
      await organization.connect(minter).mintToPassport(2, []);

      expect(await organization.totalSupply()).to.equal(2);
    });

    it("Should support AccessControl interface", async function () {
      let functionSignature = [
        "hasRole(bytes32,address)",
        "getRoleAdmin(bytes32)",
        "grantRole(bytes32,address)",
        "revokeRole(bytes32,address)",
        "renounceRole(bytes32,address)",
      ];
      let interfaceID = BigInt(0);

      for (const signature of functionSignature) {
        const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
        interfaceID ^= BigInt("0x" + selector);
      }

      const interfaceIDHex = "0x" + interfaceID.toString(16).padStart(8, "0");
      expect(await organization.supportsInterface(interfaceIDHex)).to.equal(true);
    });

    it("Should support RMRKNestable interface", async function () {
      const functionSignatures = [
        "ownerOf(uint256)",
        "directOwnerOf(uint256)",
        "burn(uint256,uint256)",
        "addChild(uint256,uint256,bytes)",
        "acceptChild(uint256,uint256,address,uint256)",
        "rejectAllChildren(uint256,uint256)",
        "transferChild(uint256,address,uint256,uint256,address,uint256,bool,bytes)",
        "childrenOf(uint256)",
        "pendingChildrenOf(uint256)",
        "childOf(uint256,uint256)",
        "pendingChildOf(uint256,uint256)",
        "nestTransferFrom(address,address,uint256,uint256,bytes)",
      ];
      let interfaceID = BigInt(0);

      for (const signature of functionSignatures) {
        const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
        interfaceID ^= BigInt("0x" + selector);
      }

      const interfaceIDHex = "0x" + interfaceID.toString(16).padStart(8, "0");
      expect(await organization.supportsInterface(interfaceIDHex)).to.equal(true);
    });

    it("Should not support a random interface", async function () {
      //IERC1363
      let interfaceID = BigInt(0);
      const functionSignatures = [
        "transferAndCall(address,uint256)",
        "transferAndCall(address,uint256,bytes)",
        "transferFromAndCall(address,address,uint256)",
        "transferFromAndCall(address,address,uint256,bytes)",
        "approveAndCall(address,uint256)",
        "approveAndCall(address,uint256,bytes)",
      ];

      for (const signature of functionSignatures) {
        const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
        interfaceID ^= BigInt("0x" + selector);
      }

      const interfaceIDHex = "0x" + interfaceID.toString(16).padStart(8, "0");
      expect(await organization.supportsInterface(interfaceIDHex)).to.equal(false);
    });
  });
});
