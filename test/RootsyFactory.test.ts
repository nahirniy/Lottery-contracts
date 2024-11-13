import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RootsyFactory, TicketManager, RootsyOrganization, RewardTokenMintableMock } from "../typechain-types";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { deployBasicContracts } from "./utis";

describe("RootsyFactory", async () => {
    let hardhatSnapshotId: string;
    let RootsyFactory: RootsyFactory;
    let ticketManager: TicketManager;
    let passportAddress: string;
    let organizationAddress: string;
    let campaignsAddresses: string[];
    let owner: SignerWithAddress, minter: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
    let organization: RootsyOrganization;
    let rewardTokenMintableMock: RewardTokenMintableMock;
    let lotteryAddress: string;
    let redemptionAddress: string;
    before(async function () {
        hardhatSnapshotId = await network.provider.send('evm_snapshot')
    });

    beforeEach("Init test environment", async () => {
        const fixture = await loadFixture(deployBasicContracts);
        RootsyFactory = fixture.RootsyFactory;
        owner = fixture.owner;
        minter = fixture.minter;
        passportAddress = fixture.passportAddress;
        organizationAddress = fixture.organizationAddress;
        campaignsAddresses = fixture.campaignsAddresses;
        user1 = fixture.user1;
        user2 = fixture.user2;
        ticketManager = fixture.ticketManager;
        lotteryAddress = fixture.lotteryAddress;
        redemptionAddress = fixture.redemptionAddress;
    });

    it("Should deploy organization", async function () {
        expect((await (RootsyFactory.getAllOrganizations())).length).to.be.eq(1);
        await RootsyFactory.connect(owner).deployOrganizationContract(owner.address, "Test Organization");
        expect((await (RootsyFactory.getAllOrganizations())).length).to.be.eq(2);
        expect((await RootsyFactory.getAllLotteries()).length).to.be.eq(1);
        expect((await RootsyFactory.getOrganizationsCount())).to.be.eq(2);
        expect((await RootsyFactory.getLotteriesCount())).to.be.eq(1);
    });

    it("Should deploy Campaign And Ticket Contracts", async function () {
        const allCampaigns = await RootsyFactory.getAllCampaigns();
        const allTickets = await RootsyFactory.getAllTickets()

        await RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, organizationAddress, "Test Campaign");
        const newValueofAllCampaigns = await RootsyFactory.getAllCampaigns();
        const newValueofAllTickets = await RootsyFactory.getAllTickets();

        expect(newValueofAllCampaigns.length).to.be.eq(allCampaigns.length + 1);
        expect(newValueofAllTickets.length).to.be.eq(allTickets.length + 1);
        expect((await RootsyFactory.getCampaignsCount())).to.be.eq(allCampaigns.length + 1);
        expect((await RootsyFactory.getTicketsCount())).to.be.eq(allTickets.length + 1);
    });

    it("Should deploy Lottery And Redemption Contracts", async function () {
        const mintDeadline = +(new Date().getTime() / 1000).toFixed(0) + 1000;
        const burnDeadline = +(new Date().getTime() / 1000).toFixed(0) + 2000;
        const lotteryTime = +(new Date().getTime() / 1000).toFixed(0) + 3000;
        const allLotteries = await RootsyFactory.getAllLotteries();
        const allRedemptions = await RootsyFactory.getAllRedemptions()

        await RootsyFactory.connect(owner).deployLotteryAndRedemptionContract(owner.address, mintDeadline, burnDeadline, lotteryTime);
        const newValueofAllLotteries = await RootsyFactory.getAllLotteries();
        const newValueofAllRedemptions = await RootsyFactory.getAllRedemptions();

        expect(newValueofAllLotteries.length).to.be.eq(allLotteries.length + 1);
        expect(newValueofAllRedemptions.length).to.be.eq(allRedemptions.length + 1);
        expect((await RootsyFactory.getRedemptionsCount())).to.be.eq(allRedemptions.length + 1);
    });

    it("Should not allow disable the same organization twice", async function () {
        await RootsyFactory.connect(owner).disableOrganization(organizationAddress);
        await expect(RootsyFactory.connect(owner).disableOrganization(organizationAddress)).to.be.revertedWith("Non Rootsy organization or organization is already disabled");
    });

    it("Should not allow enable the same organization twice", async function () {
        await RootsyFactory.connect(owner).disableOrganization(organizationAddress);
        await RootsyFactory.connect(owner).enableOrganization(organizationAddress);
        await expect(RootsyFactory.connect(owner).enableOrganization(organizationAddress)).to.be.revertedWith("Organization is already enabled");
    });

    it("Should not allow set RootsyPassport contract twice", async function () {
        await expect(RootsyFactory.setPassportContract(passportAddress)).to.be.revertedWith("Passport contract is already set");
    });


    it("Should not allow to deploy Campaign And Ticket Contracts with invalid values", async function () {
        await RootsyFactory.deployLotteryAndRedemptionContract(
            owner.address,
            +(((new Date().getTime()) / 1000).toFixed(0)) + 1000,
            +(((new Date().getTime()) / 1000).toFixed(0)) + 2000,
            +(((new Date().getTime()) / 1000).toFixed(0)) + 3000,
        );
        const redemptionAddress2 = await RootsyFactory.redemptions(1);

        await expect(RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, lotteryAddress, "Test Campaign")).to.be.revertedWith("Not valid organization contract");
        await expect(RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, organizationAddress, redemptionAddress, organizationAddress, "Test Campaign")).to.be.revertedWith("Not valid lottery contract");
        await expect(RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress2, organizationAddress, "Test Campaign")).to.be.revertedWith("Redemption isn't associated with lottery");
        await expect(RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, organizationAddress, "")).to.be.revertedWith("Campaign name is empty");

        await ethers.provider.send("evm_increaseTime", [2000]);
        await expect(RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, organizationAddress, "Test Campaign")).to.be.revertedWith("Mint deadline is in the past");
        await RootsyFactory.connect(owner).disableOrganization(organizationAddress);
        await expect(RootsyFactory.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, organizationAddress, "Test Campaign")).to.be.revertedWith("Organization is disabled");
    });

    it("Should test all functions with 'onlyRole(DEFAULT_ADMIN_ROLE)' modifier with negative scenario", async function () {
        const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
        await expect(RootsyFactory.connect(user1).setMinterContract(ticketManager.address)).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + DEFAULT_ADMIN_ROLE);
        await expect(RootsyFactory.connect(user1).setRandomGetterContract(ticketManager.address)).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + DEFAULT_ADMIN_ROLE);
        await expect(RootsyFactory.connect(user1).setPassportContract(ticketManager.address)).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + DEFAULT_ADMIN_ROLE);
        await expect(RootsyFactory.connect(user1).disableOrganization(organizationAddress)).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + DEFAULT_ADMIN_ROLE);
        await expect(RootsyFactory.connect(user1).enableOrganization(organizationAddress)).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + DEFAULT_ADMIN_ROLE);
    });

    it("Should test all functions with 'onlyRole(DEPLOYER)' modifier with negative scenario", async function () {
        const currentTime = Math.floor(Date.now() / 1000);
        const mintDeadline = currentTime + 86400;
        const burnDeadline = currentTime + 172800;
        const lotteryTime = currentTime + 259200;

        const deployerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEPLOYER"));
        await expect(RootsyFactory.connect(user1).deployLotteryAndRedemptionContract(owner.address, mintDeadline, burnDeadline, lotteryTime)).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + deployerRole);
        await expect(RootsyFactory.connect(user1).deployOrganizationContract(owner.address, "Test Organization")).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + deployerRole);
        await expect(RootsyFactory.connect(user1).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, organizationAddress, "Test Campaign")).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + deployerRole);
        await expect(RootsyFactory.connect(user1).deployOrganizationAndCampaigns(owner.address, lotteryAddress, redemptionAddress, "Test Organization", ["Test Campaign"])).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + deployerRole);
    });

    it("Should not support incorrect interface", async function () {
        await expect(RootsyFactory.connect(owner).setMinterContract(organizationAddress)).to.be.revertedWith("InterfaceNotSupported");
        await expect(RootsyFactory.connect(owner).setRandomGetterContract(organizationAddress)).to.be.revertedWith("InterfaceNotSupported");
        await expect(RootsyFactory.connect(owner).setPassportContract(organizationAddress)).to.be.revertedWith("InterfaceNotSupported");
    });

    it("Should test all functions with 'withSetupMinterContract', 'withSetupRandomGetterContract' and 'withSetupPassportContract' modifier with negative scenario", async function () {
        const lotteryDeployerLibrary = await (await ethers.getContractFactory("LotteryDeployerLibrary")).deploy();
        const redemptionDeployerLibrary = await (await ethers.getContractFactory("RedemptionDeployerLibrary")).deploy();
        const organizationDeployerLibrary = await (await ethers.getContractFactory("OrganizationDeployerLibrary")).deploy();
        const campaignDeployerLibrary = await (await ethers.getContractFactory("CampaignDeployerLibrary")).deploy();
        const ticketDeployerLibrary = await (await ethers.getContractFactory("TicketDeployerLibrary")).deploy();
        const RootsyFactory1 = await (await ethers.getContractFactory("RootsyFactory", {
            libraries: {
                LotteryDeployerLibrary: lotteryDeployerLibrary.address,
                RedemptionDeployerLibrary: redemptionDeployerLibrary.address,
                OrganizationDeployerLibrary: organizationDeployerLibrary.address,
                CampaignDeployerLibrary: campaignDeployerLibrary.address,
                TicketDeployerLibrary: ticketDeployerLibrary.address
            }
        })).deploy(owner.address);
        const currentTime = Math.floor(Date.now() / 1000);
        const mintDeadline = currentTime + 86400;
        const burnDeadline = currentTime + 172800;
        const lotteryTime = currentTime + 259200;

        await expect(RootsyFactory1.connect(owner).deployLotteryAndRedemptionContract(owner.address, mintDeadline, burnDeadline, lotteryTime)).to.be.revertedWith("RandomGetter contract not set");
        await expect(RootsyFactory1.connect(owner).deployOrganizationContract(owner.address, "Test Organization")).to.be.revertedWith("Minter contract not set");
        await expect(RootsyFactory1.connect(owner).deployCampaignAndTicketContract(owner.address, lotteryAddress, redemptionAddress, organizationAddress, "Test Campaign")).to.be.revertedWith("Minter contract not set");
        await expect(RootsyFactory1.connect(owner).deployOrganizationAndCampaigns(owner.address, lotteryAddress, redemptionAddress, "Test Organization", ["Test Campaign"])).to.be.revertedWith("Minter contract not set");
        await RootsyFactory1.setMinterContract(ticketManager.address);
        await expect(RootsyFactory1.connect(owner).deployOrganizationAndCampaigns(owner.address, lotteryAddress, redemptionAddress, "Test Organization", ["Test Campaign"])).to.be.revertedWith("Passport contract not set");
        await expect(RootsyFactory1.connect(owner).deployOrganizationContract(owner.address, "Test Organization")).to.be.revertedWith("Passport contract not set");

    });

    it("Should support AccessControl and IRootsyFactory interfaces", async function () {
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
        expect(await RootsyFactory.supportsInterface(interfaceIDHex)).to.equal(true);

        let functionSignatureFactory = [
            'isOrganization(address)',
            'isLottery(address)',
            'campaignOrganization(address)',
            'ticketsCampaign(address)',
            'getAllLotteries()',
            'getAllOrganizations()',
            'getAllCampaigns()',
            'getAllTickets()',
            'setMinterContract(address)',
            'deployLotteryContract(address,uint32,uint32,uint32)',
            'deployOrganizationContract(address,string)',
            'deployCampaignAndTicketContract(address,address,address,string)',
            'deployOrganizationAndCampaigns(address,address,string,string[])'
        ];
        let interfaceIDFactory = BigInt(0);

        for (const signature of functionSignatureFactory) {
            const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
            interfaceIDFactory ^= BigInt('0x' + selector);
        }

        const interfaceIDHexFactory = '0x' + interfaceID.toString(16).padStart(8, '0');
        expect(await RootsyFactory.supportsInterface(interfaceIDHexFactory)).to.equal(true);
    });
});