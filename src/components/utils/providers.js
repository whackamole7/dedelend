import { ethers } from 'ethers';

export const netProvider = new ethers.getDefaultProvider('https://arb-mainnet.g.alchemy.com/v2/5ZdGJb2c1DWObl73ERVIL3PTUl6UCMRA');


export const mmProvider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : undefined;

export const signer = mmProvider?.getSigner()