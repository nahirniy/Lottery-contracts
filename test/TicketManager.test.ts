import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RootsyFactory, TicketManager, RootsyOrganization, RewardTokenMintableMock } from "../typechain-types";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { deployBasicContracts } from "./utis";

describe("TicketManager", async () => {
  let hardhatSnapshotId: string;
  let RootsyFactory: RootsyFactory
  let ticketManager: TicketManager;
  let passportAddress: string;
  let organizationAddress: string;
  let campaignsAddresses: string[];
  let lotteryAddress: string;
  let redemptionAddress: string;
  let owner: SignerWithAddress, minter: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
  let organization: RootsyOrganization;
  let rewardTokenMintableMock: RewardTokenMintableMock;

  before(async function () {
    hardhatSnapshotId = await network.provider.send('evm_snapshot')
  });

  beforeEach("Init test environment", async () => {
    const fixture = await loadFixture(deployBasicContracts);
    RootsyFactory = fixture.RootsyFactory;
    ticketManager = fixture.ticketManager;
    owner = fixture.owner;
    minter = fixture.minter;
    passportAddress = fixture.passportAddress;
    organizationAddress = fixture.organizationAddress;
    campaignsAddresses = fixture.campaignsAddresses;
    lotteryAddress = fixture.lotteryAddress;
    redemptionAddress = fixture.redemptionAddress;
    user1 = fixture.user1;
    user2 = fixture.user2;
  });

  it("Can mint multiple tickets to multiple users", async function () {
    await ticketManager.connect(minter).mintTicketsBatch(
      [user1.address, user2.address],
      [campaignsAddresses[0], campaignsAddresses[0]],
      [2, 3]);
    const passport = await ethers.getContractAt("RootsyPassport", passportAddress);
    const organization = await ethers.getContractAt("RootsyOrganization", organizationAddress);
    expect(await passport.balanceOf(user1.address)).to.equal(1);
    expect(await passport.balanceOf(user2.address)).to.equal(1);
    const user1PassportNft = await passport.ownerToken(user1.address);
    const user2PassportNft = await passport.ownerToken(user2.address);

    const user1OrganizationNft = await organization.ownerToken(user1PassportNft);
    const user2OrganizationNft = await organization.ownerToken(user2PassportNft);
    const user1CampaignNfts = await organization.childrenOf(user1OrganizationNft);
    const user2CampaignNfts = await organization.childrenOf(user2OrganizationNft);
    expect(user1CampaignNfts.length).to.equal(1);
    expect(user1CampaignNfts[0].contractAddress).to.equal(campaignsAddresses[0]);
    expect(user2CampaignNfts.length).to.equal(1);
    expect(user2CampaignNfts[0].contractAddress).to.equal(campaignsAddresses[0]);

    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const ticketContract = await campaign.ticketsContract();
    const user1TicketNfts = await campaign.childrenOf(user1CampaignNfts[0].tokenId);
    const user2TicketNfts = await campaign.childrenOf(user2CampaignNfts[0].tokenId);
    expect(user1TicketNfts.length).to.equal(2);
    expect(user2TicketNfts.length).to.equal(3);
    for (let ticket of user1TicketNfts) {
      expect(ticket.contractAddress).to.equal(ticketContract);
    }
    for (let ticket of user2TicketNfts) {
      expect(ticket.contractAddress).to.equal(ticketContract);
    }
  });

  it("Can't mint after mint deadline", async function () {
    await ethers.provider.send("evm_increaseTime", [2000])
    await expect(ticketManager.connect(minter).mintTicketsBatch(
      [user1.address, user2.address],
      [campaignsAddresses[0], campaignsAddresses[0]],
      [2, 3])).to.be.revertedWith("MintTimeEnded");
  });

  it("Should not allow to deploy with wrong factory", async function () {
    const [owner, minter] = await ethers.getSigners();
    const organization = await (await ethers.getContractFactory("RootsyOrganization")).deploy(owner.address, minter.address, passportAddress, "Test Organization");

    await expect((await ethers.getContractFactory("TicketManager")).deploy(owner.address, minter.address, organization.address))
      .to.be.revertedWith("InterfaceNotSupported");
  });

  it("Should not allow to mint batch with mismatching endOwners and ticketsCounts", async function () {

    await expect(ticketManager.connect(minter).mintTicketsBatch(
      [user1.address, user2.address],
      [campaignsAddresses[0], campaignsAddresses[0]],
      [2])).to.be.revertedWith("endOwners, campaigns, and ticketsCounts length mismatch");
    await expect(ticketManager.connect(minter).mintTicketsBatch(
      [user1.address, user2.address],
      [campaignsAddresses[0]],
      [2, 2])).to.be.revertedWith("endOwners, campaigns, and ticketsCounts length mismatch");
  });

  it("Should not allow to transfer batch with mismatching recipient and ticketsCounts", async function () {

    await expect(ticketManager.connect(minter).transferTicketsBatch(
      [user1.address, user2.address],
      [campaignsAddresses[0], campaignsAddresses[0]],
      [2])).to.be.revertedWith("recipient, campaigns, and ticketsCounts length mismatch");
    await expect(ticketManager.connect(minter).transferTicketsBatch(
      [user1.address, user2.address],
      [campaignsAddresses[0]],
      [2, 2])).to.be.revertedWith("recipient, campaigns, and ticketsCounts length mismatch");
  });

  it("Should mint tickets to an existing passport token", async function () {

    const passport = await ethers.getContractAt("RootsyPassport", passportAddress);
    const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
    await passport.grantRole(minterRole, minter.address);

    await ticketManager.connect(minter).mintTickets(
      user1.address,
      campaignsAddresses[0],
      2
    );
    await ticketManager.connect(minter).mintTickets(
      user1.address,
      campaignsAddresses[0],
      2
    );
    expect(await passport.balanceOf(user1.address)).to.equal(1);
  });

  it("Should mint tickets to to the specified user if the user has more than one organization or campaign", async function () {
    await RootsyFactory.deployOrganizationAndCampaigns(owner.address, lotteryAddress, redemptionAddress, "Test Organization 2", ["Campaign 3", "Campaign 4"]);
    const campaignsAddresses = await RootsyFactory.getAllCampaigns();
    const organizationAddresses = await RootsyFactory.getAllOrganizations(); 
    const passport = await ethers.getContractAt("RootsyPassport", passportAddress);
    const organization = await ethers.getContractAt("RootsyPassport", organizationAddresses[1]);

    await ticketManager.connect(minter).mintTickets(
      user1.address,
      campaignsAddresses[0],
      2
    );

    await ticketManager.connect(minter).mintTickets(
      user1.address,
      campaignsAddresses[2],
      2
    );

    await ticketManager.connect(minter).mintTickets(
      user1.address,
      campaignsAddresses[3],
      2
    );

    const allCampaigns = [campaignsAddresses[0], campaignsAddresses[2], campaignsAddresses[3]]
    for (let i = 0; i < 3; i++){
      const campaignAddress = allCampaigns[i];
      const campaign = await ethers.getContractAt("RootsyCampaign", campaignAddress);
      const ticket = await ethers.getContractAt("RootsyTicket", await campaign.ticketsContract());

      expect(await ticket.balanceOf(campaign.address)).to.be.equal(2);
    }

    expect((await passport.childrenOf(1)).length).to.be.equal(2);
    expect((await organization.childrenOf(1)).length).to.be.equal(2);
    expect(await passport.balanceOf(user1.address)).to.equal(1);
  });

  it("Should transfer tickets to the specified users", async function () {
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);

    await ticketManager.connect(minter).mintTickets(
      user1.address,
      campaignsAddresses[0],
      10
    );

    let ticketUser1 = (await campaign.childrenOf(1)).length;
    let ticketUser2 = (await campaign.childrenOf(2)).length;

    expect(ticketUser1).to.be.eq(10);
    expect(ticketUser2).to.be.eq(0);

    await ticketManager.connect(user1).transferTickets(
      user2.address,
      campaignsAddresses[0],
      5
    );

    ticketUser1 = (await campaign.childrenOf(1)).length;
    ticketUser2 = (await campaign.childrenOf(2)).length;

    expect(ticketUser1).to.be.eq(5);
    expect(ticketUser2).to.be.eq(5);

    await ticketManager.connect(user1).transferTicketsBatch(
      [user2.address],
      [campaignsAddresses[0]],
      [5]
    );

    ticketUser1 = (await campaign.childrenOf(1)).length;
    ticketUser2 = (await campaign.childrenOf(2)).length;

    expect(ticketUser1).to.be.eq(0);
    expect(ticketUser2).to.be.eq(10);
  });

  it("Should revert if no organization found for campaign", async function () {
    let randomCompany = ethers.Wallet.createRandom().address;
    await expect(ticketManager.connect(minter).mintTickets(
      user1.address,
      randomCompany,
      2)).to.be.revertedWith("No organization found for campaign");
  });

  it("Should support AccessControl interface", async function () {
    let functionSignature = [
      'hasRole(bytes32,address)',
      'getRoleAdmin(bytes32)',
      'grantRole(bytes32,address)',
      'revokeRole(bytes32,address)',
      'renounceRole(bytes32,address)'
    ];
    let interfaceID = BigInt(0);

    for (const signature of functionSignature) {
      const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
      interfaceID ^= BigInt('0x' + selector);
    }

    const interfaceIDHex = '0x' + interfaceID.toString(16).padStart(8, '0');
    expect(await ticketManager.supportsInterface(interfaceIDHex)).to.equal(true);
  });

  it("Should prevents non-minter from minting tokens", async function () {
    const minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
    await expect(ticketManager.connect(user2).mintTickets(user1.address, campaignsAddresses[0], 2))
      .to.be.revertedWith("AccessControl: account " + user2.address.toLowerCase() + " is missing role " + minterRole);
  });

  after(async function () {
    //revert to initial state to remove time manipulation results
    await network.provider.send("evm_revert", [hardhatSnapshotId]);
  });
})