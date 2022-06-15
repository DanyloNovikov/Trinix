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
    // Цена за размещение nft;
    uint public listingPrice = 0.025 ether;
    
    // счетчики для колекции токенов
    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;

    // for `validation` that url unic
    mapping(string => bool) private _usedTokenURIs;

    // for assocciation with id nft token and his item
    mapping(uint => NftItem) private _idToNftItem;
    // for quick search token id into array it`s need
    // becase all iterations const money mapping fix it
    // he do not get money when he searching.
    
    // for searching by address user his nft 
    mapping(address => mapping(uint => uint)) private _ownedTokens;
    mapping(uint => uint) private _idToOwnedIndex;
    // Save all tokens ids.
    uint[] private _allNfts;
    mapping(uint => uint) private _idToNftIndex;


    event NftItemCreated (
        uint tokenId,
        uint price,
        address creator,
        bool isListed
    );

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    // return nft by tokenId
    function getNftItem(uint tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    // check count all nft in system
    function listedItemsCount() public view returns (uint) {
        return _listedItems.current();
    }

    // validation tokenURL exist
    function tokenURIExists(string memory tokenURI) public view returns (bool) {
        return _usedTokenURIs[tokenURI] == true;
    }

    // sum all selled nft
    function totalSupply() public view returns (uint) {
        return _allNfts.length;
    }

    // get token from user by Index
    function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint) {
        // check that index from params not more from user colection
        require(index < ERC721.balanceOf(owner), 'Index out of bounds');
        // return token from owner collection
        return _ownedTokens[owner][index];
    }

    // return token from all collection
    function tokenByIndex(uint index) public view returns (uint) {
        require(index < totalSupply(), 'Index out of bounds');
        return _allNfts[index];
    }
    
    
    function getAllNftsOnSale() public view returns (NftItem[] memory) {
        // count all selled nfts
        uint allItemsCounts = totalSupply();
        //    
        uint currentIndex = 0;
        // create array for returned and set Limit by current NFT count;
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

    function burnToken(uint tokenId) public {
        _burn(tokenId);
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
        _setTokenURI(newTokenId, tokenURI);
        _createNftItem(newTokenId, price);
        _usedTokenURIs[tokenURI] = true;

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

    // Iternal overide it`s means we override our function from ERC721
    function _beforeTokenTransfer(address from, address to, uint tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            // если транзакция не прошла то вернет nft в колекцию
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {
            // если address присутствует то отправлят токен в колекцию нового владельца
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    function _removeTokenFromOwnerEnumeration(address from, uint tokenId) private {
        // check count nft from creator
        uint lastTokenIndex = ERC721.balanceOf(from) - 1;
        // get token id from
        uint tokenIndex = _idToOwnedIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _idToOwnedIndex[lastTokenId] = tokenIndex;
        }

        delete _idToOwnedIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllTokensEnumeration(uint tokenId) private {
        // check count nft from creator
        uint lastTokenIndex = _allNfts.length - 1;
        uint tokenIndex = _idToNftIndex[tokenId];
        uint lastTokenId = _allNfts[lastTokenIndex];

        _allNfts[tokenIndex] = lastTokenId;
        _idToNftIndex[lastTokenId] = tokenIndex;

        delete _idToNftIndex[tokenId];
        _allNfts.pop();
    }
}
