const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Unit test for Random Ipfs Nft", function () {
          let randomIpfsNft, vrfCoordinatorV2Mock, deployer
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["randomipfs", "mocks"])
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
          })
          it("constructor", async () => {
              let tokenUriFirst = await randomIpfsNft.getDogTokenUris(0)
              assert(tokenUriFirst.includes("ipfs://"))
          })
          it("check if requesting Nft fails if payment isn't sent", async function () {
              expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                  "RandomIpfsNft__NeedMoreEthSent"
              )
          })
          it("check if requesting Nft is successfull", async function () {
              const mintFee = await randomIpfsNft.getMintFee()
              let txResponse = await randomIpfsNft.requestNft({
                  value: mintFee,
              })
              expect(
                  randomIpfsNft.requestNft({
                      value: mintFee.toString(),
                  })
              ).to.emit("NftRequested")
          })

          it("check if fulfillRandomWords work", async function () {
              await new Promise(async (resolve, reject) => {
                  randomIpfsNft.once("NftMinted", async () => {
                      try {
                          const tokenUri = await randomIpfsNft.tokenURI("0")
                          const tokenCounter = await randomIpfsNft.getTokenCounter()
                          assert.equal(tokenUri.toString().includes("ipfs://"), true)
                          assert.equal(tokenCounter.toString(), "1")
                          resolve()
                      } catch (error) {
                          console.log(e)
                          reject(e)
                      }
                  })
                  try {
                      const mintFee = await randomIpfsNft.getMintFee()
                      const txResponse = await randomIpfsNft.requestNft({
                          value: mintFee.toString(),
                      })
                      const txReceipt = await txResponse.wait(1)
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          randomIpfsNft.address
                      )
                  } catch (error) {
                      console.log(error)
                      reject()
                  }
              })
          })
      })
