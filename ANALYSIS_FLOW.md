# DEPRECATED: See docs/SITE_LOGIC.md

This file has been merged into the main documentation.

**Please refer to:** `docs/SITE_LOGIC.md`
- Section 5: Post Analysis flow
- Section 6: Comment Analysis flow

---

## Backend Flow

### 1. Trigger Analysis
**Endpoint:** `POST /api/verisphere/blogs/{blog_id}/analysis/`
- Requires admin authentication
- Calls `run_blog_audit()` logic

### 2. Audit Collection
**Function:** `crud_blog.create_audit_collection()`
- Collects blog post data
- Collects all comments (recursive replies)
- Collects all contexts and sources
- Stores in `BlogAuditCollectionModel.collected_data` (JSON)

### 3. LLM Analysis
**Service:** `llm_audit.analyze_audit_collection()`
- Sends collected data to Gemini 2.0 Flash
- Returns structured JSON:
  ```json
  {
    "logical_soundness": 0.0-1.0,
    "verifiable": "yes|no|partial",
    "summary": "paragraph of assessment",
    "approved_source_ids": [...],
    "rejected_source_ids": [...]
  }
  ```

### 4. Sync Results to Blog Analysis
**Function:** `crud_blog.sync_audit_to_blog_analysis()`
- NEW FUNCTION - bridges the gap
- Extracts `logical_soundness`, `verifiable`, `summary` from LLM response
- Creates or updates `BlogAIAnalysisModel` record:
  ```python
  BlogAIAnalysisModel:
    blog_id → ForeignKey to BlogModel
    logical_soundness → Float (0-1)
    verifiable → String (yes|no|partial)
    ai_summary → Text (the summary)
  ```

### 5. Auto-Approve Sources
**Function:** `approve_blog_source()`
- Auto-approves sources recommended by AI
- Sets `approved_by="ai"` and `approver_name="Gemini 2.0 Flash"`

### 6. Return Updated Blog
**Response:** `BlogResponse` with analysis fields:
```python
BlogResponse:
  id, strTitle, strContent, ...
  verifiable: String          ← from BlogAIAnalysisModel
  logical_soundness: Float    ← from BlogAIAnalysisModel
  ai_summary: String          ← from BlogAIAnalysisModel
```

---

## Database Schema

```
BlogModel
├── id (PK)
├── strTitle, strContent, ...
└── ai_analysis (relationship) → BlogAIAnalysisModel

BlogAIAnalysisModel
├── blog_id (FK, PK)
├── logical_soundness (Float)
├── verifiable (String)
└── ai_summary (Text)

BlogAuditCollectionModel
├── id (PK)
├── blog_id (FK)
├── collected_data (JSON)
├── llm_response (JSON)
└── status (processed|pending)

BlogCommentModel
├── id (PK)
├── blog_id (FK)
└── analysis (relationship) → CommentAnalysisModel

CommentAnalysisModel
├── comment_id (FK, PK)
├── sentiment (String)
├── relevance_score (Float)
└── ai_summary (Text)
```

---

## Frontend Flow

### 1. Trigger Analysis
**File:** `PostDetailPage.jsx`
```jsx
<PostDetailContext
  post={post.objPostState}
  onAnalyze={() => post.analyzePost()}
  boolIsAnalyzing={post.boolIsAnalyzingPostState}
/>
```

### 2. Call API
**File:** `verisphereApi.js`
```javascript
export const postAnalyzePost = async (numPostId, strToken) => {
  const response = await fetch(
    `${API_BASE}/verisphere/blogs/{blogId}/analysis/`,
    { method: 'POST', headers: { Authorization: `Bearer ${strToken}` } }
  );
  return response.json(); // Returns BlogResponse with analysis
}
```

### 3. Update State
**File:** `usePostDetail.js`
```javascript
const analyzePost = async () => {
  const data = await postAnalyzePost(postId, strToken);
  setObjPostState(prev => ({
    ...prev,
    verifiable: data.verifiable,
    logical_soundness: data.logical_soundness,
    ai_summary: data.ai_summary
  }));
}
```

### 4. Display Analysis
**File:** `PostDetailContext.jsx`
- **Collapsed:** Shows summary sentence: `{post.ai_summary?.substring(0, 80)}...`
- **Expanded:** Shows full summary + metrics:
  - Logical Soundness: `{(logical_soundness * 100).toFixed(0)}/100`
  - Verifiable: `{verifiable}`

---

## Data Flow Diagram

```
User clicks "Analyze Post & Discussion"
          ↓
POST /api/verisphere/blogs/{blog_id}/analysis/
          ↓
create_audit_collection()
  ├─ Gather all blog data
  ├─ Gather all comments (recursive)
  ├─ Gather all contexts & sources
  └─ Store in BlogAuditCollectionModel
          ↓
llm_audit.analyze_audit_collection()
  └─ Call Gemini with collected data
          ↓
sync_audit_to_blog_analysis()
  └─ Save LLM response → BlogAIAnalysisModel
          ↓
approve_blog_source()
  └─ Auto-approve recommended sources
          ↓
Return BlogResponse with:
  verifiable, logical_soundness, ai_summary
          ↓
Frontend updates state
          ↓
PostDetailContext renders expandable analysis card
```

---

---

## Comment Analysis Flow

### 1. Trigger Comment Analysis
**Endpoint:** `POST /api/comments/{comment_id}/analyze/`
- Requires admin authentication
- Analyzes single comment with full context

### 2. Comment Audit Collection
**Function:** `crud_blog.create_comment_audit_collection()`
- Collects parent comment chain (traverses up to root comment)
- Collects blog post context (title, summary, content, guardrails)
- Collects the target comment
- Stores in `CommentAuditCollectionModel.collected_data` (JSON)

**Structure:**
```json
{
  "blog": {
    "id": 1,
    "strTitle": "...",
    "strContent": "...",
    "ai_summary": "...",
    "verifiable": "yes"
  },
  "comment_chain": [
    { "id": 1, "strContent": "Parent comment" },
    { "id": 2, "strContent": "Reply" },
    { "id": 3, "strContent": "Target comment" }
  ],
  "target_comment": { ... }
}
```

### 3. LLM Analysis (same Gemini call)
- Analyzes comment in context of parent chain + blog
- Returns:
  ```json
  {
    "sentiment": "constructive|critical|neutral|supportive",
    "relevance_score": 0.0-1.0,
    "ai_summary": "assessment of comment",
    "approved_source_ids": [],
    "rejected_source_ids": []
  }
  ```

### 4. Sync to Comment Analysis
**Function:** `crud_blog.sync_comment_audit_to_analysis()`
- Updates `CommentAnalysisModel`:
  ```python
  CommentAnalysisModel:
    comment_id → ForeignKey to BlogCommentModel
    sentiment → String (constructive|critical|neutral|supportive)
    relevance_score → Float (0-1)
    ai_summary → Text (assessment)
  ```

### 5. Return Updated Comment Analysis
**Response:**
```json
{
  "comment_id": 123,
  "sentiment": "constructive",
  "relevance_score": 0.85,
  "ai_summary": "This comment provides valuable context..."
}
```

### 6. Frontend Displays (CommentBody component)
- **Collapsed:** Show "📊 Analysis ▶" indicator only (minimal space)
- **Expanded:** Show:
  - Full AI summary
  - Sentiment badge
  - Relevance score as percentage

---

## Database Schema - Comment Analysis

```
BlogCommentModel
├── id (PK)
├── blog_id (FK)
├── parent_comment_id (FK)
├── strContent
└── analysis (relationship) → CommentAnalysisModel

CommentAnalysisModel
├── comment_id (FK, PK)
├── sentiment (String)
├── relevance_score (Float)
└── ai_summary (Text)

CommentAuditCollectionModel
├── id (PK)
├── comment_id (FK)
├── blog_id (FK)
├── collected_data (JSON)
├── llm_response (JSON)
├── status (pending|processed)
└── processed_at (DateTime)
```

---

## Frontend Implementation - Comment Analysis

### API Call
**File:** `verisphereApi.js`
```javascript
export const postAnalyzeComment = async (numCommentId, strToken) => {
  const response = await fetch(
    `${API_BASE}/comments/${numCommentId}/analyze/`,
    { method: 'POST', headers: { Authorization: `Bearer ${strToken}` } }
  );
  return response.json();
}
```

### Hook Update
**File:** `usePostDetail.js`
```javascript
const analyzeComment = async (numCommentId) => {
  setLoadingCommentsState(prev => ({ ...prev, [numCommentId]: true }));
  const data = await postAnalyzeComment(numCommentId, strToken);
  setObjPostState(prev => ({
    ...prev,
    comments: prev.comments.map(c =>
      c.id === numCommentId ? {
        ...c,
        strAiAnalysis: data.ai_summary,
        dictAiMetrics: {
          sentiment: data.sentiment,
          relevance_score: data.relevance_score
        }
      } : c
    )
  }));
}
```

### Component Display
**File:** `CommentBody.jsx`
- Expandable analysis section below comment
- Shows sentiment + relevance_score when expanded
- Minimal space when collapsed (one-line toggle)

---

## Testing Checklist

### Post Analysis
- [ ] Backend can create blog audit collection
- [ ] LLM returns valid response with logical_soundness, verifiable, summary
- [ ] sync_audit_to_blog_analysis updates BlogAIAnalysisModel
- [ ] BlogResponse includes analysis fields
- [ ] Frontend receives updated data
- [ ] PostDetailContext displays analysis
- [ ] Expand/collapse works
- [ ] Loading state shows on button

### Comment Analysis
- [ ] Backend collects comment with parent chain context
- [ ] LLM returns sentiment, relevance_score, ai_summary
- [ ] sync_comment_audit_to_analysis updates CommentAnalysisModel
- [ ] Frontend updates comment state with analysis
- [ ] CommentBody displays analysis expandable section
- [ ] Sentiment and relevance score show in expanded view
- [ ] Minimal space when collapsed
- [ ] Works recursively for nested reply chains
