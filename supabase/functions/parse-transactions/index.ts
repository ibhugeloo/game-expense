import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a data extraction assistant for a gaming expense tracker called LootLog.
Your job is to parse free-form text and extract structured game purchase transactions.

For each transaction you find, return a JSON object with these fields:
- title (string, required): the game or item name
- type (string): one of: game, dlc, skin, battle_pass, currency, loot_box, subscription. Default: "game"
- price (number): the price as a number. Handle comma decimals (29,99 → 29.99). Default: 0
- currency (string): one of: EUR, USD, GBP, JPY. Infer from symbols (€=EUR, $=USD, £=GBP, ¥=JPY). Default: "EUR"
- platform (string): one of: PC, Steam, PS5, PS4, Switch, Xbox Series, Xbox One, Mobile. Default: "PC"
- genre (string): one of: FPS, RPG, MOBA, Racing, Action-Adventure, Rogue-like, Sports, Strategy, Gacha, Card Game, Simulation, Horror, Puzzle, Platformer, Battle Royale, Other. Default: "Other"
- store (string): the store name if mentioned (e.g. Steam, Amazon, Epic Games). Default: ""
- status (string): one of: Backlog, Playing, Completed, Wishlist, Abandoned. Default: "Backlog"
- purchase_date (string): in YYYY-MM-DD format if a date is mentioned. Handle DD/MM/YYYY format. Default: today's date
- notes (string): any extra info. Default: ""

Rules:
- Extract ALL transactions mentioned in the text
- Be generous in interpretation — if something looks like a game purchase, include it
- Handle both French and English input
- For ambiguous currencies, use EUR for French text and USD for English text
- Return ONLY a JSON object with a "transactions" array, no other text

Example output:
{"transactions": [{"title": "Elden Ring", "type": "game", "price": 49.99, "currency": "EUR", "platform": "PS5", "store": "Steam", "status": "Backlog", "purchase_date": "2024-01-15", "genre": "RPG", "notes": ""}]}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const { text, language = 'en' } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing text field' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit input length
    const truncatedText = text.slice(0, 5000);

    const today = new Date().toISOString().split('T')[0];
    const userPrompt = `Language: ${language}\nToday's date: ${today}\n\nText to parse:\n${truncatedText}`;

    // Call Claude API
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API error:', response.status, errorBody);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || '';

    // Parse JSON from response — handle potential markdown fences
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code block
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Parse transactions error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
