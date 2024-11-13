import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RootsyFactory, TicketManager, Lottery, RewardTokenMintableMock, TicketRedemption } from "../typechain-types";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { deployBasicContracts } from "./utis";

describe("TicketRedemption", async () => {
  let hardhatSnapshotId: string;
  let RootsyFactory: RootsyFactory;
  let ticketManager: TicketManager;
  let lottery: Lottery;
  let redemption: TicketRedemption;
  let rewardToken: RewardTokenMintableMock;
  let organizationAddresses: string[];
  let campaignsAddresses: string[];
  let organazationsTicketsCount: number[];
  let owner: SignerWithAddress, minter: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;

  async function deployRedemptionAndLottery() {
    const { RootsyFactory, ticketManager, lotteryAddress, redemptionAddress, owner, minter, user1, user2 } = await deployBasicContracts();
    await RootsyFactory.deployOrganizationAndCampaigns(owner.address, lotteryAddress, redemptionAddress, "Test Organization 2", ["Campaign 3", "Campaign 4"]);
    const campaignsAddresses = await RootsyFactory.getAllCampaigns();
    const organizationAddresses = await RootsyFactory.getAllOrganizations();

    const rewardToken = await (await ethers.getContractFactory("RewardTokenMintableMock")).deploy();
    const lottery = (await ethers.getContractAt("Lottery", lotteryAddress)) as Lottery;
    const redemption = (await ethers.getContractAt("TicketRedemption", redemptionAddress)) as TicketRedemption;
    await rewardToken.transfer(redemption.address, ethers.utils.parseEther("1000"));

    let organazationsTicketsCount = [0, 0];

    for (let c = 0; c < campaignsAddresses.length; c++) {
      //campaign 0 and 1 is for organization 0, campaign 2 and 3 is for organization 1
      if (c < 2) {
        await ticketManager.connect(minter).mintTickets(user1.address, campaignsAddresses[c], 5);
        organazationsTicketsCount[0] = organazationsTicketsCount[0] + 5;
      } else {
        await ticketManager.connect(minter).mintTickets(user2.address, campaignsAddresses[c], 5);
        organazationsTicketsCount[1] = organazationsTicketsCount[1] + 5;
      }
    }

    return {
      RootsyFactory,
      ticketManager,
      lottery,
      redemption,
      rewardToken,
      organizationAddresses,
      campaignsAddresses,
      organazationsTicketsCount,
      owner,
      minter,
      user1,
      user2,
    };
  }

  before(async function () {
    hardhatSnapshotId = await network.provider.send("evm_snapshot");
  });

  beforeEach("Init test environment", async () => {
    const fixture = await loadFixture(deployRedemptionAndLottery);
    RootsyFactory = fixture.RootsyFactory;
    ticketManager = fixture.ticketManager;
    lottery = fixture.lottery;
    redemption = fixture.redemption;
    rewardToken = fixture.rewardToken;
    owner = fixture.owner;
    minter = fixture.minter;
    organizationAddresses = fixture.organizationAddresses;
    campaignsAddresses = fixture.campaignsAddresses;
    organazationsTicketsCount = fixture.organazationsTicketsCount;
    user1 = fixture.user1;
    user2 = fixture.user2;
  });

  it("Should prevents deploy with wrong lottery", async function () {
    const organization = await ethers.getContractAt("RootsyOrganization", organizationAddresses[0]);

    await expect((await ethers.getContractFactory("TicketRedemption")).deploy(owner.address, organization.address))
        .to.be.revertedWith("InterfaceNotSupported");
  });

  it("Should prevents non-admin set redemption price, reward token and cap or withdraw tokens", async function () {
    const adminRole = ethers.constants.HashZero;

    await expect(redemption.connect(user1).setRedemptionPrice(1)).to.be.revertedWith(
      "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
    );
    await expect(redemption.connect(user1).setRedemptionCap(1)).to.be.revertedWith(
      "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
    );
    await expect(redemption.connect(user1).setRewardToken(rewardToken.address)).to.be.revertedWith(
      "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
    );
    await expect(redemption.connect(user1).withdrawTokens(rewardToken.address, owner.address, 1)).to.be.revertedWith(
      "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
    );
    await expect(redemption.connect(user1).withdrawAllTokens()).to.be.revertedWith(
      "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
    );
  });

  it("Should prevents if reward token is not contract", async function () {
    await expect(redemption.setRewardToken(user1.address)).to.be.revertedWith("Reward token is not a contract");
  });

  it("Should prevents redemption price from set to 0", async function () {
    await expect(redemption.setRedemptionPrice(0)).to.be.revertedWith("Redemption price can't be 0");
  });

  it("Should prevents redeem if burn period finished or price not set", async function () {
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const ticketContract = await campaign.ticketsContract();
    await expect(redemption.redeem(ticketContract, 2)).to.be.revertedWith("Redemption price not set");

    await ethers.provider.send("evm_increaseTime", [3001]);
    await expect(redemption.redeem(ticketContract, 2)).to.be.revertedWith("Burn period already finished");
  });

  it("Should prevents redeem if redemption cap reached", async function () {
    const redemptionPrice = ethers.utils.parseEther("100");
    await redemption.setRedemptionPrice(redemptionPrice);
    await redemption.setRedemptionCap(redemptionPrice);
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const ticketContract = await campaign.ticketsContract();
    await expect(redemption.redeem(ticketContract, 2)).to.be.revertedWith("Redemption cap reached");
  });

  it("Should prevents ticket redemption if sender does not own any passport", async function () {
    const redemptionPrice = ethers.utils.parseEther("100");
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const ticketAddress = await campaign.ticketsContract();
    await redemption.setRedemptionPrice(redemptionPrice);
    await redemption.setRedemptionCap(redemptionPrice);
    await expect(redemption.connect(minter).redeem(ticketAddress, 1)).to.be.revertedWith("User is not an owner of any passport");
  });

  it("Should prevents ticket redemption if ticket is not registered", async function () {
    const redemptionPrice = ethers.utils.parseEther("100");
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
    await redemption.setRedemptionPrice(redemptionPrice);
    await redemption.setRedemptionCap(redemptionPrice);
    await expect(redemption.connect(user1).redeem(RootsyTicket.address, 1)).to.be.revertedWith("The ticket is not registered");
  });

  it("Should withdraw funds from the contract correctly", async function () {
    const amountToWithdraw = ethers.utils.parseEther("100");

    const balanceRedemtionBefore = await rewardToken.balanceOf(redemption.address);
    const balanceOwnerBefore = await rewardToken.balanceOf(owner.address);

    await redemption.setRewardToken(rewardToken.address);
    await redemption.withdrawTokens(rewardToken.address, owner.address, amountToWithdraw);
    await redemption.withdrawAllTokens();

    const balanceRedemtionAfter = await rewardToken.balanceOf(redemption.address);
    const balanceOwnerAfter = await rewardToken.balanceOf(owner.address);

    expect(balanceRedemtionAfter).to.be.eq(0n);
    expect(balanceOwnerAfter).to.be.eq(balanceOwnerBefore.add(balanceRedemtionBefore));
  });

  it("Correct set redemption price, reward token and cap", async function () {
    const redemptionPrice = ethers.utils.parseEther("100");
    await redemption.setRedemptionPrice(redemptionPrice);
    await redemption.setRewardToken(rewardToken.address);
    await redemption.setRedemptionCap(redemptionPrice);
    expect(await redemption.redemptionPrice()).to.be.eq(redemptionPrice);
    expect(await redemption.redemptionCap()).to.be.eq(redemptionPrice);
    expect(await redemption.rewardToken()).to.be.eq(rewardToken.address);
  });

  it("Correct redemption of tickets for different campaign", async function () {
    const redemptionPrice = ethers.utils.parseEther("1");
    const redemptionCap = ethers.utils.parseEther("100");
    const users = [user1, user2]
    await redemption.setRedemptionPrice(redemptionPrice);
    await redemption.setRedemptionCap(redemptionCap);
    await redemption.setRewardToken(rewardToken.address);

    let iteration = 0;
    for (let u = 0; u < 2; u++) {

      const user = users[u];
      for (let c = 0; c < 2; c++) { 

          const campaignAddress = campaignsAddresses[iteration];
          const campaign = await ethers.getContractAt("RootsyCampaign", campaignAddress);
          const ticketAddress = await campaign.ticketsContract();
          const oldAmountTicket = (await campaign.childrenOf(1)).length;
          const oldBalanceOfRedemption = await rewardToken.balanceOf(redemption.address);
          await redemption.connect(user).redeem(ticketAddress, 3);
          const balanceOfUser = await rewardToken.balanceOf(user.address);
          const rewardAmount = redemptionPrice.mul(3);
          const newAmountTicket = (await campaign.childrenOf(1)).length;
          const newBalanceOfRedemption = await rewardToken.balanceOf(redemption.address);
          iteration +=1;

          expect(newBalanceOfRedemption).to.be.eq(oldBalanceOfRedemption.sub(rewardAmount));
          expect(newAmountTicket).to.be.eq(oldAmountTicket - 3);
          expect(balanceOfUser).to.be.eq(rewardAmount.mul(c + 1));
      }
    }
  });

  it("Should support AccessControl ITicketRedemption interfaces", async function () {
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
    expect(await redemption.supportsInterface(interfaceIDHex)).to.equal(true);

    let functionSignatureRedemption = [
      'lottery()',
      'redeem(address,uint256)',
      'getRedemptionAmount(uint256)',
      'setRewardToken(address)',
      'setRedemptionPrice(uint256)',
      'setRedemptionCap(uint256)',
      'withdrawTokens(address,address,uint256)',
      'withdrawAllTokens()'
    ];
    let interfaceIDRedemption = BigInt(0);

    for (const signature of functionSignatureRedemption) {
        const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
        interfaceIDRedemption ^= BigInt('0x' + selector);
    }

    const interfaceIDHexRedemption = '0x' + interfaceIDRedemption.toString(16).padStart(8, '0');
    expect(await redemption.supportsInterface(interfaceIDHexRedemption)).to.equal(true);
  });

  after(async function () {
    await network.provider.send("evm_revert", [hardhatSnapshotId]);
  });
});
