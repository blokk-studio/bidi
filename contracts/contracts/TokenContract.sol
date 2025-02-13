// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

import './utils/HederaResponseCodes.sol';
import './utils/IHederaTokenService.sol';
import './utils/HederaTokenService.sol';
import './utils/ExpiryHelper.sol';
import './utils/IERC20.sol';

/**
 * @title TokenCreator
 * @dev A contract for creating and managing fungible tokens on the Hedera network with built-in fee mechanisms
 * and collateral backing. This contract allows for token creation, minting, unwrapping, and fee collection.
 */
contract TokenCreator is ExpiryHelper, HederaTokenService {
    address private _tokenAddress;
    address private _collateralTokenAddress;
    address private _owner;
    address private _feeRecipient;
    uint256 private _lockedCollateral;

    event COLLATERAL_TOKEN_SET(address collateralToken);
    event FEES_COLLECTED(address indexed recipient, int64 amount);
    event FEE_RECIPIENT_UPDATED(address indexed oldRecipient, address indexed newRecipient);
    event TOKEN_CREATED(address indexed tokenAddress, string name, string symbol);
    event TOKEN_MINTED(address indexed receiver, int64 amount);
    event TOKEN_UNWRAPPED(address indexed sender, int64 amount);

    /**
     * @dev Constructor sets the contract owner and initial fee recipient as the deployer
     */
    constructor() {
        _owner = msg.sender;
        _feeRecipient = msg.sender;
    }

    /**
     * @dev Modifier to restrict function access to contract owner only
     */
    modifier onlyOwner() {
        require(msg.sender == _owner, "Caller is not the owner");
        _;
    }

    /**
     * @dev Creates a new fungible token with predefined parameters
     * @return createdTokenAddress The address of the newly created token
     * @notice Creates a token named "Bidi" with symbol "BIDI"
     * @notice Sets up a 1% fractional fee with min/max limits
     * @notice Contract maintains supply and fee management permissions
     */
    function createFungible() external payable returns (address createdTokenAddress) {

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
            revert("Token creation failed");
        }

        _tokenAddress = tokenAddress;

        emit TOKEN_CREATED(tokenAddress, "Bidi", "BIDI");
        return tokenAddress;
    }

    /**
     * @dev Retrieves current contract state information
     * @return tokenAddress Address of the created token
     * @return collateralTokenAddress Address of the collateral token
     * @return owner Address of the contract owner
     * @return feeRecipient Address where fees are sent
     * @return lockedCollateral Amount of collateral currently locked in contract
     */
    function getContractInfo() external view returns (
        address tokenAddress,
        address collateralTokenAddress,
        address owner,
        address feeRecipient,
        uint256 lockedCollateral
    ) {
        return (
            _tokenAddress,
            _collateralTokenAddress,
            _owner,
            _feeRecipient,
            _lockedCollateral
        );
    }

    /**
     * @dev Sets the collateral token address and associates it with this contract
     * @param token Address of the collateral token
     * @return responseCode Response code from the Hedera Token Service
     */
    function setCollateralToken(address token) external returns (int) {
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
        require(newFeeRecipient != address(0), "New fee recipient is zero address");
        require(newFeeRecipient != _feeRecipient, "New fee recipient is same as current");

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
        if (transfer != HederaResponseCodes.SUCCESS) revert("Collateral coin transfer failed");
        _lockedCollateral += uint256(uint64(amount));

        (int responseCode,,) = HederaTokenService.mintToken(
            _tokenAddress,
            uint64(amount),
            new bytes[](0)
        );
        if (responseCode != HederaResponseCodes.SUCCESS) revert("Mint failed");

        int transferMinted = HederaTokenService.transferToken(
            _tokenAddress,
            address(this),
            receiver,
            amount
        );
        if (transferMinted != HederaResponseCodes.SUCCESS) revert("Final transfer to wallet failed");
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
        if (transferBidi != HederaResponseCodes.SUCCESS) revert("BIDI token transfer failed");

        (int burnResponse,) = HederaTokenService.burnToken(
            _tokenAddress,
            uint64(amount),
            new int64[](0)
        );
        if (burnResponse != HederaResponseCodes.SUCCESS) revert("Burn failed");

        int transferCollateral = HederaTokenService.transferToken(
            _collateralTokenAddress,
            address(this),
            msg.sender,
            amount
        );
        if (transferCollateral != HederaResponseCodes.SUCCESS) revert("Collateral return failed");

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
        require(
            msg.sender == _owner || msg.sender == _feeRecipient,
            "Caller is not owner or fee recipient"
        );

        uint256 rawBalance = IERC20(_tokenAddress).balanceOf(address(this));
        require(rawBalance <= uint64(type(int64).max), "Balance too large for int64");
        int64 balance = int64(uint64(rawBalance));
        require(balance > 0, "No fees to collect");

        int response = HederaTokenService.transferToken(
            _tokenAddress,
            address(this),
            _feeRecipient,
            balance
        );

        require(response == HederaResponseCodes.SUCCESS, "Fee transfer failed");
        emit FEES_COLLECTED(_feeRecipient, balance);
    }
}