import { gray, white } from 'https://deno.land/std@v0.184.0/fmt/colors.ts'
import { ensureDir } from 'https://deno.land/std@v0.184.0/fs/ensure_dir.ts'
import { log } from 'https://deno.land/x/drgn@v0.10.2/mod.ts'

async function getEmojis() {
  const tags = await (await fetch(
    'https://api.github.com/repos/jdecked/twemoji/tags',
  )).json()

  const result = await (await fetch(
    `https://api.github.com/repos/jdecked/twemoji/git/trees/${tags[0].name}`,
  )).json()

  const sha1 =
    // deno-lint-ignore no-explicit-any
    (result.tree as Array<any>).find((item) => item.path === 'assets').sha

  const assets = await (await fetch(
    `https://api.github.com/repos/jdecked/twemoji/git/trees/${sha1}`,
  )).json()

  const sha2 =
    // deno-lint-ignore no-explicit-any
    (assets.tree as Array<any>).find((item) => item.path === 'svg').sha

  const emojis = await (await fetch(
    `https://api.github.com/repos/jdecked/twemoji/git/trees/${sha2}`,
  )).json()

  return emojis.tree as { path: string; [key: string]: unknown }[]
}

await ensureDir('./files')

let workers: Worker[] = []
let threads = 10

while (threads--) {
  workers = [
    new Worker(new URL('./worker.ts', import.meta.url).href, {
      type: 'module',
    }),
    ...workers,
  ]
}

const emojis = await getEmojis()

const amountOfEmojis = emojis.length
let emojisProcessed = 0

for (const worker of workers) {
  worker.onmessage = async () => {
    emojisProcessed++

    await log(
      gray(
        `downloading svg... ${
          white(`${Math.round((emojisProcessed / amountOfEmojis) * 100)}%`)
        }`,
      ),
      { clear: true },
    )
  }
}

threads = 10

let workerNumber = 0

while (emojis.length > 0) {
  const chunk = emojis.splice(0, Math.round(amountOfEmojis / threads) + 1)

  if (workerNumber === 10) {
    workerNumber = 0
  }

  workers[workerNumber].postMessage({
    emojis: chunk,
  })

  workerNumber++
}
