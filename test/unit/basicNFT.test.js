const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Testing Basic NFT", function () {
          let basicNft, deployer
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["basicnft"])
              basicNft = await ethers.getContract("BasicNFT")
          })

          it("Deploying NFT contract", async function () {
              tokenCount = 0
              assert.equal(await basicNft.getTokenCounter(), tokenCount)
          })
          it("Allows users to mint an NFT, and updates appropriately", async function () {
              txResponse = await basicNft.mintNft()
              console.log(txResponse)
              await txResponse.wait(1)
              const tokenURI = await basicNft.tokenURI(0)
              const tokenCounter = await basicNft.getTokenCounter()

              assert.equal(tokenCounter.toString(), "1")
              assert.equal(tokenURI, await basicNft.TOKEN_URI())
          })
      })
