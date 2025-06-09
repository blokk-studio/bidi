// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ExpiryHelper} from './utils/ExpiryHelper.sol';
import {HederaResponseCodes} from './utils/HederaResponseCodes.sol';
import {HederaTokenService} from './utils/HederaTokenService.sol';
import {IERC20} from './utils/IERC20.sol';
import {IHederaTokenService} from './utils/IHederaTokenService.sol';

error ZeroAddressFeeRecipient();
error SameFeeRecipient(address currentRecipient);
error CollateralTransferFailed(int responseCode);
error MintFailed(int responseCode);
error FinalTransferFailed(int responseCode);
error TokenCreationFailed(int responseCode);
error BidiTransferFailed(int responseCode);
error BurnFailed(int responseCode);
error CollateralReturnFailed(int responseCode);
error NotAuthorized(address sender, address owner, address feeRecipient);
error NoFeesToCollect();
error FeeTransferFailed(int responseCode);
error BalanceTooLarge(uint256 balance, uint256 maxAllowed);
error NoWrongfullySentTokensToRecover();


/**
 * @title TokenCreator
 * @dev A contract for creating and managing fungible tokens on the Hedera network with built-in fee mechanisms
 * and collateral backing. This contract allows for token creation, minting, unwrapping, and fee collection.
 */
contract TokenCreator is ExpiryHelper, HederaTokenService, Ownable {
    address private _tokenAddress;
    address private _collateralTokenAddress;
    address private _feeRecipient;
    uint256 private _lockedCollateral;

    event COLLATERAL_TOKEN_SET(address collateralToken);
    event FEES_COLLECTED(address indexed recipient, int64 amount);
    event FEE_RECIPIENT_UPDATED(address indexed oldRecipient, address indexed newRecipient);
    event TOKEN_CREATED(address indexed tokenAddress, string name, string symbol);
    event TOKEN_MINTED(address indexed receiver, int64 amount);
    event TOKEN_UNWRAPPED(address indexed sender, int64 amount);
    event EMERGENCY_TOKEN_RECOVERY(address indexed tokenAddress, address indexed recipient, int64 amount);

    /**
     * @dev Constructor sets the contract owner and initial fee recipient as the deployer
     */
    constructor() Ownable(msg.sender) {
        _feeRecipient = msg.sender;
    }

    /**
     * @dev Creates a new fungible token with predefined parameters
     * @return createdTokenAddress The address of the newly created token
     * @notice Creates a token named "Bidi" with symbol "BIDI"
     * @notice Sets up a 1% fractional fee with min/max limits
     * @notice Contract maintains supply and fee management permissions
     */
    function createFungible() onlyOwner external payable returns (address createdTokenAddress) {

        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](2);
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));
        keys[1] = getSingleKey(KeyType.FEE, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.FixedFee[] memory fixedFees = new IHederaTokenService.FixedFee[](0);
        IHederaTokenService.FractionalFee[] memory fractionalFees = new IHederaTokenService.FractionalFee[](1);
        fractionalFees[0] = IHederaTokenService.FractionalFee(
            1,
            100,
            100000,
            1000000,
            false,
            address(this)
        );

        IHederaTokenService.HederaToken memory token;
        token.name = "Bidi";
        token.symbol = "BIDI";
        token.treasury = address(this);
        token.tokenKeys = keys;
        token.expiry = getAutoRenewExpiry(address(this), 7890000);

        (int responseCode, address tokenAddress) = HederaTokenService.createFungibleTokenWithCustomFees(
            token,
            0,
            8,
            fixedFees,
            fractionalFees
        );

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert TokenCreationFailed(responseCode);
        }

        _tokenAddress = tokenAddress;

        emit TOKEN_CREATED(tokenAddress, "Bidi", "BIDI");
        return tokenAddress;
    }

    /**
     * @dev Retrieves current contract state information
     * @return tokenAddress Address of the created token
     * @return collateralTokenAddress Address of the collateral token
     * @return contractOwner Address of the contract owner
     * @return feeRecipient Address where fees are sent
     * @return lockedCollateral Amount of collateral currently locked in contract
     */
    function getContractInfo() external view returns (
        address tokenAddress,
        address collateralTokenAddress,
        address contractOwner,
        address feeRecipient,
        uint256 lockedCollateral
    ) {
        return (
            _tokenAddress,
            _collateralTokenAddress,
            owner(),
            _feeRecipient,
            _lockedCollateral
        );
    }

    /**
     * @dev Returns the address of the created token
     */
    function getTokenAddress() public view returns (address) {
        return _tokenAddress;
    }

    /**
     * @dev Returns the address of the collateral token
     */
    function getCollateralTokenAddress() public view returns (address) {
        return _collateralTokenAddress;
    }

    /**
     * @dev Returns the contract owner address
     */
    function getContractOwner() public view returns (address) {
        return owner();
    }

    /**
     * @dev Returns the fee recipient address
     */
    function getFeeRecipient() public view returns (address) {
        return _feeRecipient;
    }

    /**
     * @dev Returns the amount of locked collateral
     */
    function getLockedCollateral() public view returns (uint256) {
        return _lockedCollateral;
    }

    /**
     * @dev Sets the collateral token address and associates it with this contract
     * @param token Address of the collateral token
     * @return responseCode Response code from the Hedera Token Service
     */
    function setCollateralToken(address token) onlyOwner external returns (int) {
        int256 responseCode = HederaTokenService.associateToken(address(this), token);
        _collateralTokenAddress = token;

        emit COLLATERAL_TOKEN_SET(token);
        return responseCode;
    }

    /**
     * @dev Updates the fee recipient address
     * @param newFeeRecipient Address of the new fee recipient
     * @notice Only callable by contract owner
     * @notice Cannot set to zero address or current fee recipient
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        if (newFeeRecipient == address(0)) revert ZeroAddressFeeRecipient();
        if (newFeeRecipient == _feeRecipient) revert SameFeeRecipient(_feeRecipient);

        address oldFeeRecipient = _feeRecipient;
        _feeRecipient = newFeeRecipient;

        emit FEE_RECIPIENT_UPDATED(oldFeeRecipient, newFeeRecipient);
    }

    /**
     * @dev Mints new tokens to a specified address with collateral backing
     * @param receiver Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     * @notice Requires collateral token transfer from owner
     * @notice Only callable by contract owner
     */
    function mintTo(address receiver, int64 amount) onlyOwner external {
        int transfer = HederaTokenService.transferToken(
            _collateralTokenAddress,
            msg.sender,
            address(this),
            amount
        );
        if (transfer != HederaResponseCodes.SUCCESS) revert CollateralTransferFailed(transfer);
        _lockedCollateral += uint256(uint64(amount));

        (int responseCode,,) = HederaTokenService.mintToken(
            _tokenAddress,
            uint64(amount),
            new bytes[](0)
        );
        if (responseCode != HederaResponseCodes.SUCCESS) revert MintFailed(responseCode);

        int transferMinted = HederaTokenService.transferToken(
            _tokenAddress,
            address(this),
            receiver,
            amount
        );
        if (transferMinted != HederaResponseCodes.SUCCESS) revert FinalTransferFailed(transferMinted);
        emit TOKEN_MINTED(receiver, amount);
    }

    /**
     * @dev Unwraps tokens back to collateral
     * @param amount Amount of tokens to unwrap
     * @notice Burns the wrapped tokens and returns equivalent collateral to sender
     * @notice Updates locked collateral tracking
     */
    function unwrapToken(int64 amount) external {
        int transferBidi = HederaTokenService.transferToken(
            _tokenAddress,
            msg.sender,
            address(this),
            amount
        );
        if (transferBidi != HederaResponseCodes.SUCCESS) revert BidiTransferFailed(transferBidi);

        (int burnResponse,) = HederaTokenService.burnToken(
            _tokenAddress,
            uint64(amount),
            new int64[](0)
        );
        if (burnResponse != HederaResponseCodes.SUCCESS) revert BurnFailed(burnResponse);

        int transferCollateral = HederaTokenService.transferToken(
            _collateralTokenAddress,
            address(this),
            msg.sender,
            amount
        );
        if (transferCollateral != HederaResponseCodes.SUCCESS) revert CollateralReturnFailed(transferCollateral);

        _lockedCollateral -= uint256(uint64(amount));
        emit TOKEN_UNWRAPPED(msg.sender, amount);
    }

    /**
     * @dev Collects accumulated fees from the contract
     * @notice Only callable by owner or fee recipient
     * @notice Transfers all available balance to fee recipient
     * @notice Reverts if no fees are available to collect
     */
    function collectFees() external {
        if (msg.sender != owner() && msg.sender != _feeRecipient) {
            revert NotAuthorized(msg.sender, owner(), _feeRecipient);
        }

        uint256 rawBalance = IERC20(_tokenAddress).balanceOf(address(this));
        if (rawBalance > uint64(type(int64).max)) revert BalanceTooLarge(rawBalance, uint64(type(int64).max));
        int64 balance = int64(uint64(rawBalance));
        if (balance <= 0) revert NoFeesToCollect();

        int response = HederaTokenService.transferToken(
            _tokenAddress,
            address(this),
            _feeRecipient,
            balance
        );

        if (response != HederaResponseCodes.SUCCESS) revert FeeTransferFailed(response);
        emit FEES_COLLECTED(_feeRecipient, balance);
    }

    /**
     * @dev Emergency function to recover any wrongly sent tokens to the contract
     * @param tokenAddress Address of the token to recover
     * @param recipient Address to send the recovered tokens to
     * @notice Only callable by contract owner
     * @notice Cannot recover collateral tokens that are backing minted tokens
     * @notice Cannot recover main token fees (use collectFees instead)
     */
    function emergencyTokenRecovery(address tokenAddress, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddressFeeRecipient();

        uint256 rawBalance = IERC20(tokenAddress).balanceOf(address(this));
        if (rawBalance == 0) revert NoWrongfullySentTokensToRecover();

        if (tokenAddress == _tokenAddress) {
            revert NoWrongfullySentTokensToRecover();
        }

        uint256 transferAmount = rawBalance;
        if (tokenAddress == _collateralTokenAddress) {
            if (rawBalance <= _lockedCollateral) {
                revert NoWrongfullySentTokensToRecover();
            }
            transferAmount = rawBalance - _lockedCollateral;
        }

        if (transferAmount > uint64(type(int64).max)) {
            revert BalanceTooLarge(transferAmount, uint64(type(int64).max));
        }

        int64 amount = int64(uint64(transferAmount));

        int response = HederaTokenService.transferToken(
            tokenAddress,
            address(this),
            recipient,
            amount
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert FeeTransferFailed(response);
        }

        emit EMERGENCY_TOKEN_RECOVERY(tokenAddress, recipient, amount);
    }
}