//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    //mint
    //store our SVG information somewhere
    //some logic to say "show X image" or "show Y image"

    uint256 s_tokenCounter;
    string private i_lowSvgURI;
    string private i_highSvgURI;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) s_tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicSvgNft", "DSN") {
        s_tokenCounter = 0;
        i_lowSvgURI = svgToImageURI(lowSvg);
        i_highSvgURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded)); // concatenation of strings for high perspective
    }

    function mintNft(int256 highValue) public {
        //value that minter sends which is used to determine which NFT is he going to get based on priceFeed
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        emit CreatedNFT(s_tokenCounter, highValue);
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = i_lowSvgURI;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highSvgURI;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                "{'name':'",
                                name(),
                                "', 'description':'An NFT that changes based on the Chainlink Feed',",
                                "'attributes': [{'trait_type':'coolness','value':100}], 'image':'",
                                imageURI,
                                "'}"
                            )
                        )
                    )
                )
            );
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLowSvg() public view returns (string memory) {
        return i_lowSvgURI;
    }

    function getHighSvg() public view returns (string memory) {
        return i_highSvgURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
