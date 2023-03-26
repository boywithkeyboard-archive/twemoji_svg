import { optimize } from 'https://esm.sh/svgo@3.0.2?pin=v112'

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
