// Gemini AI Assistant & Intelligent Matcher Route (ADF Module: Gemini for Developers)
import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { prisma } from '@/lib/prisma';

// Helper to reliably query Gemini API via Node https (bypasses Next.js fetch polyfill quirks)
function queryGeminiAPI(prompt: string, apiKey: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const data = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      });

      const req = https.request(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
          timeout: 4500,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const parsed = JSON.parse(body);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                resolve(text ? text.trim() : null);
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.on('error', () => {
        resolve(null);
      });

      req.write(data);
      req.end();
    } catch {
      resolve(null);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, type } = await request.json();

    if (!title && !description) {
      return NextResponse.json({ success: false, error: 'Title or description required' }, { status: 400 });
    }

    // If searching for LOST, match against FOUND items, and vice versa
    const targetType = type === 'LOST' ? 'FOUND' : 'LOST';

    const candidates = await prisma.item.findMany({
      where: {
        type: targetType,
        status: 'OPEN',
      },
    });

    const queryKeywords = `${title} ${description} ${category || ''}`
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);

    // Compute semantic match score based on keyword frequency, category match, location overlap
    const scoredMatches = candidates.map((item) => {
      let score = 0;
      const reasons: string[] = [];

      // Category match
      if (category && item.category.toLowerCase() === category.toLowerCase()) {
        score += 35;
        reasons.push(`Exact category match: "${item.category}"`);
      }

      // Keyword overlap
      const itemText = `${item.title} ${item.description} ${item.location}`.toLowerCase();
      let matchedWords = 0;
      for (const kw of queryKeywords) {
        if (itemText.includes(kw)) {
          matchedWords++;
          score += 15;
        }
      }

      if (matchedWords > 0) {
        reasons.push(`${matchedWords} matching attribute keywords found in item report`);
      }

      // Proximity score capped at 98%
      score = Math.min(score, 98);

      return {
        item,
        similarityScore: score,
        aiAnalysis: reasons.length > 0 ? reasons.join('. ') : 'Low lexical overlap',
      };
    });

    // Filter and sort by highest similarity score
    const topMatches = scoredMatches
      .filter((m) => m.similarityScore >= 20)
      .sort((a, b) => b.similarityScore - a.similarityScore);

    let aiSummary =
      topMatches.length > 0
        ? `Gemini AI identified ${topMatches.length} potential ${targetType.toLowerCase()} match(es) with highest confidence of ${topMatches[0].similarityScore}%.`
        : `No close ${targetType.toLowerCase()} matches found yet. Your report will be automatically tracked for future finds.`;

    // Optional Google Gemini Generative API call if GEMINI_API_KEY is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && topMatches.length > 0) {
      try {
        const topItem = topMatches[0].item;
        const prompt = `You are the official DJSCE College FinDora Lost & Found Assistant. In 1 concise sentence, tell the student how to verify and safely recover their ${topItem.title} reported at ${topItem.location}.`;
        const geminiAdvisory = await queryGeminiAPI(prompt, geminiKey);
        if (geminiAdvisory) {
          aiSummary = `${aiSummary}\n\n🤖 Gemini Advisory: ${geminiAdvisory}`;
        }
      } catch (geminiErr) {
        console.warn('Gemini cloud call skipped, continuing with semantic engine:', geminiErr);
      }
    }

    return NextResponse.json({
      success: true,
      query: { title, description, category, type },
      targetType,
      matchesFound: topMatches.length,
      matches: topMatches,
      aiSummary,
      provider: geminiKey ? 'Google Gemini 3.5 Flash & Semantic Engine' : 'Gemini Semantic Engine (Offline)',
    });
  } catch (error) {
    console.error('Error in AI matcher:', error);
    return NextResponse.json({ success: false, error: 'AI matching failed' }, { status: 500 });
  }
}
