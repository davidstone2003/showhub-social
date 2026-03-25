import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert at reading livestock show results. Given text (or an image of a show result post), extract structured data.

A single post may describe MULTIPLE wins/results. Extract ALL of them as separate entries.

RULES:
- Only extract values you are confident about. Leave uncertain fields as empty strings.
- Do NOT guess or hallucinate values.
- For show_name, include the year if visible (e.g. "2025 San Angelo Livestock Show").
- For win_placing, use the exact placement text (e.g. "Grand Champion Market Lamb", "3rd Overall").
- For shown_by, placed_by, sired_by, dam — use the names as written, preserving original spelling and capitalization.
- caption should contain any remaining descriptive text not captured by other fields.
- CRITICAL: For the caption field, preserve the EXACT original order of all content. Do NOT rearrange, summarize, combine, or reword. Copy text verbatim in the same sequence it appeared in the source.
- If you detect multiple wins (e.g. "Grand Champion AND Reserve Champion" or multiple animals/exhibitors), return each as a separate entry in the results array.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { text, imageBase64, mimeType } = await req.json();

    if (!text && !imageBase64) {
      return new Response(JSON.stringify({ error: "Provide text or imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent: any[] = [];

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` },
      });
      userContent.push({
        type: "text",
        text: "Extract ALL livestock show winner details from this image. If there are multiple wins, return each as a separate entry. Return ONLY the JSON tool call.",
      });
    } else {
      userContent.push({
        type: "text",
        text: `Extract ALL livestock show winner details from this text. If there are multiple wins, return each as a separate entry:\n\n${text}\n\nReturn ONLY the JSON tool call.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: imageBase64 ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_winners",
              description: "Extract structured winner data from livestock show content. Supports multiple results.",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    description: "Array of winner results found in the content",
                    items: {
                      type: "object",
                      properties: {
                        show_name: { type: "string", description: "Show name with year" },
                        win_placing: { type: "string", description: "Placement or title won" },
                        shown_by: { type: "string", description: "Exhibitor name" },
                        placed_by: { type: "string", description: "Person who placed/fitted the animal" },
                        sired_by: { type: "string", description: "Sire name" },
                        dam: { type: "string", description: "Dam name" },
                        caption: { type: "string", description: "Any remaining descriptive text" },
                      },
                      required: ["show_name", "win_placing", "shown_by", "placed_by", "sired_by", "dam", "caption"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_winners" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI extraction failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI could not extract data" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const results = parsed.results || [];

    // Backwards compatibility: also return single `extracted` if only one result
    return new Response(JSON.stringify({ 
      results,
      extracted: results[0] || null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-winner error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
