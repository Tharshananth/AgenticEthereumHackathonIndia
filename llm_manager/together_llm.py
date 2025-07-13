import os
from together import Together
from typing import Dict, List
from shared.schema import WorkflowPlan, AgentTask, AgentType

class TogetherLLMManager:
    def _init_(self):
        self.client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
        self.available_agents = {
            "wallet_agent": "Handles wallet operations like balance check, send ETH/tokens",
            "swap_agent": "Performs token swaps using DEXes like Uniswap",
            "gas_agent": "Estimates gas fees for transactions",
            "credit_agent": "Checks loan eligibility and credit scoring",
            "risk_agent": "Analyzes address safety and scam detection",
            "consulting_agent": "Provides DeFi advice and strategy recommendations"
        }
    
    def extract_workflow(self, user_query: str, user_address: str = None) -> WorkflowPlan:
        """Extract workflow plan from user query using LLM"""
        
        system_prompt = f"""
        You are a DeFi workflow planner. Based on user queries, create a workflow plan using available agents.
        
        Available Agents:
        {self.format_agents_for_prompt()}
        
        For each user query, determine:
        1. Which agents to use
        2. What actions to perform
        3. Required parameters
        4. Execution order (priority)
        5. Risk level assessment
        
        Return a structured workflow plan in JSON format.
        """
        
        user_prompt = f"""
        User Query: "{user_query}"
        User Address: {user_address or "Not provided"}
        
        Create a workflow plan with the following structure:
        {{
            "tasks": [
                {{
                    "agent_type": "agent_name",
                    "action": "specific_action",
                    "parameters": {{"key": "value"}},
                    "priority": 1
                }}
            ],
            "estimated_gas": null,
            "risk_level": "low/medium/high",
            "requires_confirmation": false
        }}
        """
        
        response = self.client.chat.completions.create(
            model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1000,
            temperature=0.1
        )
        
        # Parse LLM response and convert to WorkflowPlan
        try:
            import json
            workflow_dict = json.loads(response.choices[0].message.content)
            return WorkflowPlan(**workflow_dict)
        except Exception as e:
            # Fallback workflow
            return self.create_fallback_workflow(user_query)
    
    def format_agents_for_prompt(self) -> str:
        return "\n".join([f"- {agent}: {desc}" for agent, desc in self.available_agents.items()])
    
    def create_fallback_workflow(self, query: str) -> WorkflowPlan:
        """Create a fallback workflow when LLM parsing fails"""
        return WorkflowPlan(
            tasks=[
                AgentTask(
                    agent_type=AgentType.CONSULTING,
                    action="provide_guidance",
                    parameters={"query": query},
                    priority=1
                )
            ],
            risk_level="low",
            requires_confirmation=False
        )

