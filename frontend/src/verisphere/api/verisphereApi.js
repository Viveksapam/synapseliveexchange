import { API_BASE } from '../../api/config';

// --- Dummy Data ---
const mockCommunities = [
    { id: 1, strName: 'Web Engineering', strDescription: 'Deep dives into V2 architecture', member_count: 1420 },
    { id: 2, strName: 'Neurotech', strDescription: 'BCI and logic systems', member_count: 856 },
    { id: 3, strName: 'Digital Philosophy', strDescription: 'Ethics in the V2 era', member_count: 2311 }
];

const mockComments = [
    {
        id: 1,
        strContent: 'The 3D context is preserved via a persistent Canvas wrapper outside the React Router Routes element.',
        strAuthorUsername: 'WebGLMaster',
        objAuthor: 103,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        numUpvotes: 45,
        dictAiMetrics: { logical_soundness: 92 },
        strAiAnalysis: 'The logic is sound and directly answers the technical question with an architectural pattern.'
    },
    {
        id: 2,
        strContent: 'I disagree. While that pattern works, it creates memory leaks if the canvas context is never cleaned up properly during full unmounts.',
        strAuthorUsername: 'MemoryHawk',
        objAuthor: 105,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        numUpvotes: 12,
        dictAiMetrics: { logical_soundness: 85, logical_errors: ['Slippery Slope'] },
        strAiAnalysis: 'Valid technical concern, but assumes the worst-case scenario without verifying the cleanup implementation.',
        replies: [
            {
                id: 101,
                strContent: 'Actually, the v2 update added automatic garbage collection for orphaned canvas nodes when the route unmounts, mitigating this.',
                strAuthorUsername: 'ArchitectBob',
                objAuthor: 108,
                created_at: new Date(Date.now() - 900000).toISOString(),
                strAnalysisReasoning: 'Referencing the v2 update changelog regarding memory management.'
            },
            {
                id: 102,
                strContent: 'Can confirm! Profiling shows no memory leaks after 50+ route transitions.',
                strAuthorUsername: 'QA_Tester',
                objAuthor: 109,
                created_at: new Date(Date.now() - 300000).toISOString(),
                strAnalysisReasoning: 'Empirical testing data backing up the architectural claim.'
            }
        ]
    },
    {
        id: 3,
        strContent: 'This is a fantastic approach! I applied it to my project and it completely solved the latency issues.',
        strAuthorUsername: 'DevEnthusiast',
        objAuthor: 106,
        created_at: new Date().toISOString(),
        numUpvotes: 8,
        dictAiMetrics: { logical_soundness: 50 },
        strAiAnalysis: 'Anecdotal evidence. While positive, it does not provide structural proof of the solution\'s universal validity.'
    }
];

// --- Communities ---
export const fetchCommunities = async () => {
    return Promise.resolve(mockCommunities);
};

export const fetchCommunityDetail = async (numId) => {
    const community = mockCommunities.find(c => c.id === parseInt(numId));
    if (!community) throw new Error('Community not found');
    return Promise.resolve(community);
};

export const postCreateCommunity = async (objCommunityData, strToken) => {
    const newComm = { id: Date.now(), ...objCommunityData, member_count: 1 };
    mockCommunities.push(newComm);
    return Promise.resolve(newComm);
};

export const postJoinCommunity = async (numId, strToken) => {
    return Promise.resolve({ status: 'joined' });
};

// --- Posts ---
export const fetchPosts = async (numCommunityId = null) => {
    try {
        const response = await fetch(`${API_BASE}/verisphere/blogs/`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (response.ok) {
            const blogs = await response.json();
            let blogPosts = blogs.map(blog => ({
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
                dictAiMetrics: {
                    verifiable: blog.verifiable || 'yes',
                    logical_soundness: blog.logical_soundness || 0.99
                },
                sources: [],
                ai_summary: blog.ai_summary || blog.strSummary,
                boolIsFeatured: blog.boolIsFeatured || false
            }));
            
            // Sort by highest engagement (numUpvotes) first
            blogPosts.sort((a, b) => b.numUpvotes - a.numUpvotes);

            if (numCommunityId) {
                return blogPosts.filter(p => p.objCommunity === parseInt(numCommunityId) || p.objCommunity === String(numCommunityId));
            }
            return blogPosts;
        }
    } catch (error) {
        console.error("Failed to fetch blogs for verisphere", error);
    }
    return Promise.resolve([]);
};

export const postToggleFeatured = async (numPostId, isCurrentlyFeatured, strToken) => {
    const strId = String(numPostId);
    const blogId = strId.startsWith('blog_') ? parseInt(strId.replace('blog_', '')) : parseInt(strId);
    try {
        const response = await fetch(`${API_BASE}/verisphere/blogs/featured/${blogId}`, {
            method: isCurrentlyFeatured ? 'DELETE' : 'POST',
            headers: {
                'Authorization': `Bearer ${strToken}`
            }
        });
        if (response.ok) {
            return true;
        }
    } catch (e) {
        console.error("Failed to toggle featured status", e);
    }
    return false;
};

export const fetchPostDetail = async (idOrString) => {
    const strId = String(idOrString);
    const blogId = strId.startsWith('blog_') ? parseInt(strId.replace('blog_', '')) : parseInt(strId);
    
    const response = await fetch(`${API_BASE}/verisphere/blogs/`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (response.ok) {
        const blogs = await response.json();
        const blog = blogs.find(b => b.id === blogId);
        if (blog) {
            return {
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
                dictAiMetrics: { 
                    verifiable: blog.verifiable || 'yes', 
                    logical_soundness: blog.logical_soundness || 0.99 
                },
                sources: [],
                ai_summary: blog.ai_summary || blog.strSummary,
                comments: mockComments
            };
        }
    }
    throw new Error('Post not found');
};

export const postCreatePost = async (objPostData, strToken) => {
    // For now, this just resolves successfully without real backend creation,
    // to prevent errors, but it won't persist locally like mockPosts did.
    return Promise.resolve({
        id: `blog_${Date.now()}`,
        ...objPostData,
        author_name: 'CurrentUser',
        created_at: new Date().toISOString(),
        score: 0,
        comments_count: 0
    });
};

export const postCreateSource = async (numPostId, objSourceData, strToken) => {
    return Promise.resolve({ id: Date.now(), ...objSourceData, reliability_score: 80 });
};

// --- Comments & Reasoning ---
export const postCreateComment = async (numPostId, objCommentData, strToken) => {
    const newComment = {
        id: Date.now(),
        ...objCommentData,
        author_name: 'CurrentUser',
        created_at: new Date().toISOString(),
        score: 0
    };
    mockComments.push(newComment);
    return Promise.resolve(newComment);
};

// --- Voting & Reactions ---
export const postVote = async (objVoteData, strToken) => {
    return Promise.resolve({ success: true });
};

export const fetchPostReactions = async (numPostId) => {
    const strId = String(numPostId);
    const blogId = strId.startsWith('blog_') ? parseInt(strId.replace('blog_', '')) : parseInt(strId);
    try {
        // Hardcoding user_id=3 for Vivek
        const response = await fetch(`${API_BASE}/verisphere/blogs/${blogId}/reactions?user_id=3`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Failed to fetch reactions", e);
    }
    return { reactions: {}, user_reacted: {} };
};

export const postToggleReaction = async (numPostId, emoji) => {
    const strId = String(numPostId);
    const blogId = strId.startsWith('blog_') ? parseInt(strId.replace('blog_', '')) : parseInt(strId);
    try {
        const response = await fetch(`${API_BASE}/verisphere/blogs/${blogId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emoji: emoji, user_id: 3 })
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Failed to toggle reaction", e);
    }
    return { status: 'error' };
};

// --- AI Analysis ---
export const postAnalyzeContext = async (numPostId) => {
    return Promise.resolve({ summary: "Mock AI analysis of the post context." });
};

export const postAnalyzeComment = async (numCommentId) => {
    return Promise.resolve({ analysis: "Mock AI analysis of the comment logic.", is_fallacy: false });
};
