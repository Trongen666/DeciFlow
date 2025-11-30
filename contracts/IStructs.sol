// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStructs {
    enum ProductCategory { DryGoods, Perishable, Hazmat, Bulk, RawMaterial, WIP, FinishedGood, MRO, Packaging }
    enum ProductStatus { Created, InTransit, Stored, Delivered, Consumed, Spoiled }

    struct ProductParams {
        string name;
        string serialNumber;
        string batchNumber;
        ProductCategory category;
        uint256 quantity;
        uint256 unitCost;
        uint256 expiryDate;
        bool requiresTemperatureControl;
        int256 minTemperature;
        int256 maxTemperature;
    }
}
