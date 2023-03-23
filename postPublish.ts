for await (const entry of Deno.readDir('./files')) {
  await Deno.remove(`./${entry.name}`)
}
