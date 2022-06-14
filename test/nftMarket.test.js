const NftMarket = artifacts.require('NftMarket');
const { ethers } = require('ethers');

contract('NftMarket', accounts => {
    let _contract = null;
    let _nftPrice = ethers.utils.parseEther('0.3').toString();
    let _listingPrice = ethers.utils.parseEther('0.025').toString();

    before(async () => {
        _contract = await NftMarket.deployed();
    });

    describe('Mint token', () => {
        const tokenURI = 'https://test.com/currect-token'
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
});