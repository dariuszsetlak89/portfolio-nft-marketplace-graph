import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
    ItemListed as ItemListedEvent,
    ItemBought as ItemBoughtEvent,
    ItemCanceled as ItemCanceledEvent,
    ProceedsWithdrawalSuccess as ProceedsWithdrawalEvent
} from "../generated/NftMarketplace/NftMarketplace";
import { ItemListed, ActiveItem, ItemBought, ItemCanceled, ProceedsWithdrawal } from "../generated/schema";

export function handleItemListed(event: ItemListedEvent): void {
    // Get existing graph objects - NFT item listing update
    let itemListed = ItemListed.load(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    let activeItem = ActiveItem.load(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    // Create new graph objects - new NFT item listing
    if (!itemListed) {
        itemListed = new ItemListed(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    }
    if (!activeItem) {
        activeItem = new ActiveItem(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    }
    // Update graph objects parameters
    // Listed item
    itemListed.seller = event.params.seller;
    itemListed.nftAddress = event.params.nftAddress;
    itemListed.tokenId = event.params.tokenId;
    itemListed.price = event.params.price;
    // Active item
    activeItem.seller = event.params.seller;
    activeItem.nftAddress = event.params.nftAddress;
    activeItem.tokenId = event.params.tokenId;
    activeItem.price = event.params.price;

    activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000");

    // Save updated objects to graph protocol
    itemListed.save();
    activeItem.save();
}

export function handleItemBought(event: ItemBoughtEvent): void {
    // Get existing graph objects
    let itemBought = ItemBought.load(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    let activeItem = ActiveItem.load(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    // Create new graph objects
    if (!itemBought) {
        itemBought = new ItemBought(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    }
    // Update graph object parameters
    itemBought.buyer = event.params.buyer;
    itemBought.nftAddress = event.params.nftAddress;
    itemBought.tokenId = event.params.tokenId;
    activeItem!.buyer = event.params.buyer; // new buyer
    // Save updated objects to graph protocol
    itemBought.save();
    activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
    // Get existing graph objects
    let itemCanceled = ItemCanceled.load(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    let activeItem = ActiveItem.load(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    // Create new graph objects
    if (!itemCanceled) {
        itemCanceled = new ItemCanceled(getIdForItemOperations(event.params.tokenId, event.params.nftAddress));
    }
    // Update graph object parameters
    itemCanceled.seller = event.params.seller;
    itemCanceled.nftAddress = event.params.nftAddress;
    itemCanceled.tokenId = event.params.tokenId;
    // Update buyer address
    // 3 options: empty address - item listed, real buyer address - item bought, DEAD address - item canceled
    activeItem!.buyer = Address.fromString(
        "0x000000000000000000000000000000000000dEaD" // 36x0s, DEAD address
    );
    // Save updated objects to graph protocol
    itemCanceled.save();
    activeItem!.save();
}

export function handleProceedsWithdrawal(event: ProceedsWithdrawalEvent): void {
    // Get existing graph object
    let proceedsWithdrawal = ProceedsWithdrawal.load(getIdForWithdrawals(event.params.seller));
    // Create new graph object
    if (!proceedsWithdrawal) {
        proceedsWithdrawal = new ProceedsWithdrawal(getIdForWithdrawals(event.params.seller));
    }
    // Update graph object parameters
    proceedsWithdrawal.seller = event.params.seller;
    proceedsWithdrawal.proceeds = event.params.proceeds;
    // Save updated object to graph protocol
    proceedsWithdrawal.save();
}

// Function to get unique ID of graph objects for NFT item operations
function getIdForItemOperations(tokenId: BigInt, nftAddress: Address): string {
    return tokenId.toHexString() + nftAddress.toHexString();
}

// Function to get unique ID of graph objects for proceeds withdrawals
function getIdForWithdrawals(seller: Address): string {
    return seller.toHexString();
}
