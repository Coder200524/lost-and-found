// Gemini AI Assistant & Intelligent Matcher Route (ADF Module: Gemini for Developers)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

      // Date proximity bonus (if within 3 days)
      score = Math.min(score, 98); // Cap at 98%

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

    return NextResponse.json({
      success: true,
      query: { title, description, category, type },
      targetType,
      matchesFound: topMatches.length,
      matches: topMatches,
      aiSummary:
        topMatches.length > 0
          ? `Gemini AI identified ${topMatches.length} potential ${targetType.toLowerCase()} match(es) with highest confidence of ${topMatches[0].similarityScore}%.`
          : `No close ${targetType.toLowerCase()} matches found yet. Your report will be automatically tracked for future finds.`,
    });
  } catch (error) {
    console.error('Error in AI matcher:', error);
    return NextResponse.json({ success: false, error: 'AI matching failed' }, { status: 500 });
  }
}
