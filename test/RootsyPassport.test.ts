import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RootsyOrganization } from "../typechain-types/contracts/RootsyOrganization";
import { ethers } from "hardhat";
import { assert, expect, use } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RootsyPassport } from "../typechain-types";

describe("RootsyPassport", async () => {
  let passport: RootsyPassport;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  async function deployPassport() {
    const [owner, minter, user1, user2] = await ethers.getSigners();
    const passport = await (await ethers.getContractFactory("RootsyPassport")).deploy(owner.address, minter.address, "Test Passport");

    return { passport, owner, minter, user1, user2 };
  }

  beforeEach("Init test environment", async () => {
    const fixture = await loadFixture(deployPassport);
    passport = fixture.passport;
    owner = fixture.owner;
    minter = fixture.minter;
    user1 = fixture.user1;
    user2 = fixture.user2;
  });

    it("Should be correctly initialized", async function () {
        expect(await passport.hasRole(ethers.constants.HashZero, owner.address)).to.equal(true);
        const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
        expect(await passport.hasRole(minterRole, minter.address)).to.equal(true);
        expect(await passport.name()).to.equal("Test Passport");
    });

    it("Should allows minter to mint a new token", async function () {
        await expect(passport.connect(minter).mintTo(user1.address, [])).to.emit(passport, "Transfer").withArgs(ethers.constants.AddressZero, user1.address, 1);

        const tokenId = await passport.ownerToken(user1.address);
        expect(tokenId).to.be.eq(1);
        expect(await passport.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("Should prevents minting to the owner who already has a token", async function () {
        await passport.connect(minter).mintTo(user1.address, []);
        await expect(passport.connect(minter).mintTo(user1.address, [])).to.be.revertedWith("Owner already has passport token");
    });

    it("Should prevents non-minter from minting tokens", async function () {
        const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
        await expect(passport.connect(user2).mintTo(user1.address, [])).to.be.revertedWith(
            "AccessControl: account " + user2.address.toLowerCase() + " is missing role " + minterRole
        );
    });

    it("Should revokes minter role and prevents token minting", async function () {
        const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
        await passport.revokeRole(minterRole, minter.address);
        await expect(passport.connect(minter).mintTo(user1.address, [])).to.be.revertedWith(
            "AccessControl: account " + minter.address.toLowerCase() + " is missing role " + minterRole
        );
    });

    it("Should prevent accept child if it does not have oranization interface", async function () {
        const ERC7401Mock = await (await ethers.getContractFactory("ERC7401Mock")).deploy(owner.address, minter.address, "Test ERC7401");
        await passport.connect(minter).mintTo(user1.address, []);
        await ERC7401Mock.connect(minter).mintTo(1, passport.address);

        await expect(passport.connect(minter).acceptChild(1, 0, ERC7401Mock.address, 1)).to.be.revertedWith("Only organization can be child of passport");
        expect((await passport.childrenOf(1)).length).to.eq(0);
    });
});
