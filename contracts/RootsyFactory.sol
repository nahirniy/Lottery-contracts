// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {RootsyOrganization} from "./RootsyOrganization.sol";
import {RootsyCampaign} from "./RootsyCampaign.sol";
import {Lottery} from "./Lottery.sol";
import {TicketRedemption} from "./TicketRedemption.sol";
import {RootsyTicket} from "./RootsyTicket.sol";

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ILottery} from "./interface/ILottery.sol";
import {IRootsyFactory} from "./interface/IRootsyFactory.sol";
import {IRootsyPassport} from "./interface/IRootsyPassport.sol";
import {IRootsyCampaign} from "./interface/IRootsyCampaign.sol";
import {ITicketManager} from "./interface/ITicketManager.sol";
import {ITicketRedemption} from "./interface/ITicketRedemption.sol";
import {IRandomGetter} from "./interface/IRandomGetter.sol";

import {LotteryDeployerLibrary} from "./libraries/LotteryDeployerLibrary.sol";
import {RedemptionDeployerLibrary} from "./libraries/RedemptionDeployerLibrary.sol";
import {OrganizationDeployerLibrary} from "./libraries/OrganizationDeployerLibrary.sol";
import {CampaignDeployerLibrary} from "./libraries/CampaignDeployerLibrary.sol";
import {TicketDeployerLibrary} from "./libraries/TicketDeployerLibrary.sol";

/**
 * @title RootsyFactory contract
 * @notice The RootsyFactory contract serves as a factory for various contracts 
 * such as organizations, campaigns, lotteries, redemption and tickets.
 * @dev RootsyFactory manages the deployment process and keeps track of deployed contracts.
*/
contract RootsyFactory is AccessControl, IRootsyFactory {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Сonstant that contains the DEPLOYER role. Owner of this role can deploy contracts.
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER");
    /// @notice Address of the minterContract that can mint passport, organization, campaigns and tickets. Expected to be the TicketManager contract.
    address public minterContract;
    /// @notice Address of the randomGetterContract providing random numbers. Expected to be the RandomGetter contract.
    address public randomGetterContract;
    /// @inheritdoc IRootsyFactory
    address public passportContract;    

    /// @notice Stores addresses of active organizations.
    EnumerableSet.AddressSet private activeOrganizations;

    /// @notice Stores addresses of deployed lottery contracts.
    address[] public lotteries;
    /// @notice Stores addresses of deployed redemption contracts.
    address[] public redemptions;
    /// @notice Stores addresses of deployed organization contracts.
    address[] public organizations;
    /// @notice Stores addresses of deployed campaign contracts.
    address[] public campaigns;
    /// @notice Stores addresses of deployed ticket contracts.
    address[] public tickets;

    /// @inheritdoc IRootsyFactory
    mapping(address => bool) public isOrganization;
    /// @inheritdoc IRootsyFactory
    mapping(address => bool) public isLottery;
    /// @inheritdoc IRootsyFactory
    mapping(address => address) public campaignOrganization;
    /// @inheritdoc IRootsyFactory
    mapping(address => address) public ticketsCampaign;

    /// @notice The modifier checks whether the RootsyPassport contract is set when the function is called.
    modifier withSetupPassportContract() {
        if (passportContract == address(0)) revert IncorrectCondition("Passport contract not set");
        _;
    }

    /// @notice The modifier checks whether the TicketMinter contract is set when the function is called.
    modifier withSetupMinterContract() {
        if (minterContract == address(0)) revert IncorrectCondition("Minter contract not set");
        _;
    }

    /// @notice The modifier checks whether the randomGetter contract is set when the function is called.
    modifier withSetupRandomGetterContract() {
        if (randomGetterContract == address(0)) revert IncorrectCondition("RandomGetter contract not set");
        _;
    }

    /**
     * @notice Constructor function to initialize the RootsyFactory contract.
     * @param _deployer The address of the deployer role.
     */
    constructor(address _deployer) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEPLOYER_ROLE, _deployer);
    }

    /// @inheritdoc IRootsyFactory
    function disableOrganization(
        address organization
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!activeOrganizations.contains(organization)) revert IncorrectValue("Non Rootsy organization or organization is already disabled");
        activeOrganizations.remove(organization);

        emit DisabledOrganization(organization);
    }

    /// @inheritdoc IRootsyFactory
    function enableOrganization(
        address organization
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (activeOrganizations.contains(organization)) revert IncorrectValue("Organization is already enabled");
        activeOrganizations.add(organization);

        emit EnableOrganization(organization);
    }

    /// @inheritdoc IRootsyFactory
    function setMinterContract(
        address _minterContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (
            !ITicketManager(_minterContract).supportsInterface(
                type(ITicketManager).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }
        minterContract = _minterContract;
        
        emit MinterContractUpdated(_minterContract);
    }

    /// @inheritdoc IRootsyFactory
    function setRandomGetterContract(
        address _randomGetterContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (
            !IRandomGetter(_randomGetterContract).supportsInterface(
                type(IRandomGetter).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }
        randomGetterContract = _randomGetterContract;
        
        emit RandomGetterContractUpdated(_randomGetterContract);
    }

    /// @inheritdoc IRootsyFactory
    function setPassportContract(
        address _passportContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (
            !IRootsyPassport(_passportContract).supportsInterface(
                type(IRootsyPassport).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }
        if (passportContract != address(0)) revert IncorrectCondition("Passport contract is already set");
        passportContract = _passportContract;
        
        emit PassportContractSet(_passportContract);
    }

    /// @inheritdoc IRootsyFactory
    function deployLotteryAndRedemptionContract(
        address defaultAdmin,
        uint32 mintDeadline,
        uint32 burnDeadline,
        uint32 lotteryTime
    ) public withSetupRandomGetterContract onlyRole(DEPLOYER_ROLE) returns (address deployedLottery, address deployedRedemption) {
    
            deployedLottery = _deployLotteryContract(
                defaultAdmin,
                mintDeadline,
                burnDeadline,
                lotteryTime
            );
            deployedRedemption = _deployRedemptionContract(defaultAdmin, deployedLottery);

            emit LotteryContractDeployed(deployedLottery);
            emit RedemptionContractDeployed(deployedRedemption);
    }

    /// @inheritdoc IRootsyFactory
    function deployOrganizationContract(
        address defaultAdmin,
        string memory organizationName
    ) public withSetupMinterContract withSetupPassportContract onlyRole(DEPLOYER_ROLE) returns (address deployedOrganization) {
        deployedOrganization = _deployOrganizationContract(defaultAdmin, organizationName);
        emit OrganizationContractDeployed(deployedOrganization);
    }

    /// @inheritdoc IRootsyFactory
    function deployCampaignAndTicketContract(
        address defaultAdmin,
        address lottery,
        address redemption,
        address organization,
        string memory campaignName
    ) public withSetupMinterContract onlyRole(DEPLOYER_ROLE) returns (address deplyedCampaign, address deployedTicket) {
        (deplyedCampaign,  deployedTicket) =_deployCampaignAndTicketContract(defaultAdmin, lottery, redemption, organization, campaignName);
        emit CampaignContractDeployed(deplyedCampaign, organization);
        emit TicketContractDeployed(deployedTicket, deplyedCampaign);
    }

    /// @inheritdoc IRootsyFactory
    function deployOrganizationAndCampaigns(
        address defaultAdmin,
        address lottery,
        address redemption,
        string memory organizationName,
        string[] memory campaignNames
    ) external withSetupMinterContract withSetupPassportContract onlyRole(DEPLOYER_ROLE) returns(
        address deployedOrganization,
        address[] memory deployedCampaigns,
        address[] memory deployedTickets
    ) {
        deployedOrganization = _deployOrganizationContract(
            defaultAdmin,
            organizationName
        );
        deployedCampaigns = new address[](campaignNames.length);
        deployedTickets = new address[](campaignNames.length);
        for (uint256 i = 0; i < campaignNames.length; i++) {
            (address deployedCampaign, address deployedTicket) = _deployCampaignAndTicketContract(
                defaultAdmin,
                lottery,
                redemption,
                deployedOrganization,
                campaignNames[i]
            );
            emit CampaignContractDeployed(deployedCampaign, deployedOrganization);
            emit TicketContractDeployed(deployedTicket, deployedCampaign);

            deployedCampaigns[i] = deployedCampaign;
            deployedTickets[i] = deployedTicket;
        }
        emit OrganizationContractDeployed(deployedOrganization);

    }

    /// @inheritdoc IRootsyFactory
    function getAllLotteries() external view returns (address[] memory) {
        return lotteries;
    }

    /// @inheritdoc IRootsyFactory
    function getAllRedemptions() external view returns (address[] memory) {
        return redemptions;
    }

    /// @inheritdoc IRootsyFactory
    function getAllOrganizations() external view returns (address[] memory) {
        return organizations;
    }

    /// @inheritdoc IRootsyFactory
    function getAllCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    /// @inheritdoc IRootsyFactory
    function getAllTickets() external view returns (address[] memory) {
        return tickets;
    }

    /// @inheritdoc IRootsyFactory
    function getLotteriesCount() external view returns (uint256) {
        return lotteries.length;
    }

    /// @inheritdoc IRootsyFactory
    function getRedemptionsCount() external view returns (uint256) {
        return redemptions.length;
    }

    /// @inheritdoc IRootsyFactory
    function getOrganizationsCount() external view returns (uint256) {
        return organizations.length;
    }

    /// @inheritdoc IRootsyFactory
    function getCampaignsCount() external view returns (uint256) {
        return campaigns.length;
    }

    /// @inheritdoc IRootsyFactory
    function getTicketsCount() external view returns (uint256) {
        return tickets.length;
    }

    /**
     * @notice Deploys a new organization contract.
     * @param defaultAdmin The address of the admin for the contract.
     * @param _organizationName The name of the organization.
     * @return newOrganization The address of the newly deployed organization contract.
     */
    function _deployOrganizationContract(
        address defaultAdmin,
        string memory _organizationName
    ) private returns (address) {
        address newOrganization = OrganizationDeployerLibrary.deployOrganizationContract(
            defaultAdmin,
            minterContract,
            passportContract,
            organizations.length,
            _organizationName
        );
        activeOrganizations.add(newOrganization);
        organizations.push(newOrganization);
        isOrganization[newOrganization] = true;
        return newOrganization;
    }

    /**
     * @notice Deploys a new campaign and ticket contract.
     * @param defaultAdmin The address of the admin for the contracts.
     * @param lottery The address of the lottery contract.
     * @param redemption The address of the redemption contract that can burn ticket.
     * @param organization The address of organization contract to that tickets belong to.
     * @param campaignName The name of the campaign.
     * @return deployedCampaign The address of the newly deployed campaign contract.
     * @return deployedTicket The address of the newly deployed ticket contract.
     */
    function _deployCampaignAndTicketContract(
        address defaultAdmin,
        address lottery,
        address redemption,
        address organization,
        string memory campaignName
    ) private returns (address deployedCampaign, address deployedTicket) {
        if (!isOrganization[organization]) revert IncorrectValue("Not valid organization contract");
        if (!activeOrganizations.contains(organization)) revert IncorrectValue("Organization is disabled");
        if (!isLottery[lottery]) revert IncorrectValue("Not valid lottery contract");
        if (ITicketRedemption(redemption).lottery() != lottery) revert IncorrectValue("Redemption isn't associated with lottery");
        if (ILottery(lottery).mintDeadline() < block.timestamp) revert IncorrectCondition("Mint deadline is in the past");
        if (bytes(campaignName).length == 0) revert IncorrectValue("Campaign name is empty");

        deployedCampaign = CampaignDeployerLibrary.deployCampaignContract(
                defaultAdmin,
                address(this),
                minterContract,
                campaigns.length,
                lottery,
                redemption,
                organization,
                campaignName
        );
        campaigns.push(deployedCampaign);
        campaignOrganization[deployedCampaign] = organization;


        deployedTicket = _deployTicketContract(
            defaultAdmin,
            deployedCampaign,
            campaignName
        );
        IRootsyCampaign(deployedCampaign).setTicketContract(deployedTicket);
        ILottery(lottery).registerTicketContract(deployedTicket);
    }

    /**
     * @notice Deploys a new lottery contract.
     * @param _defaultAdmin The address of the admin for the contract.
     * @param _mintDeadline The deadline for ticket minting.
     * @param _burnDeadline The deadline for ticket burning.
     * @param _lotteryTime The time when the lottery will be conducted.
     * @return newLottery The address of the newly deployed lottery contract.
     * @dev Reverts if _mintDeadline is greater than _burnDeadline,
     *  _burnDeadline is greater than _lotteryTime,
     *  _mintDeadline is greater than _lotteryTime.
     */
    function _deployLotteryContract(
        address _defaultAdmin,
        uint32 _mintDeadline,
        uint32 _burnDeadline,
        uint32 _lotteryTime
    ) private returns (address) {

        address newLottery = LotteryDeployerLibrary.deployLotteryContract(
            _defaultAdmin, 
            address(this),
            randomGetterContract,
            lotteries.length, 
            _mintDeadline, 
            _burnDeadline, 
            _lotteryTime
        );
        
        lotteries.push(newLottery);
        isLottery[newLottery] = true;
        return newLottery;
    }

    /**
     * @notice Deploys a new redemption contract.
     * @param _defaultAdmin The address of the admin for the contract.
     * @param _lottery The address of the associated lottery contract.
     * @return newRedemption The address of the newly deployed redemption contract.
     */
    function _deployRedemptionContract(
        address _defaultAdmin,
        address _lottery
    ) private returns (address) {

        address newRedemption = RedemptionDeployerLibrary.deployRedemtionContract(
            _defaultAdmin,
            _lottery,
            redemptions.length
        );

        redemptions.push(newRedemption);
        return newRedemption;
    }

    /**
     * @notice Deploys a new ticket contract.
     * @param _defaultAdmin The address of the admin for the contract.
     * @param _campaign The address of the associated campaign contract.
     * @param _campaignName The name of the campaign.
     * @return newTicket The address of the newly deployed ticket contract.
     */
    function _deployTicketContract(
        address _defaultAdmin,
        address _campaign,
        string memory _campaignName
    ) private returns (address) {

        address newTicket = TicketDeployerLibrary.deployTicket(
            _defaultAdmin,
            minterContract,
            tickets.length,
            _campaign,
            _campaignName
        );

        tickets.push(newTicket);
        ticketsCampaign[newTicket] = _campaign;
        return newTicket;
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(AccessControl, IERC165)
        returns (bool)
    {
        return 
            type(IRootsyFactory).interfaceId == interfaceId ||
            super.supportsInterface(interfaceId);
    }
}