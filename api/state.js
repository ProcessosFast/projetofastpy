import { Redis } from '@upstash/redis'

// Cada coleção vira um hash no Redis (py:<coleção>), com um campo por item.
// Assim duas pessoas editando itens diferentes ao mesmo tempo não se sobrescrevem.
const COLLECTIONS = ['checked', 'status', 'deadlines', 'owners', 'choices', 'lists', 'decisions']
const INIT_KEY = 'py:initialized'

// A integração da Vercel pode criar as variáveis com prefixo (ex.: STORAGE_KV_REST_API_URL).
function findEnv(suffixes) {
  const name = Object.keys(process.env).find(
    (key) => suffixes.some((suffix) => key.endsWith(suffix)) && !key.includes('READ_ONLY'),
  )
  return name ? process.env[name] : undefined
}

const url = findEnv(['KV_REST_API_URL', 'REDIS_REST_URL'])
const token = findEnv(['KV_REST_API_TOKEN', 'REDIS_REST_TOKEN'])

const redis = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null

async function readAll() {
  const pipe = redis.pipeline()
  pipe.get(INIT_KEY)
  COLLECTIONS.forEach((c) => pipe.hgetall(`py:${c}`))
  const [initialized, ...hashes] = await pipe.exec()
  const data = {}
  COLLECTIONS.forEach((c, i) => {
    const raw = hashes[i] ?? {}
    data[c] = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, JSON.parse(v)]))
  })
  return { initialized: !!initialized, data }
}

async function applyPatches(patches) {
  const pipe = redis.pipeline()
  let ops = 0
  for (const [collection, items] of Object.entries(patches ?? {})) {
    if (!COLLECTIONS.includes(collection) || typeof items !== 'object' || !items) continue
    const toSet = {}
    const toDel = []
    for (const [key, value] of Object.entries(items)) {
      if (value === null) toDel.push(key)
      else toSet[key] = JSON.stringify(value)
    }
    if (Object.keys(toSet).length) {
      pipe.hset(`py:${collection}`, toSet)
      ops++
    }
    if (toDel.length) {
      pipe.hdel(`py:${collection}`, ...toDel)
      ops++
    }
  }
  if (ops) await pipe.exec()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!redis) {
    // Só os nomes, nunca os valores, para diagnosticar a configuração.
    const names = Object.keys(process.env).filter((k) => /KV|REDIS|UPSTASH/i.test(k))
    return res.status(503).json({ error: 'redis not configured', envNames: names })
  }
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readAll())
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (JSON.stringify(body ?? {}).length > 2_000_000) {
        return res.status(413).json({ error: 'payload too large' })
      }

      if (body?.init) {
        // Só o primeiro navegador a abrir o portal sobe os dados locais.
        const first = await redis.set(INIT_KEY, '1', { nx: true })
        if (first) await applyPatches(body.init)
        return res.status(200).json(await readAll())
      }

      await applyPatches(body?.patches)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: String(error?.message ?? error) })
  }
}
