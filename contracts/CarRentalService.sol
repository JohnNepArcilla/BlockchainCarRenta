// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract CarRentalService {
    // State variables
    address public owner;
    uint public rentalPricePerDay;
    uint public availableCars;

    mapping (address => uint) public customerBalance;
    mapping (address => uint) public rentedCars;

    // Constructor
    constructor(uint _availableCars) payable {
        owner = msg.sender;
        rentalPricePerDay = 1 ether;
        availableCars = _availableCars;
    }

    // Functions
    function getRentalServiceBalance() public view returns (uint _balance) {
        return address(this).balance;
    }

    function restock(uint _quantity) public {
        require(msg.sender == owner, "Only the owner can restock this rental service.");
        availableCars += _quantity;
    }

    function rentCar_Day(uint _days) public payable {
        require(msg.value >= rentalPricePerDay * _days, "Not enough funds.");
        require(availableCars > 0, "No cars available.");
        require(rentedCars[msg.sender] == 0, "You can only rent one car at a time.");

        customerBalance[msg.sender] += msg.value;
        rentedCars[msg.sender] = _days;
        availableCars -= 1;
    }

    function returnCar() public {
        require(rentedCars[msg.sender] > 0, "You haven't rented any cars.");
        
        uint daysRented = rentedCars[msg.sender];
        uint refundAmount = daysRented * rentalPricePerDay;
        
        customerBalance[msg.sender] -= refundAmount;
        rentedCars[msg.sender] = 0;
        availableCars += 1;
        
        payable(msg.sender).transfer(refundAmount);
    }
}
