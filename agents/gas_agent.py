
from web3_integration.web3_client import Web3Client
from shared.schema import AgentResponse, AgentType

class GasAgent:
    def _init_(self, web3_client: Web3Client):
        self.web3_client = web3_client
    
    def estimate_gas_fee(self, transaction_type: str, amount: float = None) -> AgentResponse:
        """Estimate gas fees"""
        # Gas estimates based on transaction type
        gas_estimates = {
            "send_eth": 21000,
            "swap_token": 150000,
            "approve_token": 45000,
            "stake": 100000
        }
        
        gas_limit = gas_estimates.get(transaction_type, 21000)
        gas_price_gwei = 20  # Mock gas price
        
        gas_cost_eth = (gas_limit * gas_price_gwei * 1e9) / 1e18
        gas_cost_usd = gas_cost_eth * 3200  # Mock ETH price
        
        return AgentResponse(
            agent_type=AgentType.GAS,
            success=True,
            data={
                "transaction_type": transaction_type,
                "gas_limit": gas_limit,
                "gas_price_gwei": gas_price_gwei,
                "gas_cost_eth": gas_cost_eth,
                "gas_cost_usd": gas_cost_usd
            },
            message=f"Gas estimate for {transaction_type}: {gas_cost_eth:.6f} ETH (${gas_cost_usd:.2f})"
        )

