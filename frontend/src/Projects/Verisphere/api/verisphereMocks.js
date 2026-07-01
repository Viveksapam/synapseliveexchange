export const mockCommunities = [
  { id: 1, strName: 'Web Engineering', strDescription: 'Deep dives into V2 architecture', member_count: 1420 },
  { id: 2, strName: 'Neurotech', strDescription: 'BCI and logic systems', member_count: 856 },
  { id: 3, strName: 'Digital Philosophy', strDescription: 'Ethics in the V2 era', member_count: 2311 },
];

export const mockComments = [
  {
    id: 1,
    strContent: 'The 3D context is preserved via a persistent Canvas wrapper outside the React Router Routes element.',
    strAuthorUsername: 'WebGLMaster', objAuthor: 103,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    numUpvotes: 45,
    dictAiMetrics: { logical_soundness: 92 },
    strAiAnalysis: 'The logic is sound and directly answers the technical question with an architectural pattern.',
  },
  {
    id: 2,
    strContent: 'I disagree. While that pattern works, it creates memory leaks if the canvas context is never cleaned up properly during full unmounts.',
    strAuthorUsername: 'MemoryHawk', objAuthor: 105,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    numUpvotes: 12,
    dictAiMetrics: { logical_soundness: 85, logical_errors: ['Slippery Slope'] },
    strAiAnalysis: 'Valid technical concern, but assumes the worst-case scenario without verifying the cleanup implementation.',
    replies: [
      {
        id: 101,
        strContent: 'Actually, the v2 update added automatic garbage collection for orphaned canvas nodes when the route unmounts, mitigating this.',
        strAuthorUsername: 'ArchitectBob', objAuthor: 108,
        created_at: new Date(Date.now() - 900000).toISOString(),
        strAnalysisReasoning: 'Referencing the v2 update changelog regarding memory management.',
      },
      {
        id: 102,
        strContent: 'Can confirm! Profiling shows no memory leaks after 50+ route transitions.',
        strAuthorUsername: 'QA_Tester', objAuthor: 109,
        created_at: new Date(Date.now() - 300000).toISOString(),
        strAnalysisReasoning: 'Empirical testing data backing up the architectural claim.',
      },
    ],
  },
  {
    id: 3,
    strContent: 'This is a fantastic approach! I applied it to my project and it completely solved the latency issues.',
    strAuthorUsername: 'DevEnthusiast', objAuthor: 106,
    created_at: new Date().toISOString(),
    numUpvotes: 8,
    dictAiMetrics: { logical_soundness: 50 },
    strAiAnalysis: 'Anecdotal evidence. While positive, it does not provide structural proof of the solution\'s universal validity.',
  },
];

const blogPostShape = (blog) => ({
  id: `blog_${blog.id}`,
  strTitle: blog.strTitle,
  strContent: blog.strContent || blog.strSummary,
  strAuthorUsername: blog.strAuthorUsername || 'System',
  objAuthor: 0,
  objCommunity: blog.objCommunity || 1,
  strCommunityName: blog.strCommunityName || 'General',
  created_at: new Date(blog.datePublished).toISOString(),
  numUpvotes: blog.numUpvotes || 0,
  comments_count: blog.comments_count || 0,
  strMediaUrl: blog.strMediaUrl || null,
  sources: [],
  sources_count: blog.sources_count || 0,
  ai_summary: blog.ai_summary || blog.strSummary,
  ai_context_guardrail: blog.ai_context_guardrail || null,
  analysis_detail: blog.analysis_detail || null,
  analyzed_at: blog.analyzed_at || null,
  boolIsFeatured: blog.boolIsFeatured || false,
});

export const mapBlogToPost = blogPostShape;
