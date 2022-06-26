const NftMarket = artifacts.require('NftMarket');
const { ethers } = require('ethers');

contract('NftMarket', accounts => {
    let _contract = null;
    let _nftPrice = ethers.utils.parseEther('0.3').toString();
    let _listingPrice = ethers.utils.parseEther('0.025').toString();
    let _totalBalance = ethers.utils.parseEther('0.075').toString();


    before(async () => {
        _contract = await NftMarket.deployed();
    });

    describe('Mint token', () => {
        const tokenURI = 'https://test.com/first-token'
        before(async () => {
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0],
                value: _listingPrice
            });
        });

        it('Owner of the first token should be address[0]', async () => {
            const owner = await _contract.ownerOf(1);
            assert.equal(owner, accounts[0], 'Owner of token is not mathing address[0]');
        });

        it('First token should point to the current tokenURL', async () => {
            const actualTokenURI = await _contract.tokenURI(1);
            assert.equal(actualTokenURI, tokenURI, 'tokenURI is not correctly set');
        });

        it('should not be possible to create a NFT with used TokenURI', async () => {
            try {
                await _contract.mintToken(tokenURI, _nftPrice, {
                    from: accounts[0],
                    value: _listingPrice
                });
            } catch (error) {
                assert(error, 'NFT was minted with previously used tokenURI');
            };
        });

        it('should have one listed item', async () => {
            const listedItem = await _contract.listedItemsCount();
            assert.equal(listedItem.toNumber(), 1, 'Listed items count is not 1');
        });

        it('should have create NFT item', async () => {
            const nftItem = await _contract.getNftItem(1);
            // how is look our nft;
            // console.log(nftItem)
            assert.equal(nftItem.tokenId, 1, 'Token id is not 1');
            assert.equal(nftItem.price, _nftPrice, 'Price is not correct');
            assert.equal(nftItem.creator, accounts[0], 'Creator is not accounts[0]');
            assert.equal(nftItem.isListed, true, 'IsListed is not true');
        });
    });

    describe("Buy NFT token", () => {
        before(async () => {
            await _contract.buyNft(1, {
                from: accounts[1],
                value: _nftPrice
            });
        });

        it('Should unlist the item', async () => {
            const listedItem = await _contract.getNftItem(1);
            assert.equal(listedItem.isListed, false, 'Item is still listed');
        });

        it('Should descrease listed items count', async () => {
            const listedItemsCount = await _contract.listedItemsCount();
            assert.equal(listedItemsCount.toNumber(), 0, 'Count has not been decrement');
        });

        it('Should change the owner', async () => {
            const currentNftOwner = await _contract.ownerOf(1);
            assert.equal(currentNftOwner, accounts[1], 'Item is still listed');
        });
    });

    describe("Token transfers ", () => {
        const tokenURI = 'https://test.com/second-token'
        before(async () => {
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0],
                value: _listingPrice
            });
        });

        it('Should have two NFTs created', async () => {
            const totalSupply  = await _contract.totalSupply();
            assert.equal(totalSupply.toNumber(), 2, 'Total supply of token is not correct');
        });

        it('Should be able to retreive nft by index', async () => {
            const firstNftId  = await _contract.tokenByIndex(0);
            const secondNftId  = await _contract.tokenByIndex(1);
            assert.equal(firstNftId.toNumber(), 1, 'Nft id is wrong');
            assert.equal(secondNftId.toNumber(), 2, 'Nft id is wrong');
        });

        it('Should have one listed NFT', async () => {
            const allNfts = await _contract.getAllNftsOnSale();
            assert.equal(allNfts[0].tokenId, 2, 'Nft has wrong id');
        });

        it("account[1] should have one owned NFT", async () => {
            const ownedNfts = await _contract.getOwnedNfts({from: accounts[1]});
            assert.equal(ownedNfts[0].tokenId, 1, "Nft has a wrong id");
        });

        it("account[0] should have one owned NFT", async () => {
            const ownedNfts = await _contract.getOwnedNfts({from: accounts[0]});
            assert.equal(ownedNfts[0].tokenId, 2, "Nft has a wrong id");
        });
    });

    describe('Token transfer to new owener', async () => {
        before(async () => {
            await _contract.transferFrom(accounts[0], accounts[1], 2);
        });

        it('Account[0] should own 0 tokens', async () => {
            const ownedNfts = await _contract.getOwnedNfts({from: accounts[0]});
            assert.equal(ownedNfts.length, 0, 'Invalid length of tokens');
        });

        it('Account[1] should own 2 tokens', async () => {
            const ownedNfts = await _contract.getOwnedNfts({from: accounts[1]});
            assert.equal(ownedNfts.length, 2, 'Invalid length of tokens');
        });
    });

    describe('List an NFT', async () => {
        before(async () => {
            await _contract.placeNftOnSale(1, _nftPrice, { from: accounts[1], value: _listingPrice } );
        });

        it('Account[1] should have owned 2 NFTs', async () => {
            const ownedNfts = await _contract.getAllNftsOnSale();
            assert.equal(ownedNfts.length, 2, 'Invalid length of nfts');
        });

        it('Account[1] should have owned 2 NFTs', async () => {
            const ownedNfts = await _contract.getOwnedNfts({from: accounts[1]});
            assert.equal(ownedNfts[0].isListed, true, 'Invalid length of tokens');
        });
    });

    describe('Admin/Owner options', async () => {
        it('Try set new Price be not owner', async () => {
            try {
                await _contract.setListingPrice({from: accounts[1]});
            } catch (error) {
                assert(true, error);
            }
        });

        it('Only contract owner can change ListPrice', async () => {
            await _contract.setListingPrice(_listingPrice, {from: accounts[0]});
            const listingPrice = await _contract.listingPrice();
            assert.equal(listingPrice.toString(), _listingPrice, 'Invalid change price');
        });

        it('Try get total palance how account[1]', async () => {
            try {
                await _contract.getTotalBalance({from: accounts[1]});
            } catch (error) {
                assert(true, error);
            }
        });

        it('Only contract owner can see totalBalance', async () => {
            const totalBalance = await _contract.getTotalBalance({from: accounts[0]});
            assert.equal(totalBalance.toString(), _totalBalance, 'Invalid change price');
        });

        it('!owner try get money from contract', async () => {
            try {
                await _contract.getMoneyFromPlatform(_listingPrice, {from: accounts[1],});
            } catch (error) {
                assert(true, error);
            }
        });

        it('owner try get money from contract', async () => {
            const oldCountEtherContract = await _contract.getTotalBalance({from: accounts[0]});
            await _contract.getMoneyFromPlatform(  _listingPrice, {from: accounts[0]});
            const newCountEtherContarct = await  _contract.getTotalBalance({from: accounts[0]});

            assert.equal(newCountEtherContarct, oldCountEtherContract - _listingPrice , 'error geting money');
        });
    });
});
