import fs from "fs";
import { promisify } from "util";
import { ethers, run } from "hardhat";
import { PromiseOrValue } from "../typechain-types/common";

async function main() {
  const [signer] = await ethers.getSigners();

  const ADMIN = "0x5DC5e7D2B8865B725167EbEC2acF6a9764e29Ee5";
  const DEPLOYER = "0x826006d651b2DB8B8F5bD644F97576b8bb43b0b3";
  const CAMPAIGN_DEPLOYER = "0xe20F668c533717aAe59A34ec6a122eC7311E3329";
  const MINTER = "0x0c5Eb7ad8a175cAe31B3AF598Dc92B11beD0B39A";

  const VRF_WRAPPER = "0x1D3bb92db7659F2062438791F131CFA396dfb592";
  const LINK_TOKEN = "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E";

  const lotteryDeployerLibrary = await (await ethers.getContractFactory("LotteryDeployerLibrary")).deploy();
  await lotteryDeployerLibrary.deployed();
  const redemptionDeployerLibrary = await (await ethers.getContractFactory("RedemptionDeployerLibrary")).deploy();
  await redemptionDeployerLibrary.deployed();
  const organizationDeployerLibrary = await (await ethers.getContractFactory("OrganizationDeployerLibrary")).deploy();
  await organizationDeployerLibrary.deployed();
  const campaignDeployerLibrary = await (await ethers.getContractFactory("CampaignDeployerLibrary")).deploy();
  await campaignDeployerLibrary.deployed();
  const ticketDeployerLibrary = await (await ethers.getContractFactory("TicketDeployerLibrary")).deploy();
  await ticketDeployerLibrary.deployed();

  const libraries = {
    LotteryDeployerLibrary: lotteryDeployerLibrary.address,
    RedemptionDeployerLibrary: redemptionDeployerLibrary.address,
    OrganizationDeployerLibrary: organizationDeployerLibrary.address,
    CampaignDeployerLibrary: campaignDeployerLibrary.address,
    TicketDeployerLibrary: ticketDeployerLibrary.address,
  };

  const RootsyFactory = await ethers.getContractFactory("RootsyFactory", { signer, libraries });
  const RootsyPassport = await ethers.getContractFactory("RootsyPassport", signer);
  const TicketMinterFactory = await ethers.getContractFactory("TicketManager", signer);
  const RandomGetterFactory = await ethers.getContractFactory("RandomGetter", signer);

  async function verifyContract(address: string, constructorArguments: any[]) {
    try {
      await run("verify:verify", {
        address,
        constructorArguments,
      });
    } catch (error) {
      console.error(`Verification failed for ${address}:`, error);
    }
  }

  async function deployRootsyFactory() {
    try {
      const RootsyFactory = await RootsyFactory.deploy(DEPLOYER);
      await RootsyFactory.deployed();
      await verifyContract(RootsyFactory.address, [DEPLOYER]);
      return RootsyFactory.address;
    } catch (error) {
      console.error(error);
      return deployRootsyFactory();
    }
  }

  async function deployTicketMinter(RootsyFactoryAddress: PromiseOrValue<string>) {
    try {
      const ticketMinter = await TicketMinterFactory.deploy(ADMIN, MINTER, RootsyFactoryAddress);
      await ticketMinter.deployed();
      await verifyContract(ticketMinter.address, [ADMIN, MINTER, RootsyFactoryAddress]);
      return ticketMinter.address;
    } catch (error) {
      console.error(error);
      return deployTicketMinter(RootsyFactoryAddress);
    }
  }

  async function deployRootsyPassport(ticketMinterAddress: PromiseOrValue<string>) {
    try {
      const RootsyPassport = await RootsyPassport.deploy(ADMIN, ticketMinterAddress, "Rootsy Passport");
      await RootsyPassport.deployed();
      await verifyContract(RootsyPassport.address, [ADMIN, ticketMinterAddress, "Rootsy Passport"]);
      return RootsyPassport.address;
    } catch (error) {
      console.error(error);
      return deployRootsyPassport(ticketMinterAddress);
    }
  }

  async function deployRandomGetter(RootsyFactoryAddress: PromiseOrValue<string>) {
    try {
      const randomGetter = await RandomGetterFactory.deploy(LINK_TOKEN, VRF_WRAPPER, RootsyFactoryAddress, ADMIN);
      await randomGetter.deployed();
      await verifyContract(randomGetter.address, [LINK_TOKEN, VRF_WRAPPER, RootsyFactoryAddress, ADMIN]);
      return randomGetter.address;
    } catch (error) {
      console.error(error);
      return deployRandomGetter(RootsyFactoryAddress);
    }
  }

  async function deployAll() {
    const RootsyFactoryAddress = await deployRootsyFactory();
    const ticketMinterAddress = await deployTicketMinter(RootsyFactoryAddress);
    const RootsyPassportAddress = await deployRootsyPassport(ticketMinterAddress);
    const randomGetterAddress = await deployRandomGetter(RootsyFactoryAddress);


    const RootsyFactory = await ethers.getContractAt("RootsyFactory", RootsyFactoryAddress);
    const DEPLOYER_ROLE = await RootsyFactory.DEPLOYER_ROLE();
    await RootsyFactory.setMinterContract(ticketMinterAddress);
    await RootsyFactory.setPassportContract(RootsyPassportAddress);
    await RootsyFactory.setRandomGetterContract(randomGetterAddress);
    await RootsyFactory.grantRole(DEPLOYER_ROLE, CAMPAIGN_DEPLOYER);

    const addresses = {
      RootsyFactory: RootsyFactoryAddress,
      RootsyPassport: RootsyPassportAddress,
      ticketMinter: ticketMinterAddress,
      randomGetter: randomGetterAddress,
    };

    const writeFileAsync = promisify(fs.writeFile);
    await writeFileAsync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
  }

  deployAll();
}

main().catch((error) => {
  console.error("or this", error);
});
