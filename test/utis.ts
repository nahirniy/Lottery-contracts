import { ethers } from "hardhat";
import { RootsyFactory, RandomGetter } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export async function deployFactory() {
    const [owner, minter, user1, user2] = await ethers.getSigners();

    const lotteryDeployerLibrary = await (await ethers.getContractFactory("LotteryDeployerLibrary")).deploy();
    const redemptionDeployerLibrary = await (await ethers.getContractFactory("RedemptionDeployerLibrary")).deploy();
    const organizationDeployerLibrary = await (await ethers.getContractFactory("OrganizationDeployerLibrary")).deploy();
    const campaignDeployerLibrary = await (await ethers.getContractFactory("CampaignDeployerLibrary")).deploy();
    const ticketDeployerLibrary = await (await ethers.getContractFactory("TicketDeployerLibrary")).deploy();
    const RootsyFactory = await (await ethers.getContractFactory("RootsyFactory", {
        libraries: {
            LotteryDeployerLibrary: lotteryDeployerLibrary.address,
            RedemptionDeployerLibrary: redemptionDeployerLibrary.address,
            OrganizationDeployerLibrary: organizationDeployerLibrary.address,
            CampaignDeployerLibrary: campaignDeployerLibrary.address,
            TicketDeployerLibrary: ticketDeployerLibrary.address
        }
    })).deploy(owner.address);
    const ticketManager = await (await ethers.getContractFactory("TicketManager")).deploy(owner.address, minter.address, RootsyFactory.address);
    const RootsyPassport = await (await ethers.getContractFactory("RootsyPassport")).deploy(owner.address, ticketManager.address, "Test Passport");
    const { coordinator, wrapper, randomGetter, linkToken } = await deployRandomGetter(RootsyFactory, owner);

    await RootsyFactory.setMinterContract(ticketManager.address);
    await RootsyFactory.setRandomGetterContract(randomGetter.address);
    await RootsyFactory.setPassportContract(RootsyPassport.address);


    return { RootsyFactory, RootsyPassport, ticketManager, coordinator, wrapper, randomGetter, linkToken, owner, minter, user1, user2 };
}

export async function deployBasicContracts() {
    const { RootsyFactory, RootsyPassport, ticketManager, coordinator, wrapper, randomGetter, linkToken, owner, minter, user1, user2 } = await deployFactory();

    await RootsyFactory.deployLotteryAndRedemptionContract(
        owner.address,
        +(((new Date().getTime()) / 1000).toFixed(0)) + 1000,
        +(((new Date().getTime()) / 1000).toFixed(0)) + 2000,
        +(((new Date().getTime()) / 1000).toFixed(0)) + 3000,
    );
    const lotteryAddress = await RootsyFactory.lotteries(0);
    const redemptionAddress = await RootsyFactory.redemptions(0);

    await RootsyFactory.deployOrganizationAndCampaigns(
        owner.address,
        lotteryAddress,
        redemptionAddress,
        "Test Organization 1",
        ["Campaign 1", "Campaign 1"]
    );
    const passportAddress = await RootsyFactory.passportContract();
    const organizationAddress = await RootsyFactory.organizations(0);
    const campaignsAddresses = await RootsyFactory.getAllCampaigns();

    return {
      RootsyFactory,
      ticketManager,
      coordinator,
      wrapper,
      randomGetter,
      linkToken,
      passportAddress,
      organizationAddress,
      campaignsAddresses,
      lotteryAddress,
      redemptionAddress,
      owner,
      minter,
      user1,
      user2,
    };
}

export async function deployRandomGetter(RootsyFactory: RootsyFactory, owner: SignerWithAddress) {
    const coordinator = await (await ethers.getContractFactory("VRFCoordinatorV2Mock", owner)).deploy(ethers.utils.parseEther("0.1"), 1e9);
    const linkEthFeed = await (await ethers.getContractFactory("MockV3Aggregator", owner)).deploy(18, ethers.utils.parseEther("0.003"));
    const linkToken = await (await ethers.getContractFactory("MockLinkToken", owner)).deploy();
    const wrapper =  await (await ethers.getContractFactory("VRFV2Wrapper", owner)).deploy(linkToken.address, linkEthFeed.address, coordinator.address);
    const randomGetter = await (await ethers.getContractFactory("RandomGetter", owner)).deploy(linkToken.address, wrapper.address, RootsyFactory.address, owner.address) as RandomGetter;

    const oneHundredLink = ethers.utils.parseEther("100");
    const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
    await wrapper.setConfig(60000, 52000, 10, keyHash, 10);
    await coordinator.fundSubscription(1, oneHundredLink);
    await linkToken.transfer(randomGetter.address, oneHundredLink);

    return { coordinator, wrapper, randomGetter, linkToken };
}
