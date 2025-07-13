
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import asyncio

from shared.schema import UserQuery, FinalResponse, AgentResponse
from llm_manager.together_llm import TogetherLLMManager
from web3_integration.web3_client import Web3Client
from agents.wallet_agent import WalletAgent
from agents.swap_agent import SwapAgent
from agents.gas_agent import GasAgent
from agents.credit_agent import CreditAgent
from agents.risk_agent import RiskAgent
from agents.consulting_agent import ConsultingAgent

app = FastAPI(title="DeFi Copilot API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
llm_manager = TogetherLLMManager()
web3_client = Web3Client()

# Initialize agents
wallet_agent = WalletAgent(web3_client)
swap_agent = SwapAgent(web3_client)
gas_agent = GasAgent(web3_client)
credit_agent = CreditAgent(web3_client)
risk_agent = RiskAgent(web3_client)
consulting_agent = ConsultingAgent(llm_manager)

# Agent registry
agents = {
    "wallet_agent": wallet_agent,
    "swap_agent": swap_agent,
    "gas_agent": gas_agent,
    "credit_agent": credit_agent,
    "risk_agent": risk_agent,
    "consulting_agent": consulting_agent
}

class DeFiOrchestrator:
    def _init_(self):
        self.llm_manager = llm_manager
        self.agents = agents
        self.web3_client = web3_client
    
    async def process_query(self, user_query: UserQuery) -> FinalResponse:
        """Main orchestration flow"""
        
        # Step 1: Extract workflow using LLM
        workflow_plan = self.llm_manager.extract_workflow(
            user_query.query, 
            user_query.user_address
        )
        
        # Step 2: Execute workflow tasks
        task_results = []
        for task in workflow_plan.tasks:
            try:
                agent = self.agents[task.agent_type.value]
                result = await self.execute_agent_task(agent, task)
                task_results.append(result)
            except Exception as e:
                task_results.append(AgentResponse(
                    agent_type=task.agent_type,
                    success=False,
                    data={"error": str(e)},
                    message=f"Error executing {task.agent_type}: {str(e)}"
                ))
        
        # Step 3: Analyze results and create final response
        final_response = await self.analyze_and_respond(
            user_query, workflow_plan, task_results
        )
        
        return final_response
    
    async def execute_agent_task(self, agent, task) -> AgentResponse:
        """Execute a specific agent task"""
        action = task.action
        params = task.parameters
        
        # Dynamic method calling based on agent type and action
        if hasattr(agent, action):
            method = getattr(agent, action)
            return method(**params)
        else:
            raise ValueError(f"Agent {task.agent_type} does not have action {action}")
    
    async def analyze_and_respond(self, user_query: UserQuery, workflow_plan, task_results: List[AgentResponse]) -> FinalResponse:
        """Analyze task results and create final response"""
        
        successful_tasks = [r for r in task_results if r.success]
        failed_tasks = [r for r in task_results if not r.success]
        
        # Combine all response messages
        combined_message = "\n".join([r.message for r in successful_tasks])
        
        if failed_tasks:
            error_messages = "\n".join([f"❌ {r.message}" for r in failed_tasks])
            combined_message += f"\n\nErrors:\n{error_messages}"
        
        # Create analysis
        analysis = f"Executed {len(successful_tasks)}/{len(task_results)} tasks successfully."
        if workflow_plan.risk_level != "low":
            analysis += f" Risk level: {workflow_plan.risk_level.upper()}"
        
        return FinalResponse(
            success=len(successful_tasks) > 0,
            message=combined_message,
            data={
                "successful_tasks": len(successful_tasks),
                "failed_tasks": len(failed_tasks),
                "workflow_plan": workflow_plan.dict(),
                "task_results": [r.dict() for r in task_results]
            },
            workflow_executed=workflow_plan.tasks,
            analysis=analysis
        )

# Initialize orchestrator
orchestrator = DeFiOrchestrator()

@app.post("/query", response_model=FinalResponse)
async def process_user_query(query: UserQuery):
    """Main endpoint for processing user queries"""
    try:
        response = await orchestrator.process_query(query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "DeFi Copilot is running"}

@app.get("/agents")
async def list_agents():
    """List available agents"""
    return {
        "agents": list(agents.keys()),
        "descriptions": llm_manager.available_agents
    }

if _name_ == "_main_":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

