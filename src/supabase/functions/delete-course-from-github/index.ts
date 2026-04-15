import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { courseId, folderName } = await req.json()
    if (!courseId || !folderName) {
      return new Response(JSON.stringify({ error: 'Missing courseId or folderName' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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
    const githubFolderPath = `public/courses/${folderName}`

    let githubSuccess = false

    try {
      // 1. Get current branch SHA
      const refRes = await fetch(`${baseUrl}/git/refs/heads/${GITHUB_BRANCH}`, { headers: ghHeaders })
      const refData = await refRes.json()
      const baseSha = refData.object?.sha
      if (!baseSha) throw new Error('Could not get branch SHA')

      // 2. Get base tree SHA
      const commitRes = await fetch(`${baseUrl}/git/commits/${baseSha}`, { headers: ghHeaders })
      const commitData = await commitRes.json()
      const baseTreeSha = commitData.tree?.sha
      if (!baseTreeSha) throw new Error('Could not get tree SHA')

      // 3. Get recursive tree to find all files in the folder
      const treeRes = await fetch(`${baseUrl}/git/trees/${baseTreeSha}?recursive=1`, { headers: ghHeaders })
      const treeData = await treeRes.json()

      const filesToDelete = (treeData.tree ?? []).filter((item: { path: string; type: string }) =>
        item.type === 'blob' && item.path.startsWith(githubFolderPath + '/')
      )

      if (filesToDelete.length > 0) {
        // 4. Create new tree with sha: null to delete each file
        const deletionEntries = filesToDelete.map((item: { path: string }) => ({
          path: item.path,
          mode: '100644',
          type: 'blob',
          sha: null,
        }))

        const newTreeRes = await fetch(`${baseUrl}/git/trees`, {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({ base_tree: baseTreeSha, tree: deletionEntries }),
        })
        const newTree = await newTreeRes.json()
        if (!newTree.sha) throw new Error('Could not create deletion tree')

        // 5. Create commit
        const newCommitRes = await fetch(`${baseUrl}/git/commits`, {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({
            message: `chore: remove course "${folderName}"`,
            tree: newTree.sha,
            parents: [baseSha],
          }),
        })
        const newCommit = await newCommitRes.json()
        if (!newCommit.sha) throw new Error('Could not create commit')

        // 6. Update branch ref
        await fetch(`${baseUrl}/git/refs/heads/${GITHUB_BRANCH}`, {
          method: 'PATCH',
          headers: ghHeaders,
          body: JSON.stringify({ sha: newCommit.sha }),
        })
      }

      githubSuccess = true
    } catch (githubErr) {
      // GitHub failed — log and continue with DB deletion
      console.error('GitHub deletion failed (continuing with DB delete):', githubErr)
    }

    // 7. Delete course from DB (always, even if GitHub failed)
    const { error: deleteError } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (deleteError) throw deleteError

    return new Response(
      JSON.stringify({ success: true, githubSuccess }),
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
