// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftMarket is ERC721URIStorage {
    using Counters for Counters.Counter;

    struct NftItem {
        uint tokenId;
        uint price;
        address creator;
        bool isListed;
    }

    uint public listingPrice = 0.025 ether;
    
    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;

    mapping(string => bool) private _usedTokenURIs;
    mapping(uint => NftItem) private _idToNftItem;
    // for quick search token id into array it`s need
    // becase all iterations const money mapping fix it
    // he do not get money when he searching.
    mapping(uint => uint) private _idToNftIndex;
    mapping(address => mapping(uint => uint)) private _ownedTokens;
    mapping(uint => uint) private _idToOwnedIndex;
    // Save all tokens ids.
    uint[] private _allNfts;

    event NftItemCreated (
        uint tokenId,
        uint price,
        address creator,
        bool isListed
    );

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    function getNftItem(uint tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    function listedItemsCount() public view returns (uint) {
        return _listedItems.current();
    }

    function tokenURIExists(string memory tokenURI) public view returns (bool) {
        return _usedTokenURIs[tokenURI] == true;
    }

    function totalSupply() public view returns (uint) {
        return _allNfts.length;
    }

    function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint) {
        require(index < ERC721.balanceOf(owner), 'Index out of bounds');
        return _ownedTokens[owner][index];
    }

    function tokenByIndex(uint index) public view returns (uint) {
        require(index < totalSupply(), 'Index out of bounds');
        return _allNfts[index];
    }

    function getAllNftsOnSale() public view returns (NftItem[] memory) {
        uint allItemsCounts = totalSupply();
        uint currentIndex = 0;

        NftItem[] memory items = new NftItem[](_listedItems.current());

        for (uint i = 0; i < allItemsCounts; i++) {
            uint tokenId = tokenByIndex(i);
            NftItem storage item = _idToNftItem[tokenId];

            if (item.isListed == true) {
                items[currentIndex] = item;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getOwnedNfts() public view returns (NftItem[] memory) {
        uint ownedItemsCount = ERC721.balanceOf(msg.sender);
        NftItem[] memory items = new NftItem[](ownedItemsCount);

        for (uint i = 0; i < ownedItemsCount; i++) {
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            NftItem storage item = _idToNftItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    // tokenURI we will save our nft link to db(piniata)
    function mintToken(string memory tokenURI, uint price) public payable returns(uint) {
        require(!tokenURIExists(tokenURI), 'Token URI already exists');
        require(msg.value == listingPrice, 'Price must be equal to listing price');
        // this function need for increment new position to new token
        // and his data
        _tokenIds.increment();
        _listedItems.increment();

        // new incremented token id;
        uint newTokenId = _tokenIds.current();

        // safe user how create new token like association
        _safeMint(msg.sender, newTokenId);
        _setTokenURI((newTokenId), tokenURI);
        _usedTokenURIs[tokenURI] = true;
        _createNftItem(newTokenId, price);

        return newTokenId; 
    }

    function buyNft(uint tokenId) public payable {
        uint price = _idToNftItem[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(msg.sender != owner, 'You already own this NFT');
        require(msg.value == price, "Please submit the asking price");

        _idToNftItem[tokenId].isListed = false;
        _listedItems.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    function _createNftItem(uint tokenId, uint price) private {
        require(price > 0, 'Price must be at least 1 wei');

        _idToNftItem[tokenId] = NftItem(
            tokenId,
            price,
            msg.sender,
            true
        );

        emit NftItemCreated(tokenId, price, msg.sender, true);
    }

    // Iternal overide it`s means we override our function from ERC721
    function _beforeTokenTransfer(address from, address to, uint tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        }

        if (from == address(0)) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    function _addTokenToAllTokensEnumeration(uint tokenId) private {
        _idToNftIndex[tokenId] = _allNfts.length;
        _allNfts.push(tokenId); 
    }

    function _addTokenToOwnerEnumeration(address to, uint tokenId) private {
        // its special function from the librare ERC721 ho check how many into user account
        uint length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _idToOwnedIndex[tokenId] = length;
    }
}
