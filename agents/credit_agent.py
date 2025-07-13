from web3_integration.web3_client import Web3Client
from shared.schema import AgentResponse, AgentType

class CreditAgent:
    def _init_(self, web3_client: Web3Client):
        self.web3_client = web3_client
    
    def check_loan_eligibility(self, user_address: str) -> AgentResponse:
        """Check loan eligibility based on on-chain data"""
        # Mock credit scoring based on wallet activity
        balance_data = self.web3_client.get_balance(user_address)
        tx_history = self.web3_client.get_transaction_history(user_address)
        
        # Simple credit scoring algorithm
        balance_score = min(float(balance_data.get('eth', 0)) * 100, 300)
        activity_score = len(tx_history) * 10
        total_score = balance_score + activity_score
        
        if total_score >= 500:
            eligibility = "High"
            max_loan = total_score * 2
        elif total_score >= 200:
            eligibility = "Medium"
            max_loan = total_score * 1.5
        else:
            eligibility = "Low"
            max_loan = total_score * 1
        
        return AgentResponse(
            agent_type=AgentType.CREDIT,
            success=True,
            data={
                "credit_score": total_score,
                "eligibility": eligibility,
                "max_loan_usd": max_loan,
                "factors": {
                    "balance_score": balance_score,
                    "activity_score": activity_score
                }
            },
            message=f"Credit Score: {total_score}/1000 | Eligibility: {eligibility} | Max Loan: ${max_loan:.2f}"
        )

