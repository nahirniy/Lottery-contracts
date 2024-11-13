# Karrot

## Overview

### What is Karrot?

This is a project that allows various organizations to unite and create lotteries together. Each organization can conduct its own campaigns, which are eligible to participate in the lottery. Organizations can pool their campaigns to participate in the lottery.

To enter the lottery, participants need tickets, which they can obtain from each campaign. Tickets may be earned by completing specific actions, i.e. email registering or inviting friends etc. If a campaign is entered into the lottery, all its tickets automatically become eligible for participation. Tickets belong to their respective campaigns, and campaigns belong to their respective organizations.

Before the lottery begins, participants can redeem their tickets for a fixed reward. Once the lottery runs, winners receive their rewards directly into their wallets.

## ERC-7401

The Karrot project is built on the NFT standard, ERC-7401. The core concept behind ERC-7401 is the ability for one NFT to own another NFT. While conventional ownership involves user accounts or smart contracts holding NFTs, ERC-7401 introduces the innovative notion of "nesting" non-fungibles within each other.

### The key features are:
- Each "parent" NFT can contain multiple "child" NFTs.
- A child NFT can function as a parent and hold additional NFTs.
- The account owner governing the parent NFT has control over all its "children".
- Nesting one NFT within another is achieved through a specialized transaction.
- Separating a child NFT from its parent requires the account owner's approval on a designated transaction.
- A child token is transferable to a different wallet, another parent NFT, "unnested", abandoned, or rejected.
- Account owners can option to auto-accept incoming children, with a risk of potential spamming, or reject them.
- Regular ERC-721 contracts lack interoperability with ERC-7401 collections, preventing the nesting of existing NFTs.

### How do we use ERC-7401 standard in Karrot?
We use a 4-level NFT system:

0. Passport
1. Organization
2. Campaign
3. Ticket

Each EOA (user) can have only one NFT of the zero level (passport). As mentioned, each "parent" NFT can contain multiple "child" NFTs. Therefore, the passport owns the organization, the organization owns the campaigns, and the campaigns own the tickets. Accounts with the minter role can mint multiple campaigns to their organization. Similarly, accounts with the minter role can mint multiple tickets for each campaign.

## Smart contracts

### KarrotFactory
The KarrotFactory contract serves as a factory for deploying various contracts related to the Karrot platform, such as organizations, campaigns, lotteries, redemptions, and tickets. It manages the deployment process and keeps track of deployed contracts.

### KarrotPassport
The KarrotPassport is the main contract in the our NFT system which is deployed once. It allows minting new tokens for specific address and ensures each address can own only one passport token. Only the owners of this token can create and mint organizations. 

### KarrotOrganization
The KarrotOrganization contract handles the creation and ownership of organization tokens in Karrot. It allows minting new tokens for specific parent passport and ensures each parent can own only one organization token.

### KarrotCampaign
The KarrotCampaign contract manages the creation and ownership of campaign tokens within the Karrot platform. It allows minting campaign tokens for specific organizations, setting ticket contracts, burning tickets, and retrieving campaign-related information.

### KarrotTicket
The KarrotTicket contract manages the minting and burning of tokens within the Karrot platform. It allows minting tokens to specific campaigns, burning the last minted token, and retrieving contract-related information.

### TicketManager
TicketManager eases the minting and transfering process. This contract manages the creation and transfer of tickets for campaigns on the Karrot platform, ensuring that tickets are minted and transferred for users within specified campaigns.

### Lottery
The Lottery contract runs a lottery system for the Karrot platform, handling ticket registration, lottery initialization, winner selection, and reward distribution based on preset tiers — jackpot, random, and fixed. Winners are selected from registered tickets and they receive rewards in their wallets. The lottery also provides information retrieval functions for tickets, organizations, and tier configurations.

### TicketRedemption
TicketRedemption enables users to exchange tickets for rewards on Karrot. It manages reward token addresses, handles ticket redemption, and controls redemption prices and caps.

### RandomGetter
RandomGetter gets random numbers for lotteries. It interacts with Chainlink VRF to provide random values for lotteries. The RandomGetter contract must have enough LINK tokens, as a LINK token is required for obtaining a random number. One RandomGetter contract is used for all lotteries, avoiding the need to send LINK tokens to the balance of each contract separately.

## Lottery

Running a lottery consists of several steps in order: deploy, set up the lottery, register tickets, initialization of organization, run the lottery and reward winners.

### Features:
- The lottery can be run only once, which means the lottery contract cannot be reused. This approach ensures that the ticket and the campaign associated with the lottery will be inactive after the lottery run.
- The lottery contract must have enough tokens that will be used to reward the winners.
- The lottery has three main timestamps. The first is the mint deadline, which marks the point until which tickets can be minted. The second is the burn deadline, by which tickets can be burned for a fixed reward using the TicketRedemption contract. The third is the lottery time, after which the lottery can be run among registered tickets.

### Deploy:
The lottery contract can be deployed only through the KarrotFactory contract, otherwise the lottery will be out of the system and unable to accept participants. Deploying a new lottery contract requires specifying the admin, mint deadline, burn deadline and lottery time.

### Setup:
After deployment and ticket registration, the lottery must be set up. The lottery setup requires specifying parameters such as the reward token, tiers, and organization shares. 
- The reward tokens are used as reward for winners.
- The lottery has three types of tiers: jackpot, random, and fixed. 
- The main differences between tiers:
  - For the jackpot and random tiers, winners are chosen randomly from all registered tickets, independent of organization shares. The jackpot tier can have only one winner, while the random tier can have multiple winners. The fixed tier also has multiple winners chosen randomly, but the part of winners for each organization depends on its shares. It is worth noting that a lottery can have many tiers of the same type apart from the jackpot tier.
  - Organization shares determine the part of winners for each organization within the fixed tier. For example, if there are 10 winners in the fixed tier and the first organization has 80 shares while the second organization has 20 shares (the total shares must always equal 100), the first organization will have 8 winners, and the second organization will have 2 winners. 

### Register tickets: 
The KarrotFactory automatically registers tickets for the lottery when deploying ticket contracts. Registration of lottery tickets is also possible only with the required role - REGISTRAR_ROLE. 

### Initialization:
Initialization can be run when the lottery setup and burn deadline is finished. It is important to initialize the lottery after the burn deadline, since the number of tickets cannot be changed. During lottery initialization, the total number of tickets for each organization is determined. If the lottery has many organizations, initialization can be reverted due to the block gas limit. In order to solve this problem, the lottery provides the option to initialize organizations in parts (in several transactions).

### Run:
The lottery can be run only after full initialization, meaning all organizations must be initialized and the lottery time reached. It's worth noting that running the lottery doesn't include selecting winners or distributing rewards. During the lottery run, a request is made to the Chainlink VRF for a random number. Later, winners are selected based on this random number.

### Reward:
Winners can be selected only after the lottery has been run. Winners are selected using a specific algorithm that relies on a random number generated by the Chainlink VRF to ensure randomness. Once winners are determined, they receive their rewards to their wallets. It's worth noting that rewards for all tiers can be reverted due to the block gas limit. In order to solve this problem, the lottery provides the option to distribute rewards for tiers in parts (in several transactions).

## Redemption tickets

All ticket holders have the option to burn their ticket for a fixed reward until the burn deadline.

Before redeeming, the admin should set the necessary parameters, including the reward token, ticket redemption price, and maximum redemption cap. After this cap is reached, the redemption process stops.

It is worth noting that to redeem a ticket, the TicketRedemption contract must be approved by owner of the passport that owns organization, which associated with the campaign to which the ticket belongs. Only these owners can redeem their tickets.

After redeeming the tickets, the owner receives a fixed reward on the wallet.

During redemption, the tickets are burned as part of the process.

### Ticket burning mechanism:
- The burning ticket is transferred to the owner (campaign) of the ticket with the last ID.
- The ticket with the last ID is transferred to the owner (campaign) of the burning ticket.
- After the swap, the ticket with the last ID is burned.

This approach ensures that the numbering of tickets remains uninterrupted. As a result of this process, the user's ticket ID(s) may change, but this is expected behavior and does not affect the chance of winning the lottery.

For example: 
- user1 holds a ticket with ID 7, while user2 holds the last ticket with ID 100. 
- If user1 decides to burn their ticket with ID 7, the ID of the ticket owned by user2 changes to 7 (100 -> 7), while the ID of the ticket owned by user1 changes to 100 (7 -> 100). 
- Only after these exchanges, the last ticket with ID 100 owned by user1 is burned. 

As a result of this operation: 
- The last ticket ID equals 99.
- User1 doesn't have any tickets.
- User2 has a ticket with ID 7.

## Mint organizations, campaigns and tickets tokens

It's important to understand the features of the ERC7401 standard. When a child's NFT is minted to the parent's NFT, these children are initially stored as pending. This means that the child NFT cannot be directly assigned to the parent NFT right away. Therefore, the parent NFT must accept the child NFT after the minting process.

### Method 1: Manual Minting
1. **Organization:** First, create an organization token and assign it to a specified parent passport, ensuring the passport does not already own an organization token.
2. **Campaign:** Next, mint a campaign token and assign it to the specific organization, ensuring the organization does not already have this campaign token assigned. The organization then accepts the campaign token as a child.
3. **Ticket:** Then, mint a ticket and assign it to the specified campaign. The campaign accepts the ticket as a child.

### Method 2: Automated Minting and Transfering with TicketManager
The TicketManager contract automates the minting and transfering of tickets and accepting campaign children. It can also mint campaigns to organizations and organizations to passports. It is worth noting that if the user doesn't have the required passport, organization or campaign token, TicketManager will mint it for them. To mint or transfer tickets requires specifying the address of the user, the address of the campaign, and the number of tickets.

## Deploy contracts

All contracts must be deployed through the KarrotFactory contract (apart from RandomGetter and TicketManager, which are service contracts and KarrotPassport that is the main in the our NFT system. These contracts must be deployed once at the start of the project) otherwise, they will be excluded from the system and unable to participate in the lottery, be accepted as children, etc. It's important to note that only accounts with the DEPLOYER_ROLE, assigned during the deployment of the KarrotFactory, can perform deployments.

### Organization, Campaign and Ticket:
To deploy an organization, campaign and tickets, there are three options available:
1. Deploy only organization contract.
2. Deploy organization and campaigns contracts.
3. Deploy campaign and ticket contracts.

**First option** requires specifying the admin address and the organization's name.

**Second option** requires specifying the admin address, the organization's name, the address of the corresponding lottery, and an array of campaign names.

**The third option** requires specifying the admin address, the campaign name, the address of the associated lottery, and the organization address.

### Lottery and Redemption:
To deploy a lottery and redemption, requires specifying admin address, mint deadline (for ticket minting), burn deadline (for ticket burning), and lottery time (to run the lottery).

## Contracts

- [KarrotFactory.sol](./contracts/KarrotFactory.sol)
- [KarrotPassport.sol](./contracts/KarrotPassport.sol)
- [KarrotOrganization.sol](./contracts/KarrotOrganization.sol)
- [KarrotCampaign.sol](./contracts/KarrotCampaign.sol)
- [KarrotTicket.sol](./contracts/KarrotTicket.sol)
- [TicketManager.sol](./contracts/TicketManager.sol)
- [Lottery.sol](./contracts/Lottery.sol)
- [TicketRedemption.sol](./contracts/TicketRedemption.sol)
- [RandomGetter.sol](./contracts/RandomGetter.sol)
