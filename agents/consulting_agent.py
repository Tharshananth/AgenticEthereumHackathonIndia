from shared.schema import AgentResponse, AgentType
from llm_manager.together_llm import TogetherLLMManager

class ConsultingAgent:
    def _init_(self, llm_manager: TogetherLLMManager):
        self.llm_manager = llm_manager
    
    def provide_guidance(self, query: str, user_context: dict = None) -> AgentResponse:
        """Provide DeFi guidance and recommendations"""
        
        system_prompt = """
        You are a DeFi consultant with expertise in:
        - Yield farming strategies
        - Risk management
        - Protocol recommendations
        - Market analysis
        - Best practices for DeFi users
        
        Provide clear, actionable advice while emphasizing risk management.
        """
        
        user_prompt = f"""
        User Query: {query}
        User Context: {user_context or "Not provided"}
        
        Provide comprehensive DeFi guidance.
        """
        
        try:
            response = self.llm_manager.client.chat.completions.create(
                model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            advice = response.choices[0].message.content
            
            return AgentResponse(
                agent_type=AgentType.CONSULTING,
                success=True,
                data={
                    "advice": advice,
                    "query": query,
                    "consultation_type": "general_guidance"
                },
                message=advice
            )
            
        except Exception as e:
            return AgentResponse(
                agent_type=AgentType.CONSULTING,
                success=False,
                data={"error": str(e)},
                message="Sorry, I couldn't provide guidance at this time. Please try again."
            )
