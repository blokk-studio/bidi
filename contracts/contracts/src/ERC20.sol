// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Bidi is ERC20, Ownable, ERC20Permit {
    using SafeERC20 for IERC20;

    // Fee configuration using basis points (bps)
    uint256 public feeBasisPoints;
    address public feeRecipient;
    uint256 public constant MAX_FEE_BASIS_POINTS = 10000;
    uint256 private constant BASIS_POINTS_DENOMINATOR = 10000;

    // Collateral configuration
    IERC20 public collateralToken; // HCHF
    uint256 public lockedCollateral; // Amount of HCHF token locked

    // Events
    event FeeUpdated(uint256 oldFeeBasisPoints, uint256 newFeeBasisPoints);
    event FeeRecipientUpdated(address oldFeeRecipient, address newFeeRecipient);
    event CollateralTokenSet(address oldToken, address newToken);
    event CollateralLocked(address depositor, uint256 amount);
    event TokensMinted(address receiver, uint256 amount);
    event TokensUnwrapped(address unwrapper, uint256 amount); // New event for unwrapping

    /**
     * @dev Constructor that sets up the BIDI token and its collateral
     * @param initialOwner The address that will own and control the contract
     * @param _collateralToken The address of the stablecoin to be used as collateral
     */
    constructor(address initialOwner, address _collateralToken)
        ERC20("Bidi", "BIDI")
        Ownable(initialOwner)
        ERC20Permit("Bidi")
    {
        feeBasisPoints = 100; // 1%
        feeRecipient = initialOwner;
        collateralToken = IERC20(_collateralToken);
    }

    /**
     * @dev Allows owner to change the collateral token address
     * @param newCollateralToken The new collateral token address
     */
    function setCollateralToken(address newCollateralToken) external onlyOwner {
        require(lockedCollateral == 0, "Cannot change while collateral is locked");
        require(newCollateralToken != address(0), "Invalid token address");
        
        address oldToken = address(collateralToken);
        collateralToken = IERC20(newCollateralToken);
        
        emit CollateralTokenSet(oldToken, newCollateralToken);
    }

    /**
     * @dev Sets the fee percentage for transfers
     * @param newFeeBasisPoints The new fee in basis points (100 = 1.00%)
     */
    function setFee(uint256 newFeeBasisPoints) external onlyOwner {
        require(newFeeBasisPoints <= MAX_FEE_BASIS_POINTS, "Fee exceeds maximum");
        
        uint256 oldFeeBasisPoints = feeBasisPoints;
        feeBasisPoints = newFeeBasisPoints;
        
        emit FeeUpdated(oldFeeBasisPoints, newFeeBasisPoints);
    }

    /**
     * @dev Sets the fee recipient address
     * @param newFeeRecipient The address that will receive the fees
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Fee recipient cannot be zero address");
        
        address oldFeeRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientUpdated(oldFeeRecipient, newFeeRecipient);
    }

    /**
     * @dev Deposits collateral and mints BIDI tokens
     * @param collateralAmount Amount of collateral token to deposit
     * @param addressTo Address to receive the minted BIDI tokens
     * NOTE: Caller must first approve this contract to spend their collateral tokens
     */
    function mintWithCollateral(address addressTo, uint256 collateralAmount) external onlyOwner {
        require(collateralAmount > 0, "Amount must be greater than 0");
        require(addressTo != address(0), "Invalid receiver");

        // Transfer collateral from owner to contract
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        // Update locked collateral amount
        lockedCollateral += collateralAmount;
        
        // Mint equivalent amount of BIDI tokens (1:1 ratio)
        _mint(addressTo, collateralAmount);
        
        emit CollateralLocked(msg.sender, collateralAmount);
        emit TokensMinted(addressTo, collateralAmount);
    }

    /**
     * @dev Unwraps BIDI tokens back to collateral tokens
     * @param amount Amount of BIDI tokens to unwrap
     * NOTE: This function will burn BIDI tokens and return collateral tokens to the caller
     */
    function unwrap(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient BIDI balance");
        
        // Burn BIDI tokens first
        _burn(msg.sender, amount);
        
        // Update locked collateral amount
        lockedCollateral -= amount;
        
        // Transfer collateral tokens back to the user
        collateralToken.safeTransfer(msg.sender, amount);
        
        emit TokensUnwrapped(msg.sender, amount);
    }

    /**
     * @dev Returns the current fee configuration
     * @return currentFeeBasisPoints The current fee in basis points (100 = 1.00%)
     * @return currentFeeRecipient The current fee recipient address
     */
    function getFeeInfo() external view returns (uint256 currentFeeBasisPoints, address currentFeeRecipient) {
        return (feeBasisPoints, feeRecipient);
    }

    /**
     * @dev Returns collateral information
     * @return token The collateral token address
     * @return locked The amount of collateral locked
     * @return supply The total supply of BIDI tokens
     */
    function getCollateralInfo() external view returns (
        address token,
        uint256 locked,
        uint256 supply
    ) {
        return (address(collateralToken), lockedCollateral, totalSupply());
    }

    /**
     * @dev Overrides the transfer function to include fee splitting (except for owner)
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");

        // If sender is owner, no fee is taken
        if (msg.sender == owner()) {
            return super.transfer(to, amount);
        }

        // For all other transfers, apply fee
        uint256 feeAmount = (amount * feeBasisPoints) / BASIS_POINTS_DENOMINATOR;
        uint256 transferAmount = amount - feeAmount;

        // Transfer fee to fee recipient
        if (feeAmount > 0) {
            super.transfer(feeRecipient, feeAmount);
        }

        // Transfer remaining amount to recipient
        return super.transfer(to, transferAmount);
    }

    /**
     * @dev Overrides the transferFrom function to include fee splitting (except for owner)
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");

        // If the token owner is the contract owner, no fee is taken
        if (from == owner()) {
            return super.transferFrom(from, to, amount);
        }

        // For all other transfers, apply fee
        uint256 feeAmount = (amount * feeBasisPoints) / BASIS_POINTS_DENOMINATOR;
        uint256 transferAmount = amount - feeAmount;

        // Transfer fee to fee recipient
        if (feeAmount > 0) {
            super.transferFrom(from, feeRecipient, feeAmount);
        }

        // Transfer remaining amount to recipient
        return super.transferFrom(from, to, transferAmount);
    }

    /**
     * @dev Emergency function to rescue any ERC20 tokens accidentally sent to this contract
     * @param tokenAddress The address of the token to rescue
     * @param to The address that will receive the tokens
     * @param amount The amount of tokens to rescue
     * NOTE: Cannot be used to rescue locked collateral
     */
    function rescueERC20(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "Cannot rescue to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        // If rescuing collateral token, ensure we maintain backing
        if (tokenAddress == address(collateralToken)) {
            uint256 excess = IERC20(tokenAddress).balanceOf(address(this)) - lockedCollateral;
            require(amount <= excess, "Cannot rescue locked collateral");
        }

        IERC20(tokenAddress).safeTransfer(to, amount);
    }
}