import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileEntry {
  path: string
  content: string // base64
}

interface RequestBody {
  files: FileEntry[]
  folderName: string
  title: string
  subtitle?: string
  type: string
  entryPoint?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify admin role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body: RequestBody = await req.json()
    const { files, folderName, title, subtitle, type, entryPoint = 'content/index.html' } = body

    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')!
    const GITHUB_OWNER = Deno.env.get('GITHUB_OWNER')!
    const GITHUB_REPO = Deno.env.get('GITHUB_REPO')!
    const GITHUB_BRANCH = Deno.env.get('GITHUB_BRANCH') ?? 'main'

    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'super-novae-courses',
    }
    const baseUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`

    // 1. Get current branch SHA
    const refRes = await fetch(`${baseUrl}/git/refs/heads/${GITHUB_BRANCH}`, { headers: ghHeaders })
    const refData = await refRes.json()
    const baseSha = refData.object.sha

    // 2. Get base tree SHA
    const commitRes = await fetch(`${baseUrl}/git/commits/${baseSha}`, { headers: ghHeaders })
    const commitData = await commitRes.json()
    const baseTreeSha = commitData.tree.sha

    // 3. Create blobs for each file
    const treeEntries = []
    for (const file of files) {
      const blobRes = await fetch(`${baseUrl}/git/blobs`, {
        method: 'POST',
        headers: ghHeaders,
        body: JSON.stringify({ content: file.content, encoding: 'base64' }),
      })
      const blob = await blobRes.json()
      treeEntries.push({
        path: `public/courses/${folderName}/${file.path}`,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      })
    }

    // 4. Create new tree
    const treeRes = await fetch(`${baseUrl}/git/trees`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
    })
    const tree = await treeRes.json()

    // 5. Create commit
    const commitCreateRes = await fetch(`${baseUrl}/git/commits`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `feat: add course "${title}" (${folderName})`,
        tree: tree.sha,
        parents: [baseSha],
      }),
    })
    const newCommit = await commitCreateRes.json()

    // 6. Update branch ref
    await fetch(`${baseUrl}/git/refs/heads/${GITHUB_BRANCH}`, {
      method: 'PATCH',
      headers: ghHeaders,
      body: JSON.stringify({ sha: newCommit.sha }),
    })

    // 7. Insert course into DB
    const courseUrl = `/courses/${folderName}/${entryPoint}`
    const { data: course, error: insertError } = await supabaseAdmin
      .from('courses')
      .insert({
        title,
        subtitle: subtitle || null,
        type,
        source_type: 'zip',
        url: courseUrl,
        github_path: `public/courses/${folderName}`,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ success: true, url: courseUrl, course }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err.message ?? 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
