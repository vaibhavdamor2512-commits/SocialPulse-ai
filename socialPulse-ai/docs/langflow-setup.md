# IBM Langflow Pipeline — Setup Guide

## Step 1: Access Langflow

- **IBM Managed**: Access via IBM Cloud dashboard
- **Self-hosted**: `docker run -p 7860:7860 langflowai/langflow:latest`

## Step 2: Import the Pipeline

1. Open Langflow UI at `http://your-langflow-url`
2. Click **"Import"** → select `langflow/socialpulse_workflow.json`
3. The pipeline will load with 7 nodes connected

## Step 3: Configure IBM Nodes

### IBM Granite 13B Node (WatsonxAI)

| Field | Value |
|-------|-------|
| `api_key` | Your `IBM_CLOUD_API_KEY` |
| `project_id` | Your `WATSONX_PROJECT_ID` |
| `url` | `https://us-south.ml.cloud.ibm.com` (or your region) |
| `model_id` | `ibm/granite-13b-instruct-v2` |

### Watson NLP Tool Node

Update the environment variables referenced in the Python function code:
- `WATSON_NLP_URL` — your Watson NLU service URL
- `WATSON_NLP_API_KEY` — your Watson NLU API key

## Step 4: Deploy and Get Flow ID

1. Click **"Deploy"** (or **"Publish"**) in Langflow
2. Copy the **Flow ID** from the URL or deployment details
3. Set `LANGFLOW_FLOW_ID=<your-flow-id>` in `.env`
4. Set `LANGFLOW_BASE_URL=https://your-langflow-instance.com`

## Step 5: Verify

```bash
curl -X POST "http://your-langflow-url/api/v1/run/{flow_id}" \
  -H "x-api-key: $LANGFLOW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input_value": "Write a tweet about AI", "input_type": "chat"}'
```

## Pipeline Node Reference

| Node | Role |
|------|------|
| Chat Input | Receives user message and session ID |
| System Prompt | Injects platform + content type context |
| IBM Granite 13B | Core reasoning and content generation |
| Buffer Memory | Maintains per-session conversation history |
| Watson NLP Tool | On-demand sentiment + emotion analysis |
| Agent Executor | Orchestrates LLM with tools, max 5 iterations |
| Chat Output | Returns final response to the API |
