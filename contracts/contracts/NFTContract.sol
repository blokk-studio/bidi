// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

import "./utils/HederaResponseCodes.sol";
import "./utils/IHederaTokenService.sol";
import "./utils/HederaTokenService.sol";
import "./utils/ExpiryHelper.sol";
import "./utils/KeyHelper.sol";

contract NFTContract is ExpiryHelper, HederaTokenService {
    address public owner;

    // Mapping to track authorized minters
    mapping(address => bool) public authorizedMinters;

    // Mapping to track which wallet can claim which NFT serial number
    mapping(int64 => address) public nftClaimRights;
    // Mapping to track if an NFT has been claimed
    mapping(int64 => bool) public claimed;

    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() {
        owner = msg.sender;
        // Make the owner an authorized minter by default
        authorizedMinters[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMinter() {
        require(authorizedMinters[msg.sender], "Only authorized minters can call this function");
        _;
    }

    // Function to add a new minter
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(!authorizedMinters[minter], "Address is already a minter");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }

    // Function to remove a minter
    function removeMinter(address minter) external onlyOwner {
        require(minter != owner, "Cannot remove owner as minter");
        require(authorizedMinters[minter], "Address is not a minter");
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }

    // Function to check if an address is an authorized minter
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account];
    }

    function createNft() external payable onlyOwner returns (address) {
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.HederaToken memory token;
        token.name = "Simple NFT";
        token.symbol = "SNEFT";
        token.memo = "memo";
        token.treasury = address(this);
        token.tokenSupplyType = true;
        token.maxSupply = 4294967295; // max amount?
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = getAutoRenewExpiry(address(this), 7890000);

        (int responseCode, address createdToken) = HederaTokenService.createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Failed to create non-fungible token");
        }
        return createdToken;
    }

    function mintNftForUser(
        address token,
        bytes[] memory metadata,
        address allowedClaimer
    ) external onlyMinter returns (int64) {
        (int response, , int64[] memory serial) = HederaTokenService.mintToken(token, 0, metadata);

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to mint non-fungible token");
        }

        // Assign claim rights to the specified wallet
        nftClaimRights[serial[0]] = allowedClaimer;

        return serial[0];
    }

    function claimNft(
        address token,
        int64 serial
    ) external returns (int) {
        // Check if the caller is the allowed claimer for this NFT
        require(nftClaimRights[serial] == msg.sender, "You are not authorized to claim this NFT");
        // Check if the NFT hasn't been claimed yet
        require(!claimed[serial], "NFT has already been claimed");

        int response = HederaTokenService.transferNFT(token, address(this), msg.sender, serial);

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to transfer non-fungible token");
        }

        // Mark the NFT as claimed
        claimed[serial] = true;

        return response;
    }

    // View functions to check NFT status
    function getClaimerAddress(int64 serial) external view returns (address) {
        return nftClaimRights[serial];
    }

    function isNftClaimed(int64 serial) external view returns (bool) {
        return claimed[serial];
    }
}