import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RootsyFactory, TicketMinter, RootsyOrganization, RootsyTicket, RootsyCampaign, RootsyPassport } from "../typechain-types";
import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBasicContracts } from "./utis";
import { BigNumber } from "ethers";

describe("RootsyTicket", async () => {
    let ticket: RootsyTicket;
    let RootsyFactory: RootsyFactory;
    let passportAddress: string;
    let organizationAddress: string;
    let campaignsAddresses: string[];
    let owner: SignerWithAddress, minter: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
    let passport: RootsyPassport;
    let organization: RootsyOrganization;
    let campaign: RootsyCampaign;
    let minterRole: string;

    async function mintPassportAndOrganizationAndCampaign(user: SignerWithAddress) {
        await passport.grantRole(minterRole, minter.address);
        await passport.connect(minter).mintTo(user.address, []);
        await organization.grantRole(minterRole, minter.address);
        const ownerPassportNft = await passport.ownerToken(user.address);
        await organization.connect(minter).mintToPassport(ownerPassportNft, []);
        await campaign.grantRole(minterRole, minter.address);
        const ownerOrganizationNft = await organization.ownerToken(ownerPassportNft);
        await campaign.connect(minter).mintToOrganization(ownerOrganizationNft, []);

        const pendingChildren = await organization.pendingChildrenOf(ownerOrganizationNft);
        const childToAccept = pendingChildren[0];
        const childIndex = 0;
        await organization.connect(user).acceptChild(
            ownerOrganizationNft,
            childIndex,
            childToAccept.contractAddress,
            childToAccept.tokenId
        );
        const campaignId = await organization.childrenOf(ownerOrganizationNft);
        return campaignId[0].tokenId;
    }

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
        passport = await ethers.getContractAt("RootsyPassport", passportAddress);
        organization = await ethers.getContractAt("RootsyOrganization", organizationAddress);
        campaign = await ethers.getContractAt("RootsyCampaign", campaignsAddresses[0]);
        minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER"));
    });

    describe("Minting", function () {
        it("Should mint a ticket to the campaign", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            const campaignId = await mintPassportAndOrganizationAndCampaign(user1);

            await RootsyTicket.connect(minter).mintToCampaign(campaignId, []);
            expect(await RootsyTicket.balanceOf(campaign.address)).to.be.eq(1);
        });

        it("Should prevents non-minter from minting tokens", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            await expect(RootsyTicket.connect(user2).mintToCampaign(1, []))
                .to.be.revertedWith("AccessControl: account " + user2.address.toLowerCase() + " is missing role " + minterRole);
        });

        it("Should prevents non-minter from minting batch of tokens", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            await expect(RootsyTicket.connect(user2).mintToCampaignBatch(5, 1, []))
                .to.be.revertedWith("AccessControl: account " + user2.address.toLowerCase() + " is missing role " + minterRole);
        });

        it("Should mint a batch of tickets to the campaign", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            const campaignId = await mintPassportAndOrganizationAndCampaign(user1);

            const ticketCount = 10;
            await RootsyTicket.connect(minter).mintToCampaignBatch(ticketCount, campaignId, []);
            for (let i = 1; i < ticketCount; i++) {
                expect(await RootsyTicket.ownerOf(i)).to.be.eq(user1.address);
            }
            expect(await RootsyTicket.balanceOf(campaign.address)).to.be.eq(ticketCount);

        });

        it("Can't mint after mint deadline", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            const campaignId = await mintPassportAndOrganizationAndCampaign(user1)
            await ethers.provider.send("evm_increaseTime", [2000])

            await expect(RootsyTicket.connect(minter).mintToCampaign(
                campaignId,
                [],
            )).to.be.revertedWith("MintTimeEnded");
            const ticketsCount = 10;

            await expect(RootsyTicket.connect(minter).mintToCampaignBatch(
                ticketsCount,
                campaignId,
                [],
            )).to.be.revertedWith("MintTimeEnded");
        });

    });

    describe("Burning", function () {

        it("Should burn ticket", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            await campaign.setTicketContract(RootsyTicket.address);
            const campaignId = await mintPassportAndOrganizationAndCampaign(user1);

            await RootsyTicket.connect(minter).mintToCampaign(campaignId, []);

            expect(await RootsyTicket.balanceOf(campaign.address)).to.be.eq(1);
            let pendingChildrenTickets1 = await campaign.pendingChildrenOf(campaignId);
            const childToAcceptTicket1 = pendingChildrenTickets1[0];
            await campaign.connect(user1).acceptChild(
                campaignId,
                0,
                childToAcceptTicket1.contractAddress,
                childToAcceptTicket1.tokenId
            );
            let children = await campaign.childrenOf(campaignId);
            expect(children.length).to.be.eq(1);
            await campaign.connect(user1)["burnTicket()"]();
            children = await campaign.childrenOf(campaignId);
            expect(children.length).to.be.eq(0);
            expect(await RootsyTicket.balanceOf(campaign.address)).to.be.eq(0);
        });

        async function mintTickets(RootsyTicket: RootsyTicket, user: SignerWithAddress, numberTicketsToMint: number) {
            const userCampaignId = await mintPassportAndOrganizationAndCampaign(user)

            await RootsyTicket.connect(minter).mintToCampaignBatch(
                numberTicketsToMint,
                userCampaignId,
                [],
            );

            const pendingTickets = await campaign.pendingChildrenOf(userCampaignId);
            for (let i = pendingTickets.length - 1; i >= 0; i--) {
                const ticketToAccept = pendingTickets[i];
                await campaign.connect(user).acceptChild(
                    userCampaignId,
                    i,
                    ticketToAccept.contractAddress,
                    ticketToAccept.tokenId
                );
            }

            const ticketIds = await campaign.childrenOf(userCampaignId);
            return {
                ticketIds: ticketIds.map(ticketId => ticketId.tokenId),
                userCampaignId: userCampaignId
            };
        }

        async function checkTicketOwnership(RootsyTicket: RootsyTicket, userTicketIds: BigNumber[], userCampaignId: BigNumber, owner: SignerWithAddress) {
            for (let i = 0; i < userTicketIds.length; i++) {
                const ticketId = userTicketIds[i];
                const ticketDirectOwner = await RootsyTicket.directOwnerOf(ticketId);
                expect(ticketDirectOwner.parentId).to.be.eq(userCampaignId);
                expect(await RootsyTicket.ownerOf(ticketId)).to.be.eq(owner.address);
            }
        }

        it("Should burn ticket", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            await campaign.setTicketContract(RootsyTicket.address);

            let user1Data = await mintTickets(RootsyTicket, user1, 2);
            const ticketIds = await RootsyTicket.getUserTicketIds(user1.address);

            expect(user1Data.ticketIds.length).to.be.eq(ticketIds.length);
            expect(user1Data.ticketIds.length).to.be.eq(2);
            
            expect(await RootsyTicket.balanceOf(campaign.address)).to.be.eq(2);
            await campaign.connect(user1)["burnTicket()"]();

            const user1NewTicketIdsData = await campaign.childrenOf(user1Data.userCampaignId);
            const user1NewTicketIds = user1NewTicketIdsData.map(ticketId => ticketId.tokenId);
            expect(user1NewTicketIds.length).to.be.eq(1);
            await checkTicketOwnership(RootsyTicket, user1NewTicketIds, user1Data.userCampaignId, user1);

            expect(await RootsyTicket.balanceOf(campaign.address)).to.be.eq(1);
        });

        it("Should not allow to burn tickets in RootsyTicket contract", async function () {
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
            await mintPassportAndOrganizationAndCampaign(user1);

            await expect(RootsyTicket.connect(user1).burnLastTicket()).to.be.revertedWith("Only Campaign can burn tickets");
        });
        

        it("Should correctly burn last ticket", async function () {
            const lotteryAddress = await RootsyFactory.lotteries(0) 
            const RootsyCampaignMock = await (await ethers.getContractFactory("RootsyCampaignMock")).deploy(
                owner.address,
                minter.address,
                lotteryAddress,
                "Test RootsyCampaignMock");
            const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(
                owner.address,
                minter.address,
                RootsyCampaignMock.address,
                "Test RootsyTicket");
            await RootsyCampaignMock.setTicketContract(RootsyTicket.address);
            await RootsyCampaignMock.mintTo(user1.address);
            await RootsyTicket.connect(minter).mintToCampaignBatch(2, 1, []);
            await RootsyCampaignMock.connect(user1).acceptChild(1, 0, RootsyTicket.address, 1);
            await RootsyCampaignMock.connect(user1).acceptChild(1, 0, RootsyTicket.address, 2);
            
            expect(await RootsyTicket.balanceOf(RootsyCampaignMock.address)).to.be.eq(2);
            expect(await RootsyTicket.totalSupply()).to.be.eq(2);
            await RootsyCampaignMock.burnTicket();
            expect(await RootsyTicket.balanceOf(RootsyCampaignMock.address)).to.be.eq(1);
            expect(await RootsyTicket.totalSupply()).to.be.eq(1);
            await RootsyCampaignMock.burnTicket();
            expect(await RootsyTicket.balanceOf(RootsyCampaignMock.address)).to.be.eq(0);
            expect(await RootsyTicket.totalSupply()).to.be.eq(0);
        });
    });

    it("Should not allow to deploy with wrong campaign", async function () {
        const [owner, minter] = await ethers.getSigners();
        const organization = await (await ethers.getContractFactory("RootsyOrganization")).deploy(owner.address, minter.address, passportAddress, "Test Organization");

        await expect((await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, organization.address, "Test RootsyTicket"))
            .to.be.revertedWith("InterfaceNotSupported");
    });

    it("Should support AccessControl interface", async function () {
        const RootsyTicket = await (await ethers.getContractFactory("RootsyTicket")).deploy(owner.address, minter.address, campaign.address, "Test RootsyTicket");
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
        expect(await RootsyTicket.supportsInterface(interfaceIDHex)).to.equal(true);
    });
});
