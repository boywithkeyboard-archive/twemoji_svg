import { optimize } from 'svgo'

self.onmessage = async ({ data }) => {
  for (const { path } of data.emojis) {
    self.postMessage({})

    const response = await fetch(
      `https://raw.githubusercontent.com/jdecked/twemoji/main/assets/svg/${path}`,
    )

    Deno.writeTextFile(
      `./files/${path}`,
      optimize(await response.text()).data,
    )
  }

  self.close()
}
