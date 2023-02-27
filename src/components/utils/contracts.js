import { ethers } from 'ethers';
import { signer } from './providers.js'

import _Pool from "../../deployments/arbitrum_ddl/pool.json";
import _USDC from "../../deployments/arbitrum_ddl/USDC.json";
import _Vault from "../../deployments/arbitrum_ddl/vault.json";
import _WETH from "../../deployments/arbitrum_ddl/WETH.json";

export const Pool = new ethers.Contract(_Pool.address, _Pool.abi, signer);
export const USDC = new ethers.Contract(_USDC.address, _USDC.abi, signer);

export const Vault = new ethers.Contract(_Vault.address, _Vault.abi, signer);
export const WETH_address = _WETH.address;
