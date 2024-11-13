# Short list of Backend and Frontend functions

This is a list of the most used functions for frontend and backend developers. A detailed description of each function can be found in another file.

## RootsyFactory

- [ticketsCampaign](./interface/IRootsyFactory.md#ticketscampaign)
- [campaignOrganization](./interface/IRootsyFactory.md#campaignorganization)
- [getAllLotteries](./RootsyFactory.md#getalllotteries)
- [getAllRedemptions](./RootsyFactory.md#getallredemptions)
- [getAllOrganizations](./RootsyFactory.md#getallorganizations)
- [getAllCampaigns](./RootsyFactory.md#getallcampaigns)
- [getAllTickets](./RootsyFactory.md#getalltickets)

## RootsyPassport

- [ownerToken](./interface/IRootsyPassport.md#ownertoken)
- [ownerOf](./RootsyPassport.md#ownerof)

## RootsyOrganization

- [ownerToken](./interface/IRootsyOrganization.md#ownertoken)
- [ownerOf](./RootsyOrganization.md#ownerof)

## RootsyCampaign

- [ownerToken](./interface/IRootsyCampaign.md#ownertoken)
- [ownerOf](./RootsyCampaign.md#ownerof)
- [getLotteryContract](./RootsyCampaign.md#getlotterycontract)
- [getUserCampaignId](./RootsyCampaign.md#getusercampaignid)

## RootsyTicket

- [getLotteryContract](./RootsyTicket.md#getlotterycontract)
- [ownerOf](./RootsyTicket.md#ownerof)
- [getOrganisation](./RootsyTicket.md#getorganisation)
- [getUserTicketIds](./RootsyTicket.md#getuserticketids)

## TicketManager

- [mintTicketsBatch](./TicketManager.md#mintticketsbatch)
- [mintTickets](./TicketManager.md#minttickets)
- [transferTicketsBatch](./TicketManager.md#transferticketsbatch)
- [transferTickets](./TicketManager.md#transfertickets)

## Lottery

- [mintDeadline](./interface/ILottery.md#mintdeadline)
- [burnDeadline](./interface/ILottery.md#burndeadline)
- [lotteryTime](./interface/ILottery.md#lotterytime)
- [isRegisteredTicket](./interface/ILottery.md#isregisteredticket)
- [isOrganizationAdded](./interface/ILottery.md#isorganizationadded)
- [organizationTicketsContracts](./interface/ILottery.md#organizationticketscontracts)
- [winnerAmount](./interface/ILottery.md#winneramount)
- [tierWinners](./interface/ILottery.md#tierwinners)
- [getLotteryTicketId](./Lottery.md#getLotteryTicketId)
- [getAllTiers](./Lottery.md#getalltiers)
- [getAllOrganizations](./Lottery.md#getallorganizations)
- [getOrganizationTicketsContracts](./Lottery.md#getorganizationticketscontracts)
- [getOrganizationSharesForFixedTiers](./Lottery.md#getorganizationsharesforfixedtiers)
- [getAllCampaignTickets](./Lottery.md#getallcampaigntickets)


## TicketRedemption

- [redeem](./TicketRedemption.md#redeem)