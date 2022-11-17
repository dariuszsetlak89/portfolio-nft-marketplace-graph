import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
    ItemListed as ItemListedEvent,
    ItemBought as ItemBoughtEvent,
    ItemCanceled as ItemCanceledEvent
} from "../generated/NftMarketplace/NftMarketplace";
import { ItemListed, ActiveItem, ItemBought, ItemCanceled } from "../generated/schema";

export function handleItemListed(event: ItemListedEvent): void {
    // Get existing graph objects - NFT item listing update
    let itemListed = ItemListed.load(createId(event.params.tokenId, event.params.nftAddress));
    let activeItem = ActiveItem.load(createId(event.params.tokenId, event.params.nftAddress));
    // Create new graph objects - new NFT item listing
    if (!itemListed) {
        itemListed = new ItemListed(createId(event.params.tokenId, event.params.nftAddress));
    }
    if (!activeItem) {
        activeItem = new ActiveItem(createId(event.params.tokenId, event.params.nftAddress));
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
    let itemBought = ItemBought.load(createId(event.params.tokenId, event.params.nftAddress));
    let activeItem = ActiveItem.load(createId(event.params.tokenId, event.params.nftAddress));
    // Create new graph objects
    if (!itemBought) {
        itemBought = new ItemBought(createId(event.params.tokenId, event.params.nftAddress));
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
    let itemCanceled = ItemCanceled.load(createId(event.params.tokenId, event.params.nftAddress));
    let activeItem = ActiveItem.load(createId(event.params.tokenId, event.params.nftAddress));
    // Create new graph objects
    if (!itemCanceled) {
        itemCanceled = new ItemCanceled(createId(event.params.tokenId, event.params.nftAddress));
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

// Function to create unique ID of graph objects for NFT item operations
function createId(tokenId: BigInt, nftAddress: Address): string {
    return tokenId.toHexString() + nftAddress.toHexString();
}
