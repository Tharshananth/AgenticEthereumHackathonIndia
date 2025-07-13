from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from enum import Enum

class AgentType(str, Enum):
    WALLET = "wallet_agent"
    SWAP = "swap_agent"
    GAS = "gas_agent"
    CREDIT = "credit_agent"
    RISK = "risk_agent"
    CONSULTING = "consulting_agent"

class UserQuery(BaseModel):
    query: str
    user_address: Optional[str] = None
    session_id: str

class AgentTask(BaseModel):
    agent_type: AgentType
    action: str
    parameters: Dict[str, Any]
    priority: int = 1

class WorkflowPlan(BaseModel):
    tasks: List[AgentTask]
    estimated_gas: Optional[float] = None
    risk_level: str = "low"
    requires_confirmation: bool = False

class AgentResponse(BaseModel):
    agent_type: AgentType
    success: bool
    data: Dict[str, Any]
    message: str
    transaction_hash: Optional[str] = None

class FinalResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]
    workflow_executed: List[AgentTask]
    analysis: str

