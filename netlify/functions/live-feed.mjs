const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(body)
});

const configured = names => names.every(name => Boolean(process.env[name]));
const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim();
const isoFromMs = value => value ? new Date(Number(value)).toISOString() : '';

async function getGoogleToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  if (!response.ok) throw new Error(`Google token ${response.status}`);
  const data = await response.json();
  return data.access_token;
}

async function fetchGoogleReviews() {
  const names = ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','GOOGLE_BUSINESS_ACCOUNT_ID','GOOGLE_BUSINESS_LOCATION_ID'];
  if (!configured(names)) return { state: 'not_configured', items: [] };
  const token = await getGoogleToken();
  const account = encodeURIComponent(process.env.GOOGLE_BUSINESS_ACCOUNT_ID.replace(/^accounts\//, ''));
  const location = encodeURIComponent(process.env.GOOGLE_BUSINESS_LOCATION_ID.replace(/^locations\//, ''));
  const endpoint = `https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews?pageSize=20&orderBy=updateTime%20desc`;
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Google reviews ${response.status}`);
  const data = await response.json();
  const ratingMap = { ONE:1, TWO:2, THREE:3, FOUR:4, FIVE:5 };
  return {
    state: 'connected',
    items: (data.reviews || []).filter(r => r.comment).map(r => ({
      id: `google-${r.reviewId}`,
      source: 'Google',
      kind: 'review',
      author: r.reviewer?.displayName || 'Google reviewer',
      text: cleanText(r.comment),
      rating: ratingMap[r.starRating] || null,
      date: r.updateTime || r.createTime || '',
      url: process.env.GOOGLE_BUSINESS_PUBLIC_URL || ''
    }))
  };
}

async function fetchLinkedInPosts() {
  const names = ['LINKEDIN_ACCESS_TOKEN','LINKEDIN_AUTHOR_URN'];
  if (!configured(names)) return { state: 'not_configured', items: [] };
  const author = encodeURIComponent(process.env.LINKEDIN_AUTHOR_URN);
  const endpoint = `https://api.linkedin.com/rest/posts?author=${author}&q=author&count=10&sortBy=CREATED&viewContext=READER`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': process.env.LINKEDIN_API_VERSION || '202609'
    }
  });
  if (!response.ok) throw new Error(`LinkedIn posts ${response.status}`);
  const data = await response.json();
  return {
    state: 'connected',
    items: (data.elements || []).filter(p => p.commentary).map(p => ({
      id: `linkedin-${p.id}`,
      source: 'LinkedIn',
      kind: 'post',
      author: 'Palkin Singla',
      text: cleanText(p.commentary),
      date: isoFromMs(p.publishedAt || p.createdAt || p.lastModifiedAt),
      url: process.env.LINKEDIN_PROFILE_URL || 'https://www.linkedin.com/in/palkin-singla/'
    }))
  };
}

async function getUpworkToken() {
  const response = await fetch('https://www.upwork.com/api/v3/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.UPWORK_REFRESH_TOKEN,
      client_id: process.env.UPWORK_CLIENT_ID,
      client_secret: process.env.UPWORK_CLIENT_SECRET
    })
  });
  if (!response.ok) throw new Error(`Upwork token ${response.status}`);
  const data = await response.json();
  return data.access_token;
}

async function fetchUpworkReviews() {
  const names = ['UPWORK_CLIENT_ID','UPWORK_CLIENT_SECRET','UPWORK_REFRESH_TOKEN','UPWORK_PERSON_ID'];
  if (!configured(names)) return { state: 'not_configured', items: [] };
  const token = await getUpworkToken();
  const query = `query talentWorkHistory($filter: TalentWorkHistoryFilterInput) {
    talentWorkHistory(filter: $filter) {
      workHistoryList {
        contract { id title startDate endDate status }
        feedback { feedbackToFreelancer { comment score feedbackSuppressed isPublic commentPublic } }
      }
      totalCount
    }
  }`;
  const variables = { filter: { personId: process.env.UPWORK_PERSON_ID } };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (process.env.UPWORK_TENANT_ID) headers['X-Upwork-API-TenantId'] = process.env.UPWORK_TENANT_ID;
  const response = await fetch('https://api.upwork.com/graphql', {
    method: 'POST', headers, body: JSON.stringify({ query, variables })
  });
  if (!response.ok) throw new Error(`Upwork GraphQL ${response.status}`);
  const data = await response.json();
  if (data.errors?.length) throw new Error(`Upwork GraphQL: ${data.errors[0].message}`);
  const rows = data.data?.talentWorkHistory?.workHistoryList || [];
  const items = rows.map(row => {
    const feedback = row.feedback?.feedbackToFreelancer;
    const comment = feedback?.commentPublic || feedback?.comment;
    if (!comment || feedback?.feedbackSuppressed === true || feedback?.isPublic === false) return null;
    return {
      id: `upwork-${row.contract?.id || Math.random()}`,
      source: 'Upwork',
      kind: 'review',
      author: row.contract?.title || 'Upwork client',
      text: cleanText(comment),
      rating: typeof feedback?.score === 'number' ? feedback.score : null,
      date: row.contract?.endDate || row.contract?.startDate || '',
      url: process.env.UPWORK_PROFILE_URL || ''
    };
  }).filter(Boolean);
  return { state: 'connected', items };
}

export async function handler() {
  const sources = {};
  const items = [];
  const loaders = [
    ['google', fetchGoogleReviews],
    ['linkedin', fetchLinkedInPosts],
    ['upwork', fetchUpworkReviews]
  ];

  await Promise.all(loaders.map(async ([key, loader]) => {
    try {
      const result = await loader();
      sources[key] = result.state;
      items.push(...result.items);
    } catch (error) {
      console.error(`${key} live feed error`, error);
      sources[key] = 'error';
    }
  }));

  items.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  return json(200, { updatedAt: new Date().toISOString(), sources, items: items.slice(0, 12) });
}
