const config = require("../config.json");
const fetch = require("node-fetch");
const { Headers } = fetch;

// == Mints an NFT with given parameters using CrossMint API ==
async function mint(data) {
    const reqHeader = new Headers();
    reqHeader.append("x-client-secret", config.CrossMintAPIKey);
    reqHeader.append("x-project-id", config.CrossMintProjectID);
    reqHeader.append("Content-Type", "application/json");

    // handle email vs web3 wallet. 
    // should make a function to *cleanly* handle parsing this on both mint command and here - due to time issues this was not done.
    var recipient;
    if (data.nft_deliveryMethod == 'email') {
        recipient = data.nft_deliveryMethod + ":" + data.nft_recipient + ":" + data.nft_network;
    }
    else {
        recipient = data.nft_network + ":" + data.nft_recipient
    }

    const reqBody = JSON.stringify({
        "mainnet": false,
        "metadata": {
            "name": data.nft_name,
            "image": data.nft_image,
            "description": data.nft_description
        },
        "recipient": recipient
    });

    var requestOptions = {
        method: 'POST',
        headers: reqHeader,
        body: reqBody,
        redirect: 'follow'
    };

    let mint_result;
    await fetch(`${config.CrossMintAPIEndpoint}nfts`, requestOptions)
        .then(response => response.json())
        .then(result => mint_result = result)
        .catch(error => console.log('error', error));
    return mint_result;
}

// == Checks the status of a mint against CrossMint API ==
async function checkStatus(mintingID) {
    const reqHeader = new Headers();
    reqHeader.append("x-client-secret", config.CrossMintAPIKey);
    reqHeader.append("x-project-id", config.CrossMintProjectID);

    const requestOptions = {
        method: 'GET',
        headers: reqHeader,
        redirect: 'follow'
    };

    let check_result;
    await fetch(`${config.CrossMintAPIEndpoint}requests/${mintingID}/status`, requestOptions)
        .then(response => response.json())
        .then(result => check_result = result)
        .catch(error => console.log('error', error));
    return check_result;
}

module.exports = { mint, checkStatus };