# Demo Blog - Climate Change & Employment Laws

## Blog Created Successfully! 🎉

**Blog ID:** 29  
**Title:** How Climate Change Laws Are Reshaping Employment Markets  
**Comments:** 4 (including 1 reply)

---

## How to View & Test

### Step 1: Start the Backend Server
```bash
cd C:\Users\Vivek\projects\sle\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Start the Frontend Server (in another terminal)
```bash
cd C:\Users\Vivek\projects\sle\frontend
npm run dev
```

### Step 3: Open Your Browser

**View the blog post:**
```
http://localhost:5173/verisphere/post/29
```

**View comments & analysis buttons:**
```
http://localhost:5173/verisphere/post/29/comments
```

---

## What You'll See

### Post Detail Page (`/post/29`)
- ✅ Blog title: "How Climate Change Laws Are Reshaping Employment Markets"
- ✅ Summary and full content
- ✅ **"Analyze Post & Discussion"** button → Analyzes entire post + all comments
- ✅ Community badge: "Environment & Policy"
- ✅ Link to "View Discussion (4 comments)"

### Comments Page (`/post/29/comments`)
- ✅ Root comment by Dr. Sarah Mitchell
- ✅ Root comment by James Chen
- ✅ Root comment by Maria Garcia
- ✅ Reply to Dr. Mitchell (nested comment)
- ✅ **"Analyze"** button under each comment (expandable)

---

## Testing the Analysis Buttons

### 1. Analyze Post & Discussion
1. Click **"Analyze Post & Discussion"** button at the top
2. Button shows: **"⊙ Analyzing..."** (loading state)
3. Wait for response (3-5 seconds with mock LLM)
4. Results update:
   - **Soundness Score**: Shows 0-100 score
   - **Verifiable Status**: yes/no/partial
   - **Summary**: AI analysis of post quality

### 2. Analyze Comments
1. Scroll to any comment (e.g., Dr. Sarah Mitchell's)
2. Click **"Analyze"** button
3. Button shows: **"⊙ Analyzing..."**
4. Analysis section expands to show:
   - **AI Summary**: Assessment of comment quality
   - **Sentiment**: constructive/critical/supportive/neutral
   - **Relevance Score**: 0-100% relevance to topic

---

## API Endpoints (Direct Testing)

### Analyze Post
```bash
curl -X POST http://localhost:8000/api/verisphere/blogs/29/analysis/ \
  -H "Authorization: Bearer <admin-token>"
```

### Analyze Comment
```bash
curl -X POST http://localhost:8000/api/comments/<comment-id>/analyze/ \
  -H "Authorization: Bearer <admin-token>"
```

---

## Database Info

### Post Analysis Results
After clicking "Analyze Post & Discussion":
- **Table**: `blog_blogaianalysismodel`
- **Fields**: `blog_id`, `logical_soundness`, `verifiable`, `ai_summary`

### Comment Analysis Results
After clicking "Analyze" on a comment:
- **Table**: `blog_commentanalysismodel`
- **Fields**: `comment_id`, `sentiment`, `relevance_score`, `ai_summary`

---

## Mock LLM Response Examples

**Post Analysis Response:**
```json
{
  "logical_soundness": 0.75,
  "verifiable": "partial",
  "summary": "Post analysis: 4 comments received. Content length: 1250 chars. Logical soundness estimated at 75%."
}
```

**Comment Analysis Response:**
```json
{
  "sentiment": "constructive",
  "relevance_score": 0.85,
  "ai_summary": "Comment analysis: constructive tone, part of 2-comment thread. Relevance score: 85%. Content addresses the topic with meaningful contribution."
}
```

---

## Troubleshooting

❌ **Button doesn't respond:**
- Check browser console for errors (F12)
- Verify backend is running (http://localhost:8000/docs)
- Check network tab to see API response

❌ **"Loading..." spinner stuck:**
- Check backend logs for errors
- Verify GEMINI_API_KEY is set to valid key
- Current `.env` uses mock LLM - that's normal

❌ **"Analyze" button not visible:**
- Make sure you're on `/verisphere/post/29/comments` page
- Comments must be loaded first
- Refresh page if needed

---

## Ready to Test! 🚀

1. Start both servers
2. Navigate to the blog
3. Click "Analyze Post & Discussion"
4. Watch the analysis happen in real-time
5. See results appear in the UI
6. Check database to confirm data was saved

Enjoy! 🎉
