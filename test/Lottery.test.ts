import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RootsyFactory, Lottery, RewardTokenMintableMock, VRFV2Wrapper, VRFCoordinatorV2Mock, TicketManager } from "../typechain-types";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { deployBasicContracts } from "./utis";
import { BigNumber } from "ethers";

describe("Lottery", async () => {
  let hardhatSnapshotId: string;
  let RootsyFactory: RootsyFactory;
  let ticketManager: TicketManager;
  let lottery: Lottery;
  let coordinator: VRFCoordinatorV2Mock;
  let wrapper: VRFV2Wrapper;
  let rewardToken: RewardTokenMintableMock;
  let organizationAddresses: string[];
  let campaignsAddresses: string[];
  let organazationsTicketsCount: number[];
  let tiers: any;
  let owner: SignerWithAddress, minter: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;

  async function deployAndSetupLottery() {
    const {
      RootsyFactory,
      ticketManager,
      lotteryAddress,
      redemptionAddress,
      coordinator,
      wrapper,
      owner,
      minter,
      user1,
      user2,
    } = await deployBasicContracts();
    
    await RootsyFactory.deployOrganizationAndCampaigns(owner.address, lotteryAddress, redemptionAddress, "Test Organization 2", ["Campaign 3", "Campaign 4"]);
    const campaignsAddresses = await RootsyFactory.getAllCampaigns();
    const organizationAddresses = await RootsyFactory.getAllOrganizations();

    const rewardToken = await (await ethers.getContractFactory("RewardTokenMintableMock")).deploy();
    const lottery = (await ethers.getContractAt("Lottery", lotteryAddress)) as Lottery;
    const tiers = [
      {
        tierType: 0,
        winnersShare: 0,
        winnersCount: 1,
        rewardAmount: ethers.utils.parseEther("100"),
      },
      {
        tierType: 1,
        winnersShare: 45_00, // 45%
        winnersCount: 0,
        rewardAmount: ethers.utils.parseEther("10"),
      },
      {
        tierType: 2,
        winnersShare: 0,
        winnersCount: 10,
        rewardAmount: ethers.utils.parseEther("1"),
      }
    ];

    await rewardToken.transfer(lottery.address, ethers.utils.parseEther("1000"));
    await lottery.setupLottery(rewardToken.address, ethers.utils.parseEther("90"),  tiers, [8000, 2000]);
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
      lottery,
      ticketManager,
      coordinator,
      wrapper,
      rewardToken,
      organizationAddresses,
      campaignsAddresses,
      organazationsTicketsCount,
      owner,
      minter,
      tiers,
      user1,
      user2,
    };
  }

  before(async function () {
    hardhatSnapshotId = await network.provider.send("evm_snapshot");
  });

  beforeEach("Init test environment", async () => {
    const fixture = await loadFixture(deployAndSetupLottery);
    RootsyFactory = fixture.RootsyFactory;
    lottery = fixture.lottery;
    ticketManager = fixture.ticketManager;
    coordinator = fixture.coordinator;
    wrapper = fixture.wrapper;
    rewardToken = fixture.rewardToken;
    owner = fixture.owner;
    minter = fixture.minter;
    organizationAddresses = fixture.organizationAddresses;
    campaignsAddresses = fixture.campaignsAddresses;
    organazationsTicketsCount = fixture.organazationsTicketsCount;
    tiers = fixture.tiers;
    user1 = fixture.user1;
    user2 = fixture.user2;
  });

  it("Ticket contract is registered if deployed through factory", async function () {
    for (let i = 0; i < campaignsAddresses.length; i++) {
      const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[i]);
      const ticketContract = await campaign.ticketsContract();
      const organizationAddress = i < 2 ? organizationAddresses[0] : organizationAddresses[1];
      const ticketAddress = await lottery.organizationTicketsContracts(organizationAddress, i < 2 ? i : i - 2);
      const organizationTickets = await lottery.getOrganizationTicketsContracts(organizationAddress);
      expect(organizationTickets.length).to.be.equal(2);
      expect(ticketAddress).to.equal(ticketContract);
    }
  });

  it("Should withdraw funds from the contract correctly", async function () {
    const amountToWithdraw = ethers.utils.parseEther("100");

    const balanceLotteryBefore = await rewardToken.balanceOf(lottery.address);
    const balanceOwnerBefore = await rewardToken.balanceOf(owner.address);

    await lottery.withdrawTokens(rewardToken.address, owner.address, amountToWithdraw);
    await lottery.withdrawAllTokens();

    const balanceLotteryAfter = await rewardToken.balanceOf(lottery.address);
    const balanceOwnerAfter = await rewardToken.balanceOf(owner.address);

    expect(balanceLotteryAfter).to.be.eq(0n);
    expect(balanceOwnerAfter).to.be.eq(balanceOwnerBefore.add(balanceLotteryBefore));
  });

  it("Should prevents from deploy lottery if incorrect time values", async function () {
    const mintDeadline = +(new Date().getTime() / 1000).toFixed(0) + 1000;
    const burnDeadline = +(new Date().getTime() / 1000).toFixed(0) + 2000;
    const lotteryTime = +(new Date().getTime() / 1000).toFixed(0) + 3000;

    await expect(RootsyFactory.deployLotteryAndRedemptionContract(owner.address, 0, burnDeadline, lotteryTime)).to.be.revertedWith("Incorrect time values");
    await expect(RootsyFactory.deployLotteryAndRedemptionContract(owner.address, mintDeadline, 0, lotteryTime)).to.be.revertedWith("Incorrect time values");
    await expect(RootsyFactory.deployLotteryAndRedemptionContract(owner.address, mintDeadline, burnDeadline, 0)).to.be.revertedWith("Incorrect time values");
  });

  it("Should prevents non-registar from register ticket", async function () {
    const registerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REGISTRAR"));
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const ticketAddress = await campaign.ticketsContract();

    await expect(lottery.connect(user1).registerTicketContract(ticketAddress)).to.be.revertedWith(
      "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + registerRole
    );
  });

  it("Should prevents register ticket if ticket is already registered", async function () {
    const registerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REGISTRAR"));
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
    const ticketContract = await campaign.ticketsContract();
    await lottery.grantRole(registerRole, owner.address);

    await expect(lottery.registerTicketContract(ticketContract)).to.be.revertedWith("Ticket contract is already registered");
  });

  it("Should prevents from register ticket contracts with wrong interface", async function () {
    const registerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REGISTRAR"));
    await lottery.grantRole(registerRole, owner.address);
    const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);

    await expect(lottery.registerTicketContract(campaign.address)).to.be.revertedWith("InterfaceNotSupported");
  });

  it("Can't initializeLottery before burn deadline", async function () {
    await expect(lottery.initializeLottery(0)).to.be.revertedWith("Burn period not finished yet");
  });

  describe("Lottery initialized", async function () {
    beforeEach(async function () {
      await ethers.provider.send("evm_increaseTime", [2001]);
    });

    it("Lottery initialized correctly for 1 organization", async function () {
      await lottery.initializeLottery(1);
      const organizations = await lottery.getAllOrganizations();

      expect(organizations[0]).to.be.eq(organizationAddresses[0]);
      expect(await lottery.initializedOrganizationsCount()).to.equal(1);
      expect(await lottery.lotteryTicketsTotalSupply()).to.equal(organazationsTicketsCount[0]);
    });

    it("Lottery initialized correctly when expected number of organizations greater than actual number", async function () {
      await lottery.initializeLottery(5); // expected 2

      expect(await lottery.initializedOrganizationsCount()).to.equal(2);
      const expectedTicketsCount = organazationsTicketsCount[0] + organazationsTicketsCount[1];
      const organizations = await lottery.getAllOrganizations();

      expect(organizations[0]).to.be.eq(organizationAddresses[0]);
      expect(organizations[1]).to.be.eq(organizationAddresses[1]);
      expect(await lottery.lotteryTicketsTotalSupply()).to.equal(expectedTicketsCount);
    });

    it("Lottery initialized correctly", async function () {
      await lottery.initializeLottery(0);

      expect(await lottery.initializedOrganizationsCount()).to.equal(2);
      const expectedTicketsCount = organazationsTicketsCount[0] + organazationsTicketsCount[1];
      const organizations = await lottery.getAllOrganizations();

      expect(organizations.length).to.be.eq(await lottery.getOrganizationsCount());
      expect(organizations[0]).to.be.eq(organizationAddresses[0]);
      expect(organizations[1]).to.be.eq(organizationAddresses[1]);
      expect(await lottery.lotteryTicketsTotalSupply()).to.equal(expectedTicketsCount);

      const organization1TicketsRange = await lottery.organizationTicketsRange(organizationAddresses[0]);
      expect(organization1TicketsRange.firstLotteryTicketId).to.equal(0);
      expect(organization1TicketsRange.lastLotteryTicketId).to.equal(9);
      const organization2TicketsRange = await lottery.organizationTicketsRange(organizationAddresses[1]);
      expect(organization2TicketsRange.firstLotteryTicketId).to.equal(10);
      expect(organization2TicketsRange.lastLotteryTicketId).to.equal(19);

      const allCampaignTickets = await lottery.getAllCampaignTickets();
      const allTickets = await RootsyFactory.getAllTickets();
      expect(allCampaignTickets.length).to.equal(4);
      let startIndex = 0;
      for (let i = 0; i < allCampaignTickets.length; i++) {
        expect(allCampaignTickets[i].campaignTicketContract).to.equal(allTickets[i]);
        expect(allCampaignTickets[i].ticketRange.firstLotteryTicketId).to.equal(startIndex);
        const endIndex = startIndex + 4;
        expect(allCampaignTickets[i].ticketRange.lastLotteryTicketId).to.equal(endIndex);
        startIndex = endIndex + 1;
      }

      const tiers = await lottery.getAllTiers();
      const tier0 = await lottery.getTier(0);
      const tier1 = await lottery.getTier(1);
      const tier2 = await lottery.getTier(2);

      expect(tier0.tierType).to.be.eq(tiers[0].tierType);
      expect(tier1.tierType).to.be.eq(tiers[1].tierType);
      expect(tier2.tierType).to.be.eq(tiers[2].tierType);

      const organizationSharesForFixedTiers = await lottery.getOrganizationSharesForFixedTiers();

      expect(organizationSharesForFixedTiers[0]).to.be.eq(8000);
      expect(organizationSharesForFixedTiers[1]).to.be.eq(2000);
      expect(tiers.length).to.equal(await lottery.getTiersCount());
      expect(tiers.length).to.equal(3);

      //Jackpot tier
      expect(tiers[0].tierType).to.equal(0);
      expect(tiers[0].winnersCount).to.equal(1);
      expect(tiers[0].winnersShare).to.equal(0);
      expect(tiers[0].rewardAmount).to.equal(ethers.utils.parseEther("100"));

      //Random tier should be initialized with winners count
      expect(tiers[1].tierType).to.equal(1);
      expect(tiers[1].winnersCount).to.equal(Math.trunc((expectedTicketsCount * 45) / 100));
      expect(tiers[1].winnersShare).to.equal(4500); // 45%
      expect(tiers[1].rewardAmount).to.equal(ethers.utils.parseEther("10"));

      //Fixed winners tier
      expect(tiers[2].tierType).to.equal(2);
      expect(tiers[2].winnersCount).to.equal(10);
      expect(tiers[2].winnersShare).to.equal(0);
      expect(tiers[2].rewardAmount).to.equal(ethers.utils.parseEther("1"));

      const campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[1]);
      const ticket = await ethers.getContractAt("RootsyTicket", await campaign.ticketsContract());
      const userTicketsIDs = await ticket.getUserTicketIds(user1.address);

      expect(await lottery.getLotteryTicketId(campaignsAddresses[1], userTicketsIDs[0])).to.be.eq(6);
      expect(await lottery.getLotteryTicketId(campaignsAddresses[1], userTicketsIDs[1])).to.be.eq(7);
      expect(await lottery.getLotteryTicketId(campaignsAddresses[1], userTicketsIDs[2])).to.be.eq(8);
      expect(await lottery.getLotteryTicketId(campaignsAddresses[1], userTicketsIDs[3])).to.be.eq(9);
      expect(await lottery.getLotteryTicketId(campaignsAddresses[1], userTicketsIDs[4])).to.be.eq(10);
    });

    it("Can't call initializeLottery twice", async function () {
      await lottery.initializeLottery(0);
      await expect(lottery.initializeLottery(0)).to.be.revertedWith("Lottery already initialized");
    });

    it("Can't call initializeLottery if not enough tickets for number of winners", async function () {
      const currentTiers = JSON.parse(JSON.stringify(tiers));;
      currentTiers[2].winnersCount = 100;
      await lottery.setupLottery(rewardToken.address, ethers.utils.parseEther("90"),  currentTiers, [8000, 2000]);
      await expect(lottery.initializeLottery(0)).to.be.revertedWith("Not enough tickets for the number of winners");
    });

    it("Can't call runLottery before lottery time come", async function () {
      await lottery.initializeLottery(0);
      await expect(lottery.runLottery()).to.be.revertedWith("Lottery time not reached yet");
    });

    it("Can't call runLottery if lottery is not fully initialized", async function () {
      await ethers.provider.send("evm_increaseTime", [3001]);
      await lottery.initializeLottery(1);
      await expect(lottery.runLottery()).to.be.revertedWith("Lottery is not fully initialized");
    });

    it("Can't initializeLottery if lottery is not set up", async function () {
      // to test this scenario we need to deploy a lottery contract not from a factory
      const mintDeadline = +(new Date().getTime() / 1000).toFixed(0) + 3000;
      const burnDeadline = +(new Date().getTime() / 1000).toFixed(0) + 4000;
      const lotteryTime = +(new Date().getTime() / 1000).toFixed(0) + 5000;

      const lottery2 = await (await ethers.getContractFactory("Lottery")).deploy(owner.address, owner.address, owner.address, mintDeadline, burnDeadline, lotteryTime);
      await ethers.provider.send("evm_increaseTime", [2001]);
      await expect(lottery2.initializeLottery(0)).to.be.revertedWith("Lottery is not set up");
    });

    it("Can't call rewardWinners if lottery is not run", async function () {
      await lottery.initializeLottery(0);
      await expect(lottery.rewardWinners(0)).to.be.revertedWith("Request is pending or lottery is not run");
    });
  });

  describe("Lottery run", async function () {
    type Winner = {
      owner: string;
      amountToken: number;
    };

    async function processTierWinners(winners: Winner[], tier: number) {
      const lotteryTicketId = await lottery.getTierWinners(tier);

      for (let i = 0; i < lotteryTicketId.length; i += 1) {
        const [ticketAddress, ticketId] = await lottery.getUnderlyingTicket(lotteryTicketId[i]);
        const ticketContract = await ethers.getContractAt("RootsyTicket", ticketAddress);
        const owner = await ticketContract.ownerOf(ticketId);
        const amountToken = Number(await lottery.winnerAmount(lotteryTicketId[i]));
        const index = winners.findIndex((winner) => winner.owner === owner);

        if (index !== -1) {
          winners[index].amountToken += amountToken;
        } else {
          winners.push({ owner, amountToken });
        }
      }
    }

    async function fulfillRandomWord(currentLottery: Lottery) {
      function generateRandomNumber() {
        let number = '';
        for (let i = 0; i < 77; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
      }

      const lastRequestId = await currentLottery.requestRandomNumberId();
      const randomNumber = generateRandomNumber();
      await coordinator.fulfillRandomWordsWithOverride(lastRequestId, wrapper.address, [randomNumber]);
    }

    beforeEach(async function () {
      await ethers.provider.send("evm_increaseTime", [3001]);
      await lottery.initializeLottery(0);
      await lottery.runLottery();
      await fulfillRandomWord(lottery);
    });

    it("Lottery requestRandomNumberId is gotten", async function () {
      expect(await lottery.requestRandomNumberId()).to.not.equal(0);
    });

    it("Can't call runLottery twice", async function () {
      await expect(lottery.runLottery()).to.be.revertedWith("Lottery already run");
    });

    it("Can't reward winners twice", async function () {
      await lottery.rewardWinners(0);
      await expect(lottery.rewardWinners(0)).to.be.revertedWith("Lottery already processed");
    });

    it("Can't reward over cap winners if ticket ID doesn't exist", async function () {
      await expect(lottery.rewardOverCapWinners([1])).to.be.revertedWith("Token ID does not exist");
    });

    it("Should prevents if non-rewarder reward over cap winners", async function () {
      const rewarderRole = await lottery.REWARDER_ROLE();
      await expect(lottery.connect(user1).rewardOverCapWinners([1])).to.be.revertedWith(
        "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + rewarderRole
      );
      await expect(lottery.connect(user1).rewardOverCapWinner(1)).to.be.revertedWith(
        "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + rewarderRole
      );
    });

    it("Reward token is transferred to one user who won jackpot and confirmed rewarder", async function () {
      const winners: Winner[] = [];
      const oldBalanceOfLottery = Number(await rewardToken.balanceOf(lottery.address));
      const tx = await lottery.rewardWinners(1);

      const receipt = await tx.wait();
      const ticketId = receipt.events?.[0].args?.[1];

      expect((await lottery.getOverCapWinnersCount())).to.be.eq((await lottery.getAllOverCapWinners()).length);

      await lottery.rewardOverCapWinners([ticketId]);
      await processTierWinners(winners, 0);

      const newBalanceOfLottery = Number(await rewardToken.balanceOf(lottery.address));
      const balanceOfWinner = Number(await rewardToken.balanceOf(winners[0].owner));

      expect(winners[0].amountToken).to.eq(balanceOfWinner);
      expect(newBalanceOfLottery).to.eq(oldBalanceOfLottery - balanceOfWinner);
    });

    it("Lottery should work correctly even if there aren't enough tickets and verified users for the reward", async function () {
      // to test this scenario we need to deploy a new lottery contract
      await RootsyFactory.deployLotteryAndRedemptionContract(
        owner.address,
        +(((new Date().getTime()) / 1000).toFixed(0)) + 4000,
        +(((new Date().getTime()) / 1000).toFixed(0)) + 5000,
        +(((new Date().getTime()) / 1000).toFixed(0)) + 6000,
      );

      const lottery2 = await ethers.getContractAt("Lottery", await RootsyFactory.lotteries(1));
      const redemption2 = await ethers.getContractAt("Lottery", await RootsyFactory.redemptions(1));

      await RootsyFactory.deployOrganizationAndCampaigns(
        owner.address,
        lottery2.address,
        redemption2.address,
        "Test Organization 3",
        ["Campaign 5"]
      );

      await RootsyFactory.deployOrganizationAndCampaigns(
        owner.address,
        lottery2.address,
        redemption2.address,
        "Test Organization 4",
        ["Campaign 6"]
      );

      await RootsyFactory.deployOrganizationAndCampaigns(
        owner.address,
        lottery2.address,
        redemption2.address,
        "Test Organization 5",
        ["Campaign 7"]
      );

      const campaignsAddresses = await RootsyFactory.getAllCampaigns();
      const campaign5 = campaignsAddresses[campaignsAddresses.length - 3];
      const campaign6 = campaignsAddresses[campaignsAddresses.length - 2];
      await ticketManager.connect(minter).mintTickets(user1.address, campaign5, 19);
      await ticketManager.connect(minter).mintTickets(user1.address, campaign6, 1);

      await rewardToken.transfer(lottery2.address, ethers.utils.parseEther("1000"));
      await lottery2.setupLottery(rewardToken.address, ethers.utils.parseEther("9"),  tiers, [3000, 4000, 3000]);
      await ethers.provider.send("evm_increaseTime", [2001]);
      await lottery2.initializeLottery(0);
      await ethers.provider.send("evm_increaseTime", [1001]);
      await lottery2.runLottery();
      await fulfillRandomWord(lottery2);

      await lottery2.rewardWinners(0);

      const overCapWinners = await lottery2.getAllOverCapWinners();
      const verifiedWinners = [...overCapWinners];
      verifiedWinners.splice(0, 8); // this means that only last two tickets are verified (total amount is 20)

      const userBalanceBefore = await rewardToken.balanceOf(user1.address);

      const amountJackpotWinners = (await lottery2.getTierWinners(0)).length;
      const amountRandomWinners = (await lottery2.getTierWinners(1)).length;
      const amountFixedWinners = (await lottery2.getTierWinners(2)).length;

      // all tickets are owned by user 1, so he should receive 2 rewards
      await lottery2.rewardOverCapWinners(verifiedWinners);
      expect(await rewardToken.balanceOf(user1.address)).to.be.eq(tiers[1].rewardAmount.mul(2).add(userBalanceBefore));
      expect((await lottery.getWinnersCount())).to.be.eq((await lottery.getAllWinners()).length);
      expect(amountJackpotWinners).to.be.eq(1);
      expect(amountRandomWinners).to.be.eq(9);
      expect(amountFixedWinners).to.be.lessThanOrEqual(10);
    });

    it("Correct reward when expected number of tiers greater than actual number", async function () {
      const oldBalanceOfLottery = Number(await rewardToken.balanceOf(lottery.address));
      const tx = await lottery.rewardWinners(5);
      const distributedFixedAmount = (await lottery.getTierWinners(2)).length;
      const distributedAmount = Number(ethers.utils.parseEther(`${190 + distributedFixedAmount}`));

      const receipt = await tx.wait();
      const ticketId = receipt.events?.[0].args?.[1]; // first event must be jackpot
      await lottery.rewardOverCapWinners([ticketId]);

      const newBalanceOfLottery = Number(await rewardToken.balanceOf(lottery.address));
      expect(newBalanceOfLottery).to.eq(oldBalanceOfLottery - distributedAmount);
    });

    it("Reward token is transferred to winners", async function () {
      const oldBalanceOfLottery = Number(await rewardToken.balanceOf(lottery.address));
      const winners: Winner[] = [];

      const tx = await lottery.rewardWinners(0);

      const receipt = await tx.wait();
      const ticketId = receipt.events?.[0].args?.[1]; // first event must be jackpot
      await lottery.rewardOverCapWinner(ticketId);

      await processTierWinners(winners, 0);
      await processTierWinners(winners, 1);
      await processTierWinners(winners, 2);

      let totalSpentTokens = 0;
      for (let i = 0; i < winners.length; i += 1) {
        const balanceOfWinner = Number(await rewardToken.balanceOf(winners[i].owner));
        totalSpentTokens += balanceOfWinner;

        expect(winners[i].amountToken).to.eq(balanceOfWinner);
      }

      const amountJackpotWinners = (await lottery.getTierWinners(0)).length;
      const amountRandomWinners = (await lottery.getTierWinners(1)).length;
      const amountFixedWinners = (await lottery.getTierWinners(2)).length;

      const newBalanceOfLottery = Number(await rewardToken.balanceOf(lottery.address));
      expect(newBalanceOfLottery).to.eq(oldBalanceOfLottery - totalSpentTokens);
      expect((await lottery.getWinnersCount())).to.be.eq((await lottery.getAllWinners()).length);
      expect(amountJackpotWinners).to.be.eq(1);
      expect(amountRandomWinners).to.be.eq(9);
      expect(amountFixedWinners).to.be.lessThanOrEqual(10);
    });
  });

  describe("Terms and conditions for setup lottery", async function () {
    type Tier = {
      tierType: number;
      winnersShare: number;
      winnersCount: number;
      rewardAmount: BigNumber;
    };

    let tier0: Tier;
    let tier1: Tier;
    let tier2: Tier;

    const lotteryCap = ethers.utils.parseEther("100")

    beforeEach(async function () {

      tier0 = {
        tierType: 0,
        winnersShare: 0,
        winnersCount: 1,
        rewardAmount: ethers.utils.parseEther("100"),
      };
      tier1 = {
        tierType: 1,
        winnersShare: 40_00, //40%
        winnersCount: 0,
        rewardAmount: ethers.utils.parseEther("10"),
      };
      tier2 = {
        tierType: 2,
        winnersShare: 0,
        winnersCount: 10,
        rewardAmount: ethers.utils.parseEther("1"),
      };

      await ethers.provider.send("evm_increaseTime", [2001]);
      await lottery.initializeLottery(0);
    });

    it("Should prevents if non-admin setup or withdraw tokens", async function () {
      const adminRole = ethers.constants.HashZero;
      await expect(lottery.connect(user1).setupLottery(rewardToken.address, lotteryCap, [], [])).to.be.revertedWith(
        "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
      );
      await expect(lottery.connect(user1).withdrawTokens(rewardToken.address, owner.address, 1)).to.be.revertedWith(
        "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
      );
      await expect(lottery.connect(user1).withdrawAllTokens()).to.be.revertedWith(
        "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
      );
    });

    it("Should prevents setup after lottery time", async function () {
      await ethers.provider.send("evm_increaseTime", [3001]);
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [], [])).to.be.revertedWith("Can't setup after lottery time");
    });

    it("Should prevents setup if reward token is not a contract", async function () {
      await expect(lottery.setupLottery(user1.address, lotteryCap, [], [])).to.be.revertedWith("Reward token is not a contract");
    });

    it("Should prevents setup if lottery cap is zero", async function () {
      await expect(lottery.setupLottery(rewardToken.address, 0, [], [8000, 2000])).to.be.revertedWith("Lottery cap can't be zero");
    });

    it("Should prevents setup if incorrect organization shares count", async function () {
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [], [])).to.be.revertedWith("Incorrect organization shares count");
    });

    it("Should prevents setup if organization shares count more than bips or 0", async function () {
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [], [12000, 2000])).to.be.revertedWith("Incorrect organization shares");
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [], [0, 2000])).to.be.revertedWith("Incorrect organization shares");
    });

    it("Should prevents setup if total shares amounu is not 100%", async function () {
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [], [8000, 1999])).to.be.revertedWith("Total shares sum must be 100%");
    });

    it("Should prevents setup if first tier is not jackpot", async function () {
      tier0.tierType = 1;
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0], [8000, 2000])).to.be.revertedWith("First tier must be Jackpot");
    });

    it("Should prevents setup if jackpot tier has more than 2 winners", async function () {
      tier0.winnersCount = 2;
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0], [8000, 2000])).to.be.revertedWith("There must be 1 winner in Jackpot tier");
    });

    it("Should prevents setup if reward amount equal 0", async function () {
      tier0.rewardAmount = ethers.utils.parseEther("0");
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0], [8000, 2000])).to.be.revertedWith("Incorrect tier values");
    });

    it("Should prevents setup if tiers in the wrong order", async function () {
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0, tier2, tier1], [8000, 2000])).to.be.revertedWith("Incorrect tier order");
    });

    it("Should prevents setup if winners share equal 0 for random tier or count for fixed", async function () {
      tier1.winnersShare = 0;
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0, tier1], [8000, 2000])).to.be.revertedWith("Winners share can't be 0 for random tier");

      tier1.winnersShare = 40_00;
      tier2.winnersCount = 0;
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0, tier2], [8000, 2000])).to.be.revertedWith("Winners count can't be 0 for fixed tier");
    });

    it("Should prevents setup if winners count equal zero in fixed tier for organization", async function () {
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0, tier1, tier2], [10000, 0])).to.be.revertedWith("Organization winners count can't be 0 for fixed tier");
    });

    it("Should prevents setup if winners winners count does not match tier winners count in fixed tier for organization", async function () {
      tier2.winnersCount = 11;
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0, tier1, tier2], [8000, 2000])).to.be.revertedWith("Total organization winners count does not match tier winners count");
    });

    it("Should prevents setup if winners count more that 100", async function () {
      tier2.winnersCount = 110;
      await expect(lottery.setupLottery(rewardToken.address, lotteryCap, [tier0, tier2], [8000, 2000])).to.be.revertedWith("Winners count can't exceed 100 per tier");
    });
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
    expect(await lottery.supportsInterface(interfaceIDHex)).to.equal(true);
  });

  after(async function () {
    //revert to initial state to remove time manipulation results
    await network.provider.send("evm_revert", [hardhatSnapshotId]);
  });
});
