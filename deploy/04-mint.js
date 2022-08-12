const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    //BasicNft
    const basicNft = await ethers.getContract("BasicNFT", deployer)
    const basicMint = await basicNft.mintNft()
    await basicMint.wait(1)
    console.log(`Basic Nft index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    //RandomIPFS Nft
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000) //5mins
        randomIpfsNft.once("NftMinted", async function () {
            resolve()
        })
        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
            value: mintFee,
            // gasLimit: "500000",
        })
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random Nft index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    //Dynamic svg nft
    const highValue = await ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)

    console.log(`Dynamic Nft index 0 has tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
