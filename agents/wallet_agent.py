from web3_integration.web3_client import Web3Client
from shared.schema import AgentResponse, AgentType
from typing import Dict, Any

class WalletAgent:
    def _init_(self, web3_client: Web3Client):
        self.web3_client = web3_client
    
    def check_balance(self, address: str) -> AgentResponse:
        """Check wallet balance"""
        balance_data = self.web3_client.get_balance(address)
        
        if "error" in balance_data:
            return AgentResponse(
                agent_type=AgentType.WALLET,
                success=False,
                data={},
                message=f"Error checking balance: {balance_data['error']}"
            )
        
        return AgentResponse(
            agent_type=AgentType.WALLET,
            success=True,
            data=balance_data,
            message=f"Balance: {balance_data['eth']:.4f} ETH"
        )
    
    def send_eth(self, from_address: str, to_address: str, amount: float) -> AgentResponse:
        """Send ETH transaction"""
        # In a real implementation, this would create and sign a transaction
        # For demo purposes, returning mock response
        
        return AgentResponse(
            agent_type=AgentType.WALLET,
            success=True,
            data={
                "from": from_address,
                "to": to_address,
                "amount": amount,
                "gas_used": "21000"
            },
            message=f"Successfully sent {amount} ETH to {to_address[:10]}...",
            transaction_hash="0x789abc123def456ghi..."
        )

