import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBasicContracts, deployRandomGetter } from "./utis";
import { VRFCoordinatorV2Mock, VRFV2Wrapper, MockLinkToken, Lottery, RootsyFactory, RandomGetter, LotteryMock } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("RandomGetter", async () => {
    let RootsyFactory: RootsyFactory;
    let lottery: Lottery;
    let coordinator: VRFCoordinatorV2Mock;
    let wrapper: VRFV2Wrapper;
    let randomGetter: RandomGetter;
    let linkToken: MockLinkToken;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    async function deployLotteryAndRandomGetter() {
        const { RootsyFactory, ticketManager, lotteryAddress, coordinator, wrapper, randomGetter, linkToken, owner, minter, user1, user2 } = await deployBasicContracts();

        const campaignsAddresses = await RootsyFactory.getAllCampaigns();
        const lottery = (await ethers.getContractAt("Lottery", lotteryAddress)) as Lottery;
        const rewardToken = await (await ethers.getContractFactory("RewardTokenMintableMock")).deploy();

        await rewardToken.transfer(lottery.address, ethers.utils.parseEther("1000"));
        await ticketManager.connect(minter).mintTickets(user1.address, campaignsAddresses[0], 5);
        await lottery.setupLottery(rewardToken.address, ethers.utils.parseEther("100"), [ { tierType: 0, winnersShare: 0, winnersCount: 1, rewardAmount: 100}], [10000]);

        return { RootsyFactory, lottery, coordinator, wrapper, randomGetter, rewardToken, linkToken, owner, user1, user2 };
    }

    async function fulfillRandomWord() {
        function generateRandomNumber() {
            let number = '';
            for (let i = 0; i < 77; i++) {
              number += Math.floor(Math.random() * 10);
            }
            return number;
        }

        const lastRequestId = await lottery.requestRandomNumberId();
        const randomNumber = generateRandomNumber();
        await coordinator.fulfillRandomWordsWithOverride(lastRequestId, wrapper.address, [randomNumber]);
    }

    beforeEach("Init test environment", async () => {
        const fixture = await loadFixture(deployLotteryAndRandomGetter);
        RootsyFactory = fixture.RootsyFactory;
        lottery = fixture.lottery;
        coordinator = fixture.coordinator;
        wrapper = fixture.wrapper;
        randomGetter = fixture.randomGetter;
        linkToken = fixture.linkToken;
        owner = fixture.owner;
        user1 = fixture.user1;
        user2 = fixture.user2;
    });

    
    it("Should prevents deploy with wrong factory", async function () {
        await expect((await ethers.getContractFactory("RandomGetter", owner)).deploy(linkToken.address, wrapper.address, lottery.address, owner.address))
            .to.be.revertedWith("InterfaceNotSupported");
    });

    it("Should successfully receive a random number", async function () {
        await ethers.provider.send("evm_increaseTime", [4001]);
        await lottery.initializeLottery(0);
        await lottery.runLottery();
        await fulfillRandomWord();
        await lottery.rewardWinners(0);
        const lastRequestId = await lottery.requestRandomNumberId();
        const randomWord= await randomGetter.randomNumbersByRequestId(lastRequestId);
        const randomSalt = await lottery.randomSalt();
        const randomFromLottery = await randomGetter["getRandomNumber(address)"](lottery.address);
        const randomFromId = await randomGetter["getRandomNumber(uint256)"](lastRequestId);

        expect(randomFromLottery).to.be.eq(randomFromId);
        expect(randomSalt).to.be.eq(randomWord);
    });

    
    it("Should successfully receive 1 if random number equal 0", async function () {
        await ethers.provider.send("evm_increaseTime", [3001]);
        await lottery.initializeLottery(0);
        await lottery.runLottery();
        const lastRequestId = await lottery.requestRandomNumberId();
        await coordinator.fulfillRandomWordsWithOverride(lastRequestId, wrapper.address, [0]);
        await lottery.rewardWinners(0);
        const randomWord = await randomGetter.randomNumbersByRequestId(lastRequestId);
        const randomSalt = await lottery.randomSalt();

        expect(randomWord).to.be.eq(1);
        expect(randomSalt).to.be.eq(1);
    });

    it("Should prevents call requestRandomNumber if lottery already has random number or request id pending", async function () {
        const RootsyFactoryMock = await (await ethers.getContractFactory("RootsyFactoryMock")).deploy();
        const lotteryMock = await (await ethers.getContractFactory("LotteryMock")).deploy() as LotteryMock;
        const { coordinator, wrapper, randomGetter } = await deployRandomGetter(RootsyFactoryMock as unknown as RootsyFactory, owner);

        await RootsyFactoryMock.addToLottery(lotteryMock.address);
        await lotteryMock.setupLottery(randomGetter.address);
        await lotteryMock.runLottery();
        await expect(lotteryMock.runLottery()).to.be.revertedWith("Lottery already has random number or request id pending");

        await coordinator.fulfillRandomWordsWithOverride(1, wrapper.address, [1]);
        await lotteryMock.rewardWinners();
        await expect(lotteryMock.runLottery()).to.be.revertedWith("Lottery already has random number or request id pending");
    });

    it("Should prevents non-lottery call requestRandomNumber function", async function () {
        await expect(randomGetter.connect(user1).requestRandomNumber()).to.be.revertedWith("Only lottery can call this function");
    });

    it("Should prevents non-admin withdraw from contract", async function () {
        const adminRole = ethers.constants.HashZero;

        await expect(randomGetter.connect(user1).withdraw(linkToken.address, 1)).to.be.revertedWith(
            "AccessControl: account " + user1.address.toLowerCase() + " is missing role " + adminRole
        );
    });
    
    it("Should correct withdraw specified token from contract", async function () {
        const oldOwnerBalance = await linkToken.balanceOf(owner.address);
        const oneHundredLink = ethers.utils.parseEther("100");
        await randomGetter.withdraw(linkToken.address, oneHundredLink);

        expect(oldOwnerBalance.add(oneHundredLink)).to.be.eq(await linkToken.balanceOf(owner.address));
        expect(await linkToken.balanceOf(randomGetter.address)).to.be.eq(0);
    });

    it("Should support AccessControl and IRandomGetter interfaces", async function () {
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
        expect(await randomGetter.supportsInterface(interfaceIDHex)).to.equal(true);

        let functionSignatureRedemption = [
            'requestIds(address)',
            'randomNumbersByRequestId(uint256)',
            'requestRandomNumber()',
            'getRandomNumber(uint256)',
            'getRandomNumber(address)',
            'withdraw(address,uint256)'
        ];
        let interfaceIDRedemption = BigInt(0);
    
        for (const signature of functionSignatureRedemption) {
            const selector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(2, 10);
            interfaceIDRedemption ^= BigInt('0x' + selector);
        }
    
        const interfaceIDHexRedemption = '0x' + interfaceIDRedemption.toString(16).padStart(8, '0');
        expect(await randomGetter.supportsInterface(interfaceIDHexRedemption)).to.equal(true);
    });
});
