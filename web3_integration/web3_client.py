from web3 import Web3
from typing import Dict, Optional
import json

class Web3Client:
    def _init_(self, rpc_url: str = "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.uniswap_v3_router = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
        
    def get_balance(self, address: str) -> Dict[str, float]:
        """Get ETH balance for address"""
        try:
            balance_wei = self.w3.eth.get_balance(address)
            balance_eth = self.w3.from_wei(balance_wei, 'ether')
            return {
                "eth": float(balance_eth),
                "wei": balance_wei,
                "address": address
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_token_balance(self, address: str, token_address: str) -> Dict[str, float]:
        """Get ERC20 token balance"""
        # ERC20 ABI for balanceOf
        erc20_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        try:
            contract = self.w3.eth.contract(address=token_address, abi=erc20_abi)
            balance = contract.functions.balanceOf(address).call()
            return {"balance": balance, "token_address": token_address}
        except Exception as e:
            return {"error": str(e)}
    
    def estimate_gas(self, transaction: Dict) -> Dict[str, int]:
        """Estimate gas for transaction"""
        try:
            gas_estimate = self.w3.eth.estimate_gas(transaction)
            gas_price = self.w3.eth.gas_price
            return {
                "gas_estimate": gas_estimate,
                "gas_price": gas_price,
                "total_cost_wei": gas_estimate * gas_price,
                "total_cost_eth": self.w3.from_wei(gas_estimate * gas_price, 'ether')
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_transaction_history(self, address: str, limit: int = 10) -> List[Dict]:
        """Get recent transactions for address"""
        # This would typically use an API like Etherscan
        # For demo purposes, returning mock data
        return [
            {
                "hash": "0x123...",
                "from": address,
                "to": "0x456...",
                "value": "1000000000000000000",  # 1 ETH in wei
                "gas": "21000",
                "timestamp": "2024-01-01"
            }
        ]

