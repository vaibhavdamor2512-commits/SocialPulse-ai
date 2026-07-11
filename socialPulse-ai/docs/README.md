# SocialPulse AI — Docs Index

| Document | Description |
|----------|-------------|
| [architecture.md](architecture.md) | System diagrams and data flow |
| [api-reference.md](api-reference.md) | All 18 API endpoints |
| [langflow-setup.md](langflow-setup.md) | IBM Langflow pipeline import guide |

## IBM Langflow Setup

1. Deploy IBM Langflow (or use IBM Cloud managed instance)
2. Import `../langflow/socialpulse_workflow.json` via the Langflow UI
3. Update the WatsonxAI node with your `WATSONX_PROJECT_ID` and `IBM_CLOUD_API_KEY`
4. Update the Watson NLP tool code with your `WATSON_NLP_URL` and `WATSON_NLP_API_KEY`
5. Note the generated Flow ID and set it as `LANGFLOW_FLOW_ID` in `.env`
